use sqlx::SqlitePool;

use crate::models::category::{Category, CreateCategory, UpdateCategory};
use crate::utils::{escape_like, normalize_date_query};

pub struct CategoryRepository;

impl CategoryRepository {
    pub async fn find_all(pool: &SqlitePool, q: String) -> Result<Vec<Category>, sqlx::Error> {
        let q = q.trim();
        let search = format!("%{}%", escape_like(q));
        let date_pattern = match normalize_date_query(q) {
            Some(iso) => format!("{}%", iso),
            None => search.clone(),
        };

        let categories = sqlx::query_as::<_, Category>(
            r#"
                SELECT * FROM category WHERE 
                    name LIKE ? ESCAPE '\'
                    OR description LIKE ? ESCAPE '\'
                    OR created_at LIKE ? ESCAPE '\'
                    ORDER BY created_at DESC
                "#,
        )
        .bind(&search)
        .bind(&search)
        .bind(date_pattern)
        .fetch_all(pool)
        .await?;

        Ok(categories)
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<Category, sqlx::Error> {
        let category = sqlx::query_as::<_, Category>(
            r#"
                SELECT * FROM category WHERE id = ?
                "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(category)
    }

    pub async fn find_name(pool: &SqlitePool, name: &str) -> Result<Category, sqlx::Error> {
        let category = sqlx::query_as::<_, Category>(
            r#"
                SELECT * FROM category WHERE name = ? COLLATE NOCASE
                "#,
        )
        .bind(name)
        .fetch_one(pool)
        .await?;

        Ok(category)
    }

    pub async fn create(pool: &SqlitePool, data: CreateCategory) -> Result<Category, sqlx::Error> {
        sqlx::query_as::<_, Category>(
            r#"
            INSERT INTO category (
                name,
                description,
                image
            )
            VALUES (?, ?, ?)

            RETURNING
                id,
                name,
                description,
                image,
                created_at
            "#,
        )
        .bind(data.name)
        .bind(data.description)
        .bind(data.image)
        .fetch_one(pool)
        .await
    }

    pub async fn update(
        pool: &SqlitePool,
        id: i64,
        data: UpdateCategory,
    ) -> Result<Category, sqlx::Error> {
        sqlx::query_as::<_, Category>(
            r#"
            UPDATE category SET name = ?, description = ?, image = ? WHERE id = ?

            RETURNING
                id,
                name,
                description,
                image,
                created_at
            "#,
        )
        .bind(data.name)
        .bind(data.description)
        .bind(data.image)
        .bind(id)
        .fetch_one(pool)
        .await
    }
}
