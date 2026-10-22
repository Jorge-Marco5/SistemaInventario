use sqlx::SqlitePool;

use crate::models::operation_type::OperationType;

pub struct OperationTypeRepository;

impl OperationTypeRepository {
    pub async fn find_all(pool: &SqlitePool) -> Result<Vec<OperationType>, sqlx::Error> {
        let operation_types = sqlx::query_as::<_, OperationType>(
            r#"
                SELECT * FROM operation_type
                "#,
        )
        .fetch_all(pool)
        .await?;

        Ok(operation_types)
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<OperationType, sqlx::Error> {
        let operation_type = sqlx::query_as::<_, OperationType>(
            r#"
                SELECT * FROM operation_type WHERE id = ?
                "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(operation_type)
    }
}
