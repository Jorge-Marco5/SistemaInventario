use serde::Deserialize;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct CreateSell {
    pub user_id: i64,
    pub total: i64,
    pub cash: i64,
    pub change: i64,
    pub discount: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SellQueryParams {
    pub q: Option<String>,
    pub limit: Option<i64>,
    pub current_page: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedSells {
    pub users: Vec<Sell>,
    pub total: i64,
    pub limit: i64,
    pub current_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Sell {
    pub id: i64,
    pub user_id: i64,
    pub total: i64,
    pub cash: i64,
    pub change: i64,
    pub discount: i64,
    pub created_at: String,
}
