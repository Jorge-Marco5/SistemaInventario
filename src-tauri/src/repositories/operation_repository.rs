use sqlx::SqlitePool;

use crate::models::operation::{CreateOperation, Operation, OperationData, PaginatedOperations};
use crate::utils::{escape_like, normalize_date_query};

pub struct OperationRepository;

impl OperationRepository {
    pub async fn find_all(
        pool: &SqlitePool,
        q: &str,
        limit: i64,
        current_page: i64,
    ) -> Result<PaginatedOperations, sqlx::Error> {
        let offset = (current_page - 1) * limit;

        let q = q.trim();
        let search = format!("%{}%", escape_like(q));
        let date_pattern = match normalize_date_query(q) {
            Some(iso) => format!("{}%", iso),
            None => search.clone(),
        };

        let total: i64 = sqlx::query_scalar(
            r#"
                SELECT count(*) FROM operation o
                INNER JOIN operation_type ot ON ot.id = o.operation_type_id 
                INNER JOIN product p ON p.id = o.product_id 
                WHERE
                    p.id LIKE ? ESCAPE '\'
                    OR p.name LIKE ? ESCAPE '\'
                    OR p.barcode LIKE ? ESCAPE '\'
                    OR ot.name LIKE ? ESCAPE '\'
                    OR o.description LIKE ? ESCAPE '\'
                    OR o.created_at LIKE ? ESCAPE '\'
                "#,
        )
        .bind(&search)
        .bind(&search)
        .bind(&search)
        .bind(&search)
        .bind(&search)
        .bind(&date_pattern)
        .fetch_one(pool)
        .await?;

        let operations = sqlx::query_as::<_, OperationData>(
            r#"
                SELECT o.id, o.product_id, p.name as product_name, p.barcode as product_barcode, o.q, o.price, o.operation_type_id, ot.name as operation_name, o.sell_id, o.description, o.created_at FROM operation o
                INNER JOIN operation_type ot ON ot.id = o.operation_type_id 
                INNER JOIN product p ON p.id = o.product_id 
                WHERE
                    p.id LIKE ? ESCAPE '\'
                    OR p.name LIKE ? ESCAPE '\'
                    OR p.barcode LIKE ? ESCAPE '\'
                    OR ot.name LIKE ? ESCAPE '\'
                    OR o.description LIKE ? ESCAPE '\'
                    OR o.created_at LIKE ? ESCAPE '\'
                ORDER BY o.created_at DESC
                LIMIT ?
                OFFSET ?
                "#,
        )
        .bind(&search)
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

        Ok(PaginatedOperations {
            operations,
            total,
            limit,
            current_page,
            total_pages,
        })
    }

    // pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<Operation, sqlx::Error> {
    //     let operation = sqlx::query_as::<_, Operation>(
    //         r#"
    //             SELECT * FROM operation WHERE id = ?
    //             "#,
    //     )
    //     .bind(id)
    //     .fetch_one(pool)
    //     .await?;

    //     Ok(operation)
    // }

    pub async fn create(
        pool: &SqlitePool,
        data: CreateOperation,
    ) -> Result<Operation, sqlx::Error> {
        sqlx::query_as::<_, Operation>(
            r#"
            INSERT INTO operation (
                product_id,
                q,
                price,
                operation_type_id,
                sell_id,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?)

            RETURNING
                id,
                product_id,
                q,
                price,
                operation_type_id,
                sell_id,
                description,
                created_at
            "#,
        )
        .bind(data.product_id)
        .bind(data.q)
        .bind(data.price)
        .bind(data.operation_type_id)
        .bind(data.sell_id)
        .bind(data.description)
        .fetch_one(pool)
        .await
    }
}
