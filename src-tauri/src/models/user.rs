use serde::Deserialize;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct CreateUser {
    pub username: String,
    pub email: String,
}
#[derive(Debug, Deserialize)]
pub struct UpdateUser {
    pub username: String,
    pub email: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserQueryParams {
    pub q: Option<String>,
    pub limit: Option<i64>,
    pub current_page: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedUsers {
    pub users: Vec<User>,
    pub total: i64,
    pub limit: i64,
    pub current_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub lastname: String,
    pub username: String,
    pub email: String,
    pub password: String,
    pub is_active: i64,
    pub is_admin: i64,
    pub created_at: String,
}
