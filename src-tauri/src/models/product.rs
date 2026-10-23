use serde::Deserialize;
use serde::Serialize;
use sqlx::FromRow;

use crate::utils::cents_serializer;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProduct {
    pub image: String,
    pub barcode: String,
    pub name: String,
    pub description: String,
    pub unit: String,
    pub presentation: String,
    pub stock_min: i64,
    #[serde(with = "cents_serializer")]
    pub price_in: i64,
    #[serde(with = "cents_serializer")]
    pub price_shop: i64,
    pub provider_id: i64,
    pub category_id: i64,
    pub is_active: i64,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProduct {
    pub image: String,
    pub barcode: String,
    pub name: String,
    pub description: String,
    pub stock_min: i64,
    #[serde(with = "cents_serializer")]
    pub price_in: i64,
    #[serde(with = "cents_serializer")]
    pub price_shop: i64,
    pub unit: String,
    pub presentation: String,
    pub provider_id: i64,
    pub category_id: i64,
    pub is_active: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductQueryParams {
    pub q: Option<String>,
    pub limit: Option<i64>,
    pub current_page: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedProducts {
    pub products: Vec<Product>,
    pub total: i64,
    pub limit: i64,
    pub current_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Product {
    pub id: i64,
    pub image: String,
    pub barcode: String,
    pub name: String,
    pub description: String,
    pub unit: String,
    pub presentation: String,
    pub stock_min: i64,
    #[serde(with = "cents_serializer")]
    pub price_in: i64,
    #[serde(with = "cents_serializer")]
    pub price_shop: i64,
    pub provider_id: i64,
    pub category_id: i64,
    pub is_active: i64,
    pub is_deleted: i64,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedProductsFull {
    pub products_full: Vec<ProductFull>,
    pub total: i64,
    pub limit: i64,
    pub current_page: i64,
    pub total_pages: i64,
}

#[derive(Debug, Serialize, FromRow)]
pub struct ProductFull {
    pub id: i64,
    pub image: String,
    pub barcode: String,
    pub name: String,
    pub description: String,
    pub unit: String,
    pub presentation: String,
    pub stock_min: i64,
    pub stock_total: i64,
    #[serde(with = "cents_serializer")]
    pub price_in: i64,
    #[serde(with = "cents_serializer")]
    pub price_shop: i64,
    pub provider_id: i64,
    pub category_id: i64,
    pub is_active: i64,
    pub is_deleted: i64,
    pub created_at: String,
}
