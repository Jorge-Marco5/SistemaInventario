mod commands;
mod database;
mod models;
mod repositories;
mod services;
mod state;
mod utils;

use tauri::Manager;

use state::AppState;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                // 1. Obtener carpeta de datos de la aplicación
                let app_data_dir = app
                    .path()
                    .app_data_dir()
                    .expect("No se pudo obtener app_data_dir");

                // 2. Crear directorio si no existe
                std::fs::create_dir_all(&app_data_dir)?;

                // 3. Ruta de SQLite
                let database_path = app_data_dir.join("app.db");
                println!("Database path: {}", database_path.display());

                // 4. Crear pool
                let pool = database::pool::create_pool(&database_path).await?;

                // 5. Ejecutar migraciones
                database::run_migrations(&pool).await?;

                // 6. Registrar pool como estado global
                app.manage(AppState { db: pool });

                Ok::<(), Box<dyn std::error::Error>>(())
            })?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::users::get_users, //Usuarios
            commands::users::get_user,
            commands::users::create_user,
            commands::users::update_user,
            commands::users::delete_user,
            commands::category::get_categories, //Categorias
            commands::category::create_category,
            commands::category::update_category,
            commands::provider::get_providers,
            commands::provider::get_provider,
            commands::provider::create_provider,
            commands::provider::update_provider,
            commands::provider::delete_provider,
            commands::product::get_products, //Productos
            commands::product::get_product,
            commands::product::get_products_by_category,
            commands::product::get_products_by_provider,
            commands::product::create_product,
            commands::product::update_product,
            commands::product::delete_product,
            commands::product::out_stock_by_product,
            commands::operation_type::get_operation_types, //Tipos de operaciones
            commands::operation_type::get_operation_type,
            commands::lot::get_lots, //Lotes
            commands::lot::get_lot,
            commands::lot::get_lots_by_product,
            commands::lot::get_full_lots_by_product,
            commands::lot::count_stock_by_product,
            commands::lot::create_lot,
            commands::lot::update_lot,
            commands::operation::get_operations,
            commands::operation::create_operation //Operaciones en inventario
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
