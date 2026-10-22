use tauri::State;

use crate::{
    models::category::{Category, CreateCategory, UpdateCategory},
    services::category_service::CategoryService,
    state::AppState,
};

#[tauri::command]
pub async fn get_categories(
    state: State<'_, AppState>,
    search: String,
) -> Result<Vec<Category>, String> {
    CategoryService::find_all(&state.db, search).await
}

#[tauri::command]
pub async fn create_category(
    state: State<'_, AppState>,
    data: CreateCategory,
) -> Result<Category, String> {
    CategoryService::create(&state.db, data).await
}

#[tauri::command]
pub async fn update_category(
    state: State<'_, AppState>,
    id: i64,
    data: UpdateCategory,
) -> Result<Category, String> {
    CategoryService::update(&state.db, id, data)
        .await
        .map_err(|error| error.to_string())
}
