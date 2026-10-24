use sqlx::{Executor, Sqlite, SqlitePool};

use crate::models::lot::{CreateLot, Lot, PaginatedLots, UpdateLot};
use crate::utils::{escape_like, normalize_date_query};

/// Cláusula WHERE compartida por el conteo y el listado de lotes de un producto.
/// Se define como macro para poder componerla con `concat!` y obtener un
/// `&'static str` (sqlx 0.9 solo acepta SQL estático).
/// Parámetros: ?1 = product_id, ?2 = q crudo, ?3 = patrón texto, ?4 = patrón fecha
macro_rules! lot_search_filter {
    () => {
        r#"WHERE product_id = ?1
            AND (
                ?2 = ''
                OR lot_num LIKE ?3 ESCAPE '\'
                OR expiration_date LIKE ?4 ESCAPE '\'
                OR date_entry LIKE ?4 ESCAPE '\'
                OR CAST(stock AS TEXT) = ?2
            )"#
    };
}

/// Cláusula WHERE general para búsqueda global de lotes sin filtro obligatorio de producto.
/// Parámetros: ?1 = q crudo, ?2 = patrón texto, ?3 = patrón fecha
macro_rules! lot_global_search_filter {
    () => {
        r#"WHERE
            ?1 = ''
            OR lot_num LIKE ?2 ESCAPE '\'
            OR expiration_date LIKE ?3 ESCAPE '\'
            OR date_entry LIKE ?3 ESCAPE '\'
            OR CAST(stock AS TEXT) = ?1"#
    };
}

pub struct LotRepository;

