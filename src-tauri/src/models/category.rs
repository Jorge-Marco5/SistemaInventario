use serde::Deserialize;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
pub struct CreateCategory {
    pub name: String,
    pub description: String,
    pub image: String,
}
#[derive(Debug, Deserialize)]
pub struct UpdateCategory {
    pub image: String,
    pub name: String,
    pub description: String,
}

// #[derive(Debug, Deserialize)]
// #[serde(rename_all = "camelCase")]
// pub struct CategoryQueryParams {
//     pub q: Option<String>,
//     pub limit: Option<i64>,
//     pub current_page: Option<i64>,
// }

// #[derive(Debug, Serialize)]
// #[serde(rename_all = "camelCase")]
// pub struct PaginatedCategories {
//     pub categories: Vec<Category>,
//     pub total: i64,
//     pub limit: i64,
//     pub current_page: i64,
//     pub total_pages: i64,
// }

#[derive(Debug, Serialize, FromRow)]
pub struct Category {
    pub id: i64,
    pub image: String,
    pub name: String,
    pub description: String,
    pub created_at: String,
}
