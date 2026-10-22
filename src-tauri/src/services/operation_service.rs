use sqlx::SqlitePool;

use crate::{
    models::operation::{
        CreateOperation, InputCreateOperation, Operation, OperationQueryParams, PaginatedOperations,
    },
    repositories::{
        operation_repository::OperationRepository, product_repository::ProductRepository,
    },
};

pub struct OperationService;

impl OperationService {
    pub async fn find_all(
        pool: &SqlitePool,
        params: OperationQueryParams,
    ) -> Result<PaginatedOperations, String> {
        let limit = params.limit.unwrap_or(10).clamp(1, 100);

        let current_page = params.current_page.unwrap_or(1).max(1);

        let q = params.q.unwrap_or_default().trim().to_string();

        OperationRepository::find_all(pool, &q, limit, current_page)
            .await
            .map_err(|error| error.to_string())
    }

    /**
     * Registro de una operación
     */
    pub async fn create(
        pool: &SqlitePool,
        data: InputCreateOperation,
    ) -> Result<Operation, String> {
        if data.product_id <= 0 {
            return Err("El ID del producto no es válido".to_string());
        }

        let product = match ProductRepository::find_one(pool, data.product_id).await {
            Ok(prod) => prod,
            Err(sqlx::Error::RowNotFound) => {
                return Err(format!("El producto con ID {} no existe", data.product_id));
            }
            Err(error) => {
                return Err(format!("Error al verificar el producto: {}", error));
            }
        };
        //Si es una operacion de entrada, el precio se indica como compra a proveedor
        let unit_price: i64 = if data.operation_type_id == 1 {
            product.price_in
        } else {
            product.price_shop
        };

        let operation_data = CreateOperation {
            product_id: data.product_id,
            q: data.q,
            price: unit_price,
            operation_type_id: data.operation_type_id,
            sell_id: data.sell_id,
            description: data.description,
        };

        OperationRepository::create(pool, operation_data)
            .await
            .map_err(|error| error.to_string())
    }
}
