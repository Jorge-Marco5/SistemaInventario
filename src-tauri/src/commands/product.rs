use tauri::State;

use crate::{
    models::{
        operation::ReturnResOperation,
        product::{
            CreateProduct, PaginatedProducts, PaginatedProductsFull, Product, ProductFull,
            ProductQueryParams, UpdateProduct,
        },
    },
    services::product_service::ProductService,
    state::AppState,
};

#[tauri::command]
pub async fn get_products(
    state: State<'_, AppState>,
    params: ProductQueryParams,
) -> Result<PaginatedProductsFull, String> {
    ProductService::find_all(&state.db, params).await
}

#[tauri::command]
pub async fn get_product(state: State<'_, AppState>, id: i64) -> Result<ProductFull, String> {
    //let id_provider: i64 = id.parse().unwrap();
    ProductService::find_one(&state.db, id)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn get_products_by_category(
    state: State<'_, AppState>,
    category_id: i64,
    params: ProductQueryParams,
) -> Result<PaginatedProducts, String> {
    ProductService::find_by_category(&state.db, category_id, params).await
}

#[tauri::command]
pub async fn get_products_by_provider(
    state: State<'_, AppState>,
    provider_id: i64,
    params: ProductQueryParams,
) -> Result<PaginatedProducts, String> {
    ProductService::find_by_provider(&state.db, provider_id, params).await
}

#[tauri::command]
pub async fn create_product(
    state: State<'_, AppState>,
    data: CreateProduct,
) -> Result<Product, String> {
    ProductService::create(&state.db, data).await
}

#[tauri::command]
pub async fn update_product(
    state: State<'_, AppState>,
    id: i64,
    data: UpdateProduct,
) -> Result<Product, String> {
    ProductService::update(&state.db, id, data).await
}

#[tauri::command]
pub async fn delete_product(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    //let id_provider: i64 = id.parse().unwrap();
    ProductService::delete(&state.db, id).await
}

#[tauri::command]
pub async fn out_stock_by_product(
    state: State<'_, AppState>,
    product_id: i64,
    quantity: i64,
) -> Result<ReturnResOperation, String> {
    ProductService::out_stock_by_product(&state.db, product_id, quantity).await
}
