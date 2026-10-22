use tauri::State;

use crate::{
    models::provider::{
        CreateProvider, PaginatedProviders, Provider, ProviderQueryParams, UpdateProvider,
    },
    services::provider_service::ProviderService,
    state::AppState,
};

#[tauri::command]
pub async fn get_providers(
    state: State<'_, AppState>,
    params: ProviderQueryParams,
) -> Result<PaginatedProviders, String> {
    ProviderService::find_all(&state.db, params).await
}

#[tauri::command]
pub async fn get_provider(state: State<'_, AppState>, id: i64) -> Result<Provider, String> {
    //let id_provider: i64 = id.parse().unwrap();
    ProviderService::find_one(&state.db, id)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn create_provider(
    state: State<'_, AppState>,
    data: CreateProvider,
) -> Result<Provider, String> {
    ProviderService::create(&state.db, data)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn update_provider(
    state: State<'_, AppState>,
    id: i64,
    data: UpdateProvider,
) -> Result<Provider, String> {
    //let id_provider: i64 = id.parse().unwrap();
    ProviderService::update(&state.db, id, data)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn delete_provider(state: State<'_, AppState>, id: i64) -> Result<(), String> {
    //let id_provider: i64 = id.parse().unwrap();
    ProviderService::delete(&state.db, id).await
}
