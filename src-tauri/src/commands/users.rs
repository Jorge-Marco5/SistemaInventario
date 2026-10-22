use tauri::State;

use crate::{
    models::user::{CreateUser, PaginatedUsers, UpdateUser, User, UserQueryParams},
    services::user_service::UserService,
    state::AppState,
};

#[tauri::command]
pub async fn get_users(
    state: State<'_, AppState>,
    params: UserQueryParams,
) -> Result<PaginatedUsers, String> {
    UserService::find_all(&state.db, params).await
}

#[tauri::command]
pub async fn get_user(state: State<'_, AppState>, id: String) -> Result<User, String> {
    let id_user: i64 = id.parse().unwrap();
    UserService::find_one(&state.db, id_user)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn create_user(state: State<'_, AppState>, data: CreateUser) -> Result<User, String> {
    UserService::create(&state.db, data)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn update_user(
    state: State<'_, AppState>,
    id: String,
    data: UpdateUser,
) -> Result<User, String> {
    let id_user: i64 = id.parse().unwrap();
    UserService::update(&state.db, id_user, data)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn delete_user(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let id_user: i64 = id.parse().unwrap();
    UserService::delete(&state.db, id_user).await
}
