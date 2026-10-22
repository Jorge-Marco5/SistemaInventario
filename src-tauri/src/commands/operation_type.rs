use tauri::State;

use crate::{
    models::operation_type::OperationType, services::operation_type_service::OperationTypeService,
    state::AppState,
};

#[tauri::command]
pub async fn get_operation_types(state: State<'_, AppState>) -> Result<Vec<OperationType>, String> {
    OperationTypeService::find_all(&state.db).await
}

#[tauri::command]
pub async fn get_operation_type(
    state: State<'_, AppState>,
    id_operation_type: i64,
) -> Result<OperationType, String> {
    OperationTypeService::find_one(&state.db, id_operation_type).await
}
