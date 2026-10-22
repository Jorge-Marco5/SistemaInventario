use sqlx::SqlitePool;

use crate::{
    models::operation_type::OperationType,
    repositories::operation_type_repository::OperationTypeRepository,
};

pub struct OperationTypeService;

impl OperationTypeService {
    pub async fn find_all(pool: &SqlitePool) -> Result<Vec<OperationType>, String> {
        OperationTypeRepository::find_all(pool)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<OperationType, String> {
        // 1. Validar que la categoría exista
        let operations = OperationTypeRepository::find_one(pool, id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("No existe la operacion ")
                }
                _ => format!("Error al verificar la categoría: {}", error),
            })?;

        Ok(operations)
    }
}
