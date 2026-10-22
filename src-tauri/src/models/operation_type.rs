use serde::Deserialize;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct OperationType {
    pub id: i64,
    pub name: String,
}