impl LotRepository {
    /// Lista paginada de todos los lotes con búsqueda por número de lote, fechas o stock.
    pub async fn find_all(
        pool: &SqlitePool,
        q: &str,
        limit: i64,
        current_page: i64,
    ) -> Result<PaginatedLots, sqlx::Error> {
        let offset = (current_page - 1) * limit;

        let q = q.trim();
        let text_pattern = format!("%{}%", escape_like(q));
        let date_pattern = match normalize_date_query(q) {
            Some(iso) => format!("{}%", iso),
            None => text_pattern.clone(),
        };

        let total: i64 =
            sqlx::query_scalar(concat!("SELECT COUNT(*) FROM lot ", lot_global_search_filter!()))
                .bind(q)
                .bind(&text_pattern)
                .bind(&date_pattern)
                .fetch_one(pool)
                .await?;

        let lots = sqlx::query_as::<_, Lot>(concat!(
            "SELECT * FROM lot ",
            lot_global_search_filter!(),
            " ORDER BY expiration_date DESC, id DESC LIMIT ?4 OFFSET ?5"
        ))
        .bind(q)
        .bind(&text_pattern)
        .bind(&date_pattern)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let total_pages = if total == 0 {
            0
        } else {
            (total + limit - 1) / limit
        };

        Ok(PaginatedLots {
            lots,
            total,
            limit,
            current_page,
            total_pages,
        })
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<Lot, sqlx::Error> {
        let lot = sqlx::query_as::<_, Lot>(
            r#"
                SELECT * FROM lot WHERE id = ?
                "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(lot)
    }

    /// Obtiene los lotes con stock disponible de un producto ordenados bajo criterio FEFO.
    pub async fn find_lots_by_product(
        pool: &SqlitePool,
        product_id: i64,
    ) -> Result<Vec<Lot>, sqlx::Error> {
        let lots = sqlx::query_as::<_, Lot>(
            r#"
                SELECT * FROM lot WHERE product_id = ? AND stock > 0 ORDER BY expiration_date ASC, id DESC
                "#,
        )
        .bind(product_id)
        .fetch_all(pool)
        .await?;

        Ok(lots)
    }

    pub async fn find_full_lots_by_product(
        pool: &SqlitePool,
        product_id: i64,
        q: String,
        limit: i64,
        current_page: i64,
    ) -> Result<PaginatedLots, sqlx::Error> {
        let offset = (current_page - 1) * limit;

        let q = q.trim();
        // Texto libre: coincidencia parcial en número de lote (escapando comodines de LIKE)
        let text_pattern = format!("%{}%", escape_like(q));
        // Fecha normalizada con chrono (DD/MM/YYYY -> YYYY-MM-DD%, MM/YYYY -> YYYY-MM%, etc.)
        let date_pattern = match normalize_date_query(q) {
            Some(iso) => format!("{}%", iso),
            None => text_pattern.clone(),
        };

        // Filtro común para COUNT y SELECT (definido en `lot_search_filter!`).
        // ?1 = product_id, ?2 = q crudo, ?3 = patrón de texto, ?4 = patrón de fecha

        let total: i64 =
            sqlx::query_scalar(concat!("SELECT COUNT(*) FROM lot ", lot_search_filter!()))
                .bind(product_id)
                .bind(q)
                .bind(&text_pattern)
                .bind(&date_pattern)
                .fetch_one(pool)
                .await?;

        let lots = sqlx::query_as::<_, Lot>(concat!(
            "SELECT * FROM lot ",
            lot_search_filter!(),
            " ORDER BY expiration_date ASC, id DESC LIMIT ?5 OFFSET ?6"
        ))
        .bind(product_id)
        .bind(q)
        .bind(&text_pattern)
        .bind(&date_pattern)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let total_pages = if total == 0 {
            0
        } else {
            (total + limit - 1) / limit
        };

        Ok(PaginatedLots {
            lots,
            total,
            limit,
            current_page,
            total_pages,
        })
    }

    pub async fn count_stock_by_product(
        pool: &SqlitePool,
        product_id: i64,
    ) -> Result<i64, sqlx::Error> {
        let stock: i64 = sqlx::query_scalar(
            r#"
                SELECT COALESCE(SUM(stock), 0) FROM lot WHERE product_id = ? AND stock > 0
                "#,
        )
        .bind(product_id)
        .fetch_one(pool)
        .await?;

        Ok(stock)
    }

    /// Crea un nuevo lote aceptando tanto el pool como una transacción activa.
    pub async fn create<'e, E>(executor: E, data: CreateLot) -> Result<Lot, sqlx::Error>
    where
        E: Executor<'e, Database = Sqlite>,
    {
        sqlx::query_as::<_, Lot>(
            r#"
            INSERT INTO lot (
                product_id,
                lot_num,
                stock,
                expiration_date,
                date_entry
            )
            VALUES (?, ?, ?, ?, ?)

            RETURNING
                id,
                product_id,
                lot_num,
                stock,
                expiration_date,
                date_entry,
                created_at
            "#,
        )
        .bind(data.product_id)
        .bind(data.lot_num)
        .bind(data.stock)
        .bind(data.expiration_date)
        .bind(data.date_entry)
        .fetch_one(executor)
        .await
    }

    /// Actualiza los datos de un lote aceptando tanto el pool como una transacción activa.
    pub async fn update<'e, E>(executor: E, id: i64, data: UpdateLot) -> Result<Lot, sqlx::Error>
    where
        E: Executor<'e, Database = Sqlite>,
    {
        sqlx::query_as::<_, Lot>(
            r#"
            UPDATE lot SET lot_num = ?, stock = ?, expiration_date = ?, date_entry = ? WHERE id = ?

            RETURNING
                id,
                product_id,
                lot_num,
                stock,
                expiration_date,
                date_entry,
                created_at
            "#,
        )
        .bind(data.lot_num)
        .bind(data.stock)
        .bind(data.expiration_date)
        .bind(data.date_entry)
        .bind(id)
        .fetch_one(executor)
        .await
    }

    /// Actualiza únicamente el stock de un lote (compatible con pool o transacción).
    pub async fn update_lot_stock<'e, E>(
        executor: E,
        id: i64,
        stock: i64,
    ) -> Result<bool, String>
    where
        E: Executor<'e, Database = Sqlite>,
    {
        let result = sqlx::query(
            r#"
            UPDATE lot SET stock = ? WHERE id = ?
            "#,
        )
        .bind(stock)
        .bind(id)
        .execute(executor)
        .await
        .map_err(|error| error.to_string())?;

        Ok(result.rows_affected() > 0)
    }
}
