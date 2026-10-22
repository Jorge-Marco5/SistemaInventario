use sqlx::SqlitePool;

use crate::{
    models::provider::{
        CreateProvider, PaginatedProviders, Provider, ProviderQueryParams, UpdateProvider,
    },
    repositories::providers_repository::ProviderRepository,
};

pub struct ProviderService;

impl ProviderService {
    pub async fn find_all(
        pool: &SqlitePool,
        params: ProviderQueryParams,
    ) -> Result<PaginatedProviders, String> {
        let limit = params.limit.unwrap_or(10).clamp(1, 100);

        let current_page = params.current_page.unwrap_or(1).max(1);

        let q = params.q.unwrap_or_default().trim().to_string();

        ProviderRepository::find_all(pool, &q, limit, current_page)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<Provider, sqlx::Error> {
        ProviderRepository::find_one(pool, id).await
    }

    pub async fn create(pool: &SqlitePool, data: CreateProvider) -> Result<Provider, sqlx::Error> {
        ProviderRepository::create(pool, data).await
    }

    pub async fn update(
        pool: &SqlitePool,
        id: i64,
        data: UpdateProvider,
    ) -> Result<Provider, sqlx::Error> {
        ProviderRepository::update(pool, id, data).await
    }

    pub async fn delete(pool: &SqlitePool, id: i64) -> Result<(), String> {
        if id <= 0 {
            return Err("El ID del proveedor no es válido".to_string());
        }

        let deleted = ProviderRepository::delete(pool, id)
            .await
            .map_err(|error| error.to_string())?;

        if !deleted {
            return Err("Proveedor no encontrado".to_string());
        }

        Ok(())
    }
}
