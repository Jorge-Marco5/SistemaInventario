use sqlx::SqlitePool;

use crate::{
    models::category::{Category, CreateCategory, UpdateCategory},
    repositories::category_repository::CategoryRepository,
};

pub struct CategoryService;

impl CategoryService {
    pub async fn find_all(pool: &SqlitePool, search: String) -> Result<Vec<Category>, String> {
        CategoryRepository::find_all(pool, search)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<Category, String> {
        CategoryRepository::find_one(pool, id)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn create(pool: &SqlitePool, data: CreateCategory) -> Result<Category, String> {
        let name = data.name.trim();

        if name.is_empty() {
            return Err("El nombre de la categoría no puede estar vacío".to_string());
        }

        // 1. Validar que no exista otra categoría con el mismo nombre
        match CategoryRepository::find_name(pool, name).await {
            Ok(_) => {
                return Err(format!("Ya existe una categoría con el nombre '{}'", name));
            }
            Err(sqlx::Error::RowNotFound) => {
                // No existe categoría con ese nombre, continuamos con la creación
            }
            Err(error) => {
                return Err(format!("Error al verificar la categoría: {}", error));
            }
        }

        // 2. Crear la categoría
        CategoryRepository::create(pool, data)
            .await
            .map_err(|error| error.to_string())
    }

    pub async fn update(
        pool: &SqlitePool,
        id: i64,
        data: UpdateCategory,
    ) -> Result<Category, sqlx::Error> {
        CategoryRepository::update(pool, id, data).await
    }
}
