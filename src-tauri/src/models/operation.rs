use serde::Deserialize;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct CreateOperation {
    pub product_id: i64,
    pub q: i64,
    pub price: i64,
    pub operation_type_id: i64,
    pub sell_id: Option<i64>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct InputCreateOperation {
    pub product_id: i64,
    pub q: i64,
    pub operation_type_id: i64,
    pub sell_id: Option<i64>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OperationQueryParams {
    pub q: Option<String>,
    pub limit: Option<i64>,
    pub current_page: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedOperations {
    pub operations: Vec<OperationData>,
    pub total: i64,
    pub limit: i64,
    pub current_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct OperationData {
    pub id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub product_barcode: String,
    pub q: i64,
    pub price: i64,
    pub operation_type_id: i64,
    pub operation_name: String,
    pub sell_id: i64,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Operation {
    pub id: i64,
    pub product_id: i64,
    pub q: i64,
    pub price: i64,
    pub operation_type_id: i64,
    pub sell_id: Option<i64>,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, FromRow)]
pub struct ReturnResOperation {
    pub success: bool,
    pub status: String,
    pub stock: i64,
    pub message: String,
}
