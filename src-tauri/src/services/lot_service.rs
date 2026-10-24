use sqlx::SqlitePool;

use crate::{
    models::{
        lot::{CreateLot, Lot, LotQueryParams, PaginatedLots, UpdateLot},
        operation::CreateOperation,
    },
    repositories::{
        lot_repository::LotRepository, operation_repository::OperationRepository,
        product_repository::ProductRepository,
    },
};

pub struct LotService;

impl LotService {
    pub async fn find_all(
        pool: &SqlitePool,
        params: LotQueryParams,
    ) -> Result<PaginatedLots, String> {
        let limit = params.limit.unwrap_or(10).clamp(1, 100);
        let current_page = params.current_page.unwrap_or(1).max(1);
        let q = params.q.unwrap_or_default().trim().to_string();

        LotRepository::find_all(pool, &q, limit, current_page)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<Lot, String> {
        if id <= 0 {
            return Err("No se indica un lote valido.".to_string());
        }
        LotRepository::find_one(pool, id)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_lots_by_product(
        pool: &SqlitePool,
        product_id: i64,
    ) -> Result<Vec<Lot>, String> {
        if product_id <= 0 {
            return Err("No se indica un producto valido.".to_string());
        }

        LotRepository::find_lots_by_product(pool, product_id)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_full_lots_by_product(
        pool: &SqlitePool,
        product_id: i64,
        params: LotQueryParams,
    ) -> Result<PaginatedLots, String> {
        if product_id <= 0 {
            return Err("No se indica un producto valido.".to_string());
        }

        let limit = params.limit.unwrap_or(10).clamp(1, 100);
        let current_page = params.current_page.unwrap_or(1).max(1);
        let q = params.q.unwrap_or_default().trim().to_string();

        LotRepository::find_full_lots_by_product(pool, product_id, q, limit, current_page)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn count_stock_by_product(
        pool: &SqlitePool,
        product_id: i64,
    ) -> Result<i64, String> {
        if product_id <= 0 {
            return Err("No se indica un producto valido.".to_string());
        }
        LotRepository::count_stock_by_product(pool, product_id)
            .await
            .map_err(|error| error.to_string())
    }

    /// Crea un lote y registra la operación de entrada de forma atómica.
    pub async fn create(pool: &SqlitePool, data: CreateLot) -> Result<Lot, String> {
        if data.stock <= 0 {
            return Err(
                "El stock no puede ingresar con una cantidad menor o igual a cero".to_string(),
            );
        }

        let product = ProductRepository::find_one(pool, data.product_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => "El producto no existe".to_string(),
                _ => format!("Error al verificar el producto: {}", error),
            })?;

        if product.is_active == 0 {
            return Err(
                "El producto está inactivo, no se puede realizar ninguna operación".to_string(),
            );
        }

        let product_id = data.product_id;
        let stock = data.stock;

        // Iniciar transacción para crear el lote y registrar su operación de entrada
        let mut tx = pool
            .begin()
            .await
            .map_err(|error| format!("Error al iniciar transacción: {}", error))?;

        let lot = LotRepository::create(&mut *tx, data)
            .await
            .map_err(|error| error.to_string())?;

        let operation_data = CreateOperation {
            product_id,
            q: stock,
            price: product.price_in, // Precio de compra al proveedor para entradas
            operation_type_id: 1,    // 1 = entrada
            sell_id: None,
            description: Some(format!(
                "Entrada de stock: registro de lote '{}' (ID: {})",
                lot.lot_num, lot.id
            )),
        };

        OperationRepository::create(&mut *tx, operation_data)
            .await
            .map_err(|error| error.to_string())?;

        tx.commit()
            .await
            .map_err(|error| format!("Error al confirmar transacción: {}", error))?;

        Ok(lot)
    }

    /// Actualiza un lote y, si cambió su stock, registra una operación de ajuste en la misma transacción.
    pub async fn update(pool: &SqlitePool, id: i64, data: UpdateLot) -> Result<Lot, String> {
        if id <= 0 {
            return Err("No se indica un lote valido.".to_string());
        }

        let lot_exists = LotRepository::find_one(pool, id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => "EL lote no existe".to_string(),
                _ => "Error al verificar el lote".to_string(),
            })?;

        let product = ProductRepository::find_one(pool, lot_exists.product_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => "El producto no existe".to_string(),
                _ => format!("Error al verificar el producto: {}", error),
            })?;

        if product.is_active == 0 {
            return Err(
                "El producto está inactivo, no se puede realizar ninguna operación".to_string(),
            );
        }

        let stock = data.stock;

        // Iniciar transacción para actualizar lote y registrar ajuste si corresponde
        let mut tx = pool
            .begin()
            .await
            .map_err(|error| format!("Error al iniciar transacción: {}", error))?;

        let lot = LotRepository::update(&mut *tx, id, data)
            .await
            .map_err(|error| error.to_string())?;

        if lot_exists.stock != stock {
            let operation_data = CreateOperation {
                product_id: lot_exists.product_id,
                q: stock,
                price: product.price_shop,
                operation_type_id: 3, // 3 = ajuste
                sell_id: None,
                description: Some(format!(
                    "Ajuste manual de stock en lote '{}' (ID: {}): {} -> {} uds",
                    lot.lot_num, lot.id, lot_exists.stock, stock
                )),
            };

            OperationRepository::create(&mut *tx, operation_data)
                .await
                .map_err(|error| error.to_string())?;
        }

        tx.commit()
            .await
            .map_err(|error| format!("Error al confirmar transacción: {}", error))?;

        Ok(lot)
    }
}
