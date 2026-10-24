use sqlx::SqlitePool;

use crate::models::product::{
    CreateProduct, PaginatedProducts, PaginatedProductsFull, Product, ProductFull, UpdateProduct,
};
use crate::utils::{escape_like, normalize_date_query};

pub struct ProductRepository;

impl ProductRepository {
    /// Obtiene una lista paginada de productos activos con su categoría y suma de stock total.
    pub async fn find_all(
        pool: &SqlitePool,
        q: &str,
        limit: i64,
        current_page: i64,
    ) -> Result<PaginatedProductsFull, sqlx::Error> {
        let offset = (current_page - 1) * limit;

        let q = q.trim();
        let search = format!("%{}%", escape_like(q));
        let date_pattern = match normalize_date_query(q) {
            Some(iso) => format!("{}%", iso),
            None => search.clone(),
        };

        let total: i64 = sqlx::query_scalar(
            r#"
                SELECT COUNT(*)
                FROM product p
                INNER JOIN category c on c.id = p.category_id
                WHERE
                    p.is_deleted = 0
                    AND (
                        p.name LIKE ? ESCAPE '\'
                        OR p.barcode LIKE ? ESCAPE '\'
                        OR p.description LIKE ? ESCAPE '\'
                        OR c.name LIKE ? ESCAPE '\'
                        OR p.created_at LIKE ? ESCAPE '\'
                    )
                "#,
        )
        .bind(&search)
        .bind(&search)
        .bind(&search)
        .bind(&search)
        .bind(&date_pattern)
        .fetch_one(pool)
        .await?;

        // Se utiliza COALESCE para garantizar que stock_total sea 0 cuando no existen lotes
        let products_full = sqlx::query_as::<_, ProductFull>(
            r#"
                SELECT 
                p.id,
                p.image,
                p.barcode,
                p.name,
                p.description,
                p.stock_min,
                COALESCE(SUM(l.stock), 0) as stock_total,
                p.price_in,
                p.price_shop,
                p.unit,
                p.presentation,
                p.provider_id,
                p.category_id,
                c.name as category_name,
                p.is_active,
                p.is_deleted,
                p.created_at
                FROM product p
                INNER JOIN category c on c.id = p.category_id
                LEFT JOIN lot l ON l.product_id = p.id
                WHERE
                    p.is_deleted = 0
                    AND (
                        p.name LIKE ? ESCAPE '\'
                        OR p.barcode LIKE ? ESCAPE '\'
                        OR p.description LIKE ? ESCAPE '\'
                        OR c.name LIKE ? ESCAPE '\'
                        OR p.created_at LIKE ? ESCAPE '\'
                    )
                GROUP BY p.id, p.name
                ORDER BY p.id DESC
                LIMIT ?
                OFFSET ?
                "#,
        )
        .bind(&search)
        .bind(&search)
        .bind(&search)
        .bind(&search)
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

        Ok(PaginatedProductsFull {
            products_full,
            total,
            limit,
            current_page,
            total_pages,
        })
    }

