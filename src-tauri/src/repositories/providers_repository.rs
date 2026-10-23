use sqlx::SqlitePool;

use crate::models::provider::{CreateProvider, PaginatedProviders, Provider, UpdateProvider};
use crate::utils::{escape_like, normalize_date_query};

pub struct ProviderRepository;

impl ProviderRepository {
    pub async fn find_all(
        pool: &SqlitePool,
        q: &str,
        limit: i64,
        current_page: i64,
    ) -> Result<PaginatedProviders, sqlx::Error> {
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
                FROM provider
                WHERE
                    is_deleted = 0
                    AND (
                        name LIKE ? ESCAPE '\'
                        OR email1 LIKE ? ESCAPE '\'
                        OR email2 LIKE ? ESCAPE '\'
                        OR phone1 LIKE ? ESCAPE '\'
                        OR phone2 LIKE ? ESCAPE '\'
                        OR created_at LIKE ? ESCAPE '\'
                    )
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

        let providers = sqlx::query_as::<_, Provider>(
            r#"
                SELECT
                    id,
                    name,
                    phone1,
                    phone2,
                    email1,
                    email2,
                    is_deleted,
                    created_at
                FROM provider
                WHERE
                    is_deleted = 0
                    AND (
                        name LIKE ? ESCAPE '\'
                        OR phone1 LIKE ? ESCAPE '\'
                        OR phone2 LIKE ? ESCAPE '\'
                        OR email1 LIKE ? ESCAPE '\'
                        OR email2 LIKE ? ESCAPE '\'
                        OR created_at LIKE ? ESCAPE '\'
                    )
                ORDER BY id DESC
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

        Ok(PaginatedProviders {
            providers,
            total,
            limit,
            current_page,
            total_pages,
        })
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<Provider, sqlx::Error> {
        let provider = sqlx::query_as::<_, Provider>(
            r#"
            SELECT
                id,
                name,
                phone1,
                phone2,
                email1,
                email2,
                is_deleted,
                created_at
            FROM provider
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(provider)
    }

    pub async fn create(pool: &SqlitePool, data: CreateProvider) -> Result<Provider, sqlx::Error> {
        sqlx::query_as::<_, Provider>(
            r#"
            INSERT INTO provider (
                name,
                phone1,
                phone2,
                email1,
                email2
            )
            VALUES (?, ?, ?, ?, ?)

            RETURNING
                id,
                name,
                phone1,
                phone2,
                email1,
                email2,
                is_deleted,
                created_at
            "#,
        )
        .bind(data.name)
        .bind(data.phone1)
        .bind(data.phone2)
        .bind(data.email1)
        .bind(data.email2)
        .fetch_one(pool)
        .await
    }

    pub async fn update(
        pool: &SqlitePool,
        id: i64,
        data: UpdateProvider,
    ) -> Result<Provider, sqlx::Error> {
        sqlx::query_as::<_, Provider>(
            r#"
            UPDATE provider SET name = ?, phone1 = ?, phone2 = ?, email1 = ?, email2 = ? WHERE id = ?

            RETURNING
                id,
                name,
                phone1,
                phone2,
                email1,
                email2,
                is_deleted,
                created_at
            "#,
        )
        .bind(data.name)
        .bind(data.phone1)
        .bind(data.phone2)
        .bind(data.email1)
        .bind(data.email2)
        .bind(id)
        .fetch_one(pool)
        .await
    }

    pub async fn delete(pool: &SqlitePool, id: i64) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(
            r#"
            UPDATE provider
            SET is_deleted = 1
            WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
