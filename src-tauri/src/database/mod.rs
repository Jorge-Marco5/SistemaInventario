pub mod pool;

use sqlx::SqlitePool;

//ejecutor de migraciones
pub async fn run_migrations(
    pool: &SqlitePool,
) -> Result<(), sqlx::migrate::MigrateError> {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await?;

    Ok(())
}