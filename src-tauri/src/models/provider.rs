use serde::Deserialize;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct CreateProvider {
    pub name: String,
    pub phone1: String,
    pub phone2: String,
    pub email1: String,
    pub email2: String,
}
#[derive(Debug, Deserialize)]
pub struct UpdateProvider {
    pub name: String,
    pub phone1: String,
    pub phone2: Option<String>,
    pub email1: String,
    pub email2: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderQueryParams {
    pub q: Option<String>,
    pub limit: Option<i64>,
    pub current_page: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedProviders {
    pub providers: Vec<Provider>,
    pub total: i64,
    pub limit: i64,
    pub current_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Provider {
    pub id: i64,
    pub name: String,
    pub phone1: String,
    pub phone2: Option<String>,
    pub email1: String,
    pub email2: Option<String>,
    pub is_deleted: i64,
    pub created_at: String,
}
