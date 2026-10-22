use sqlx::SqlitePool;

use crate::models::user::{CreateUser, PaginatedUsers, UpdateUser, User};

pub struct UserRepository;

impl UserRepository {
    pub async fn find_all(
        pool: &SqlitePool,
        q: &str,
        limit: i64,
        current_page: i64,
    ) -> Result<PaginatedUsers, sqlx::Error> {
        let offset = (current_page - 1) * limit;

        let search = format!("%{}%", q);

        let total: i64 = sqlx::query_scalar(
            r#"
                SELECT COUNT(*)
                FROM users
                WHERE
                    username LIKE ?
                    OR email LIKE ?
                "#,
        )
        .bind(&search)
        .bind(&search)
        .fetch_one(pool)
        .await?;

        let users = sqlx::query_as::<_, User>(
            r#"
                SELECT
                    id,
                    username,
                    email,
                    created_at
                FROM users
                WHERE
                    username LIKE ?
                    OR email LIKE ?
                ORDER BY id DESC
                LIMIT ?
                OFFSET ?
                "#,
        )
        .bind(&search)
        .bind(&search)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let total_pages = if total == 0 {
            0
        } else {
            (total + limit - 1) / limit
        };

        Ok(PaginatedUsers {
            users,
            total,
            limit,
            current_page,
            total_pages,
        })
    }

    pub async fn find_one(pool: &SqlitePool, id: i64) -> Result<User, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT
                id,
                username,
                email,
                created_at
            FROM users
            WHERE id = ?
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    pub async fn create(pool: &SqlitePool, data: CreateUser) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (
                username,
                email
            )
            VALUES (?, ?)

            RETURNING
                id,
                username,
                email,
                created_at
            "#,
        )
        .bind(data.username)
        .bind(data.email)
        .fetch_one(pool)
        .await
    }

    pub async fn update(pool: &SqlitePool, id: i64, data: UpdateUser) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            UPDATE users SET username = ?, email = ? WHERE id = ?

            RETURNING
                id,
                username,
                email,
                created_at
            "#,
        )
        .bind(data.username)
        .bind(data.email)
        .bind(id)
        .fetch_one(pool)
        .await
    }

    pub async fn delete(pool: &SqlitePool, id: i64) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(
            r#"
            DELETE FROM users
            WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
