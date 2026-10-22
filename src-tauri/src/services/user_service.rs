use sqlx::SqlitePool;

use crate::{
    models::user::{CreateUser, PaginatedUsers, UpdateUser, User, UserQueryParams},
    repositories::user_repository::UserRepository,
};

pub struct UserService;

impl UserService {
    pub async fn find_all(
        pool: &SqlitePool,
        params: UserQueryParams,
    ) -> Result<PaginatedUsers, String> {
        let limit = params.limit.unwrap_or(10).clamp(1, 100);

        let current_page = params.current_page.unwrap_or(1).max(1);

        let q = params.q.unwrap_or_default().trim().to_string();

        UserRepository::find_all(pool, &q, limit, current_page)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<User, sqlx::Error> {
        UserRepository::find_one(pool, id).await
    }

    pub async fn create(pool: &SqlitePool, data: CreateUser) -> Result<User, sqlx::Error> {
        UserRepository::create(pool, data).await
    }

    pub async fn update(pool: &SqlitePool, id: i64, data: UpdateUser) -> Result<User, sqlx::Error> {
        UserRepository::update(pool, id, data).await
    }

    pub async fn delete(pool: &SqlitePool, id: i64) -> Result<(), String> {
        if id <= 0 {
            return Err("El ID del usuario no es válido".to_string());
        }

        let deleted = UserRepository::delete(pool, id)
            .await
            .map_err(|error| error.to_string())?;

        if !deleted {
            return Err("Usuario no encontrado".to_string());
        }

        Ok(())
    }
}
