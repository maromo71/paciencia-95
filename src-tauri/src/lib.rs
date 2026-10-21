use paciencia_backend::db;
use paciencia_backend::service::{
    self, CreateGameRequest, FinishRequest, FinishResponse, GameView, SaveGameRequest,
    SaveResponse, StatsResponse,
};
use sqlx::SqlitePool;
use tauri::{Manager, State};

pub struct AppState {
    pub pool: SqlitePool,
}

#[tauri::command]
async fn create_game(
    state: State<'_, AppState>,
    request: CreateGameRequest,
) -> Result<GameView, String> {
    service::create_game(&state.pool, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn latest_game(state: State<'_, AppState>) -> Result<Option<GameView>, String> {
    service::latest_game(&state.pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_game(state: State<'_, AppState>, id: String) -> Result<GameView, String> {
    service::get_game(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_game(
    state: State<'_, AppState>,
    id: String,
    request: SaveGameRequest,
) -> Result<SaveResponse, String> {
    service::save_game(&state.pool, &id, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn finish_game(
    state: State<'_, AppState>,
    id: String,
    request: FinishRequest,
) -> Result<FinishResponse, String> {
    service::finish_game(&state.pool, &id, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_scores(
    state: State<'_, AppState>,
    limit: Option<i64>,
) -> Result<Vec<db::ScoreRecord>, String> {
    service::list_scores(&state.pool, limit.unwrap_or(10))
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_stats(state: State<'_, AppState>) -> Result<StatsResponse, String> {
    service::stats(&state.pool)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_maximize_window(window: tauri::Window) -> Result<(), String> {
    if window.is_maximized().unwrap_or(false) {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn close_app(app_handle: tauri::AppHandle) {
    app_handle.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let app_data = app
                .path()
                .app_data_dir()
                .map_err(|e| Box::new(e) as Box<dyn std::error::Error>)?;
            std::fs::create_dir_all(&app_data)?;
            let db_path = app_data.join("paciencia.db");

            let pool = tauri::async_runtime::block_on(async { db::init(&db_path).await })
                .map_err(|e| -> Box<dyn std::error::Error> { e.into() })?;

            app.manage(AppState { pool });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_game,
            latest_game,
            get_game,
            save_game,
            finish_game,
            get_scores,
            get_stats,
            minimize_window,
            toggle_maximize_window,
            close_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
