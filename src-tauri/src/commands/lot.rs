use tauri::State;

use crate::{
    models::lot::{CreateLot, Lot, LotQueryParams, PaginatedLots, UpdateLot},
    services::lot_service::LotService,
    state::AppState,
};

#[tauri::command]
pub async fn get_lots(
    state: State<'_, AppState>,
    params: LotQueryParams,
) -> Result<PaginatedLots, String> {
    LotService::find_all(&state.db, params).await
}

#[tauri::command]
pub async fn get_lot(state: State<'_, AppState>, id: i64) -> Result<Lot, String> {
    //let id_provider: i64 = id.parse().unwrap();
    LotService::find_one(&state.db, id)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn get_lots_by_product(
    state: State<'_, AppState>,
    product_id: i64,
) -> Result<Vec<Lot>, String> {
    LotService::find_lots_by_product(&state.db, product_id).await
}

#[tauri::command]
pub async fn get_full_lots_by_product(
    state: State<'_, AppState>,
    product_id: i64,
    params: LotQueryParams,
) -> Result<PaginatedLots, String> {
    LotService::find_full_lots_by_product(&state.db, product_id, params).await
}

#[tauri::command]
pub async fn count_stock_by_product(
    state: State<'_, AppState>,
    product_id: i64,
) -> Result<i64, String> {
    LotService::count_stock_by_product(&state.db, product_id)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn create_lot(state: State<'_, AppState>, data: CreateLot) -> Result<Lot, String> {
    LotService::create(&state.db, data).await
}

#[tauri::command]
pub async fn update_lot(
    state: State<'_, AppState>,
    id: i64,
    data: UpdateLot,
) -> Result<Lot, String> {
    LotService::update(&state.db, id, data).await
}