    /// Obtiene un producto por ID junto con su stock total agrupado por producto.
    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<ProductFull, sqlx::Error> {
        let product = sqlx::query_as::<_, ProductFull>(
            r#"
            SELECT
                p.id,
                p.image,
                p.barcode,
                p.name,
                p.description,
                p.stock_min,
                COALESCE(st.stock_total, 0) as stock_total,
                p.price_in,
                p.price_shop,
                p.unit,
                p.presentation,
                p.provider_id,
                p.category_id,
                p.is_active,
                p.is_deleted,
                p.created_at
            FROM product p
            LEFT JOIN (
                SELECT COALESCE(SUM(stock), 0) as stock_total, product_id
                FROM lot
                WHERE stock > 0
                GROUP BY product_id
            ) as st ON p.id = st.product_id
            WHERE p.id = ? AND p.is_deleted = 0
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(product)
    }

    /// Busca un producto no eliminado por su código de barras.
    pub async fn find_by_barcode(
        pool: &SqlitePool,
        barcode: String,
    ) -> Result<Product, sqlx::Error> {
        let product = sqlx::query_as::<_, Product>(
            r#"
            SELECT * FROM product
            WHERE barcode = ? AND is_deleted = 0
            "#,
        )
        .bind(barcode)
        .fetch_one(pool)
        .await?;

        Ok(product)
    }

    pub async fn find_by_category(
        pool: &SqlitePool,
        category_id: i64,
        q: &str,
        limit: i64,
        current_page: i64,
    ) -> Result<PaginatedProducts, sqlx::Error> {
        let offset = (current_page - 1) * limit;

        let q = q.trim();
        let search = format!("%{}%", escape_like(q));
        let date_pattern = match normalize_date_query(q) {
            Some(iso) => format!("{}%", iso),
            None => search.clone(),
        };

        let total: i64 = sqlx::query_scalar(
            r#"
                SELECT COUNT(*)
                FROM product
                WHERE is_deleted = 0
                    AND category_id = ? 
                    AND (name LIKE ? ESCAPE '\'
                    OR barcode LIKE ? ESCAPE '\'
                    OR description LIKE ? ESCAPE '\'
                    OR created_at LIKE ? ESCAPE '\')
                "#,
        )
        .bind(category_id)
        .bind(&search)
        .bind(&search)
        .bind(&search)
        .bind(&date_pattern)
        .fetch_one(pool)
        .await?;

        let products = sqlx::query_as::<_, Product>(
            r#"
                SELECT 
                id,
                image,
                barcode,
                name,
                description,
                stock_min,
                price_in,
                price_shop,
                unit,
                presentation,
                provider_id,
                category_id,
                is_active,
                is_deleted,
                created_at
                FROM product
                WHERE
                    is_deleted = 0
                    AND category_id = ?
                    AND (name LIKE ? ESCAPE '\'
                    OR barcode LIKE ? ESCAPE '\'
                    OR description LIKE ? ESCAPE '\'
                    OR created_at LIKE ? ESCAPE '\')
                ORDER BY id DESC
                LIMIT ?
                OFFSET ?
                "#,
        )
        .bind(category_id)
        .bind(&search)
        .bind(&search)
        .bind(&search)
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

        Ok(PaginatedProducts {
            products,
            total,
            limit,
            current_page,
            total_pages,
        })
    }

    pub async fn find_by_provider(
        pool: &SqlitePool,
        provider_id: i64,
        q: &str,
        limit: i64,
        current_page: i64,
    ) -> Result<PaginatedProducts, sqlx::Error> {
        let offset = (current_page - 1) * limit;

        let q = q.trim();
        let search = format!("%{}%", escape_like(q));
        let date_pattern = match normalize_date_query(q) {
            Some(iso) => format!("{}%", iso),
            None => search.clone(),
        };

        let total: i64 = sqlx::query_scalar(
            r#"
                SELECT COUNT(*)
                FROM product
                WHERE is_deleted = 0
                    AND provider_id = ? 
                    AND (name LIKE ? ESCAPE '\'
                    OR barcode LIKE ? ESCAPE '\'
                    OR description LIKE ? ESCAPE '\'
                    OR created_at LIKE ? ESCAPE '\')
                "#,
        )
        .bind(provider_id)
        .bind(&search)
        .bind(&search)
        .bind(&search)
        .bind(&date_pattern)
        .fetch_one(pool)
        .await?;

        let products = sqlx::query_as::<_, Product>(
            r#"
                SELECT 
                id,
                image,
                barcode,
                name,
                description,
                stock_min,
                price_in,
                price_shop,
                unit,
                presentation,
                provider_id,
                category_id,
                is_active,
                is_deleted,
                created_at
                FROM product
                WHERE
                    is_deleted = 0
                    AND provider_id = ?
                    AND (name LIKE ? ESCAPE '\'
                    OR barcode LIKE ? ESCAPE '\'
                    OR description LIKE ? ESCAPE '\'
                    OR created_at LIKE ? ESCAPE '\')
                ORDER BY id DESC
                LIMIT ?
                OFFSET ?
                "#,
        )
        .bind(provider_id)
        .bind(&search)
        .bind(&search)
        .bind(&search)
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

        Ok(PaginatedProducts {
            products,
            total,
            limit,
            current_page,
            total_pages,
        })
    }

    pub async fn create(pool: &SqlitePool, data: CreateProduct) -> Result<Product, sqlx::Error> {
        sqlx::query_as::<_, Product>(
            r#"
            INSERT INTO product (
                image,
                barcode,
                name,
                description,
                stock_min,
                price_in,
                price_shop,
                unit,
                presentation,
                provider_id,
                category_id,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

            RETURNING
                id,
                image,
                barcode,
                name,
                description,
                stock_min,
                price_in,
                price_shop,
                unit,
                presentation,
                provider_id,
                category_id,
                is_active,
                is_deleted,
                created_at
            "#,
        )
        .bind(data.image)
        .bind(data.barcode)
        .bind(data.name)
        .bind(data.description)
        .bind(data.stock_min)
        .bind(data.price_in)
        .bind(data.price_shop)
        .bind(data.unit)
        .bind(data.presentation)
        .bind(data.provider_id)
        .bind(data.category_id)
        .bind(data.is_active)
        .fetch_one(pool)
        .await
    }

    pub async fn update(
        pool: &SqlitePool,
        id: i64,
        data: UpdateProduct,
    ) -> Result<Product, sqlx::Error> {
        sqlx::query_as::<_, Product>(
            r#"
            UPDATE product SET image = ?,
                barcode = ?,
                name = ?,
                description = ?,
                stock_min = ?,
                price_in = ?,
                price_shop = ?,
                unit = ?,
                presentation = ?,
                provider_id = ?,
                category_id = ?,
                is_active = ?
                WHERE id = ?

            RETURNING
                id,
                image,
                barcode,
                name,
                description,
                stock_min,
                price_in,
                price_shop,
                unit,
                presentation,
                provider_id,
                category_id,
                is_active,
                is_deleted,
                created_at
            "#,
        )
        .bind(data.image)
        .bind(data.barcode)
        .bind(data.name)
        .bind(data.description)
        .bind(data.stock_min)
        .bind(data.price_in)
        .bind(data.price_shop)
        .bind(data.unit)
        .bind(data.presentation)
        .bind(data.provider_id)
        .bind(data.category_id)
        .bind(data.is_active)
        .bind(id)
        .fetch_one(pool)
        .await
    }

    pub async fn delete(pool: &SqlitePool, id: i64) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(
            r#"
            UPDATE product
            SET is_deleted = 1, is_active = 0
            WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
