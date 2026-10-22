use tauri::State;

use crate::{
    models::operation::{
        InputCreateOperation, Operation, OperationQueryParams, PaginatedOperations,
    },
    services::operation_service::OperationService,
    state::AppState,
};

#[tauri::command]
pub async fn get_operations(
    state: State<'_, AppState>,
    params: OperationQueryParams,
) -> Result<PaginatedOperations, String> {
    OperationService::find_all(&state.db, params).await
}

// #[tauri::command]
// pub async fn get_operations_by_product(
//     state: State<'_, AppState>,
//     provider_id: i64,
//     params: OperationQueryParams,
// ) -> Result<PaginatedOperations, String> {
//     OperationService::find_by_provider(&state.db, provider_id, params).await
// }

#[tauri::command]
pub async fn create_operation(
    state: State<'_, AppState>,
    data: InputCreateOperation,
) -> Result<Operation, String> {
    OperationService::create(&state.db, data).await
}
