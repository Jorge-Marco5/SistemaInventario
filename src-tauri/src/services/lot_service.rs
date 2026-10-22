use sqlx::SqlitePool;

use crate::{
    models::{
        lot::{CreateLot, Lot, LotQueryParams, PaginatedLots, UpdateLot},
        operation::InputCreateOperation,
    },
    repositories::{lot_repository::LotRepository, product_repository::ProductRepository},
    services::operation_service::OperationService,
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

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<Lot, sqlx::Error> {
        LotRepository::find_one(pool, id).await
    }

    pub async fn find_lots_by_product(
        pool: &SqlitePool,
        product_id: i64,
    ) -> Result<Vec<Lot>, String> {
        LotRepository::find_lots_by_product(pool, product_id)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_full_lots_by_product(
        pool: &SqlitePool,
        product_id: i64,
        params: LotQueryParams,
    ) -> Result<PaginatedLots, String> {
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
    ) -> Result<i64, sqlx::Error> {
        LotRepository::count_stock_by_product(pool, product_id).await
    }

    pub async fn create(pool: &SqlitePool, data: CreateLot) -> Result<Lot, String> {
        if data.stock <= 0 {
            return Err(
                "El stock no puede ingresar con una cantidad menor o igual a cero".to_string(),
            );
        }
        ProductRepository::find_one(pool, data.product_id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("El producto no existe")
                }
                _ => format!("Error al verificar el producto: {}", error),
            })?;

        let product_id = data.product_id;
        let stock = data.stock;

        let lot = LotRepository::create(pool, data)
            .await
            .map_err(|error| error.to_string())?;

        let operation_data = InputCreateOperation {
            product_id,
            q: stock,
            operation_type_id: 1, //entrada
            sell_id: None,
            description: Some(format!(
                "Entrada de stock: registro de lote '{}' (ID: {})",
                lot.lot_num, lot.id
            )),
        };

        OperationService::create(pool, operation_data)
            .await
            .map_err(|error| error.to_string())?;

        Ok(lot)
    }

    pub async fn update(pool: &SqlitePool, id: i64, data: UpdateLot) -> Result<Lot, String> {
        let lot_exists = LotRepository::find_one(pool, id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => {
                    format!("EL lote no existe")
                }
                _ => format!("Error al verificar el lote"),
            })?;

        let stock = data.stock;
        let lot = LotRepository::update(pool, id, data)
            .await
            .map_err(|error| error.to_string())?;

        if lot_exists.stock != stock {
            let operation_data = InputCreateOperation {
                product_id: lot_exists.product_id,
                q: stock,
                operation_type_id: 3, //ajuste
                sell_id: None,
                description: Some(format!(
                    "Ajuste manual de stock en lote '{}' (ID: {}): {} -> {} uds",
                    lot.lot_num, lot.id, lot_exists.stock, stock
                )),
            };

            OperationService::create(pool, operation_data)
                .await
                .map_err(|error| error.to_string())?;
        }

        Ok(lot)
    }
}
