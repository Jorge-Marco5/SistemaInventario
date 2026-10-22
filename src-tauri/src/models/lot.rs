use serde::Deserialize;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLot {
    pub product_id: i64,
    pub lot_num: String,
    pub stock: i64,
    pub expiration_date: String,
    pub date_entry: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLot {
    pub lot_num: String,
    pub stock: i64,
    pub expiration_date: String,
    pub date_entry: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LotQueryParams {
    pub q: Option<String>,
    pub limit: Option<i64>,
    pub current_page: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedLots {
    pub lots: Vec<Lot>,
    pub total: i64,
    pub limit: i64,
    pub current_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Lot {
    pub id: i64,
    pub product_id: i64,
    pub lot_num: String,
    pub stock: i64,
    pub expiration_date: String,
    pub date_entry: String,
    pub created_at: String,
}
