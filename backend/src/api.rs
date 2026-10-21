use std::path::PathBuf;

use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::SqlitePool;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

use crate::db;
use crate::static_files;

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
}

pub fn router(pool: SqlitePool, dist: PathBuf) -> Router {
    let state = AppState { pool };

    let api = Router::new()
        .route("/health", get(health))
        .route("/games", post(create_game))
        .route("/games/latest", get(latest_game))
        .route("/games/{id}", get(get_game).put(save_game))
        .route("/games/{id}/finish", post(finish_game))
        .route("/scores", get(list_scores))
        .route("/stats", get(stats))
        .with_state(state);

    let assets = static_files::service(dist);

    Router::new()
        .nest("/api", api)
        .fallback_service(assets)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .layer(TraceLayer::new_for_http())
}

#[derive(Debug)]
struct ApiError {
    status: StatusCode,
    message: String,
}

impl ApiError {
    fn bad(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::BAD_REQUEST,
            message: message.into(),
        }
    }

    fn not_found(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::NOT_FOUND,
            message: message.into(),
        }
    }

    fn conflict(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::CONFLICT,
            message: message.into(),
        }
    }

    fn internal(message: impl Into<String>) -> Self {
        Self {
            status: StatusCode::INTERNAL_SERVER_ERROR,
            message: message.into(),
        }
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.status, Json(json!({ "error": self.message }))).into_response()
    }
}

impl From<sqlx::Error> for ApiError {
    fn from(error: sqlx::Error) -> Self {
        tracing::error!(%error, "erro de banco de dados");
        ApiError::internal("Erro ao acessar o banco de dados.")
    }
}

impl From<crate::service::ServiceError> for ApiError {
    fn from(error: crate::service::ServiceError) -> Self {
        match error {
            crate::service::ServiceError::BadRequest(msg) => ApiError::bad(msg),
            crate::service::ServiceError::NotFound(msg) => ApiError::not_found(msg),
            crate::service::ServiceError::Conflict(msg) => ApiError::conflict(msg),
            crate::service::ServiceError::Internal(msg) => ApiError::internal(msg),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct HealthResponse {
    status: &'static str,
    service: &'static str,
    version: &'static str,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        service: "paciencia-backend",
        version: env!("CARGO_PKG_VERSION"),
    })
}

pub use crate::service::{
    CreateGameRequest, FinishRequest, FinishResponse, GameView, SaveGameRequest,
    SaveResponse, StatsResponse,
};

#[derive(Deserialize)]
struct ScoresQuery {
    #[serde(default = "default_limit")]
    limit: i64,
}

fn default_limit() -> i64 {
    10
}

async fn create_game(
    State(app): State<AppState>,
    Json(request): Json<CreateGameRequest>,
) -> Result<Json<GameView>, ApiError> {
    let view = crate::service::create_game(&app.pool, request).await?;
    Ok(Json(view))
}

async fn latest_game(State(app): State<AppState>) -> Result<Response, ApiError> {
    match crate::service::latest_game(&app.pool).await? {
        Some(view) => Ok(Json(view).into_response()),
        None => Ok(StatusCode::NO_CONTENT.into_response()),
    }
}

async fn get_game(
    State(app): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<GameView>, ApiError> {
    let view = crate::service::get_game(&app.pool, &id).await?;
    Ok(Json(view))
}

async fn save_game(
    State(app): State<AppState>,
    Path(id): Path<String>,
    Json(request): Json<SaveGameRequest>,
) -> Result<Json<SaveResponse>, ApiError> {
    let res = crate::service::save_game(&app.pool, &id, request).await?;
    Ok(Json(res))
}

async fn finish_game(
    State(app): State<AppState>,
    Path(id): Path<String>,
    Json(request): Json<FinishRequest>,
) -> Result<Json<FinishResponse>, ApiError> {
    let res = crate::service::finish_game(&app.pool, &id, request).await?;
    Ok(Json(res))
}

async fn list_scores(
    State(app): State<AppState>,
    Query(query): Query<ScoresQuery>,
) -> Result<Json<Vec<db::ScoreRecord>>, ApiError> {
    let scores = crate::service::list_scores(&app.pool, query.limit).await?;
    Ok(Json(scores))
}

async fn stats(State(app): State<AppState>) -> Result<Json<StatsResponse>, ApiError> {
    let stats = crate::service::stats(&app.pool).await?;
    Ok(Json(stats))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;

    async fn test_state() -> AppState {
        let pool = db::init_memory().await.unwrap();
        AppState { pool }
    }

    #[tokio::test]
    async fn cria_partida_com_estado_inicial_valido() {
        let app = test_state().await;
        let Json(game) = create_game(
            State(app),
            Json(CreateGameRequest {
                draw: 3,
                scoring: ScoringMode::Standard,
                timed: false,
                abandon_game_id: None,
            }),
        )
        .await
        .unwrap();

        assert_eq!(game.draw, 3);
        assert_eq!(game.status, "playing");
        assert_eq!(game.state.tableau.len(), 7);
        assert_eq!(game.state.stock.len(), 24);
        assert_eq!(game.score, 0);
        let sizes: Vec<usize> = game.state.tableau.iter().map(Vec::len).collect();
        assert_eq!(sizes, vec![1, 2, 3, 4, 5, 6, 7]);
    }

    #[tokio::test]
    async fn recusa_modo_de_compra_invalido() {
        let app = test_state().await;
        let error = create_game(
            State(app),
            Json(CreateGameRequest {
                draw: 2,
                scoring: ScoringMode::Standard,
                timed: false,
                abandon_game_id: None,
            }),
        )
        .await
        .unwrap_err();
        assert_eq!(error.status, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn salva_jogadas_e_rejeita_jogada_ilegal() {
        let app = test_state().await;
        let Json(game) = create_game(
            State(app.clone()),
            Json(CreateGameRequest {
                draw: 1,
                scoring: ScoringMode::Standard,
                timed: false,
                abandon_game_id: None,
            }),
        )
        .await
        .unwrap();

        let draw = Move::Draw;
        let response = save_game(
            State(app.clone()),
            Path(game.id.clone()),
            Json(SaveGameRequest {
                moves: vec![draw],
                elapsed: 12,
            }),
        )
        .await
        .unwrap();
        assert_eq!(response.0.moves, 1);

        let illegal = Move::Play {
            from: crate::engine::game::PileRef {
                pile: crate::engine::game::PileKind::Waste,
                index: 0,
            },
            card_index: 0,
            to: crate::engine::game::PileRef {
                pile: crate::engine::game::PileKind::Foundation,
                index: 0,
            },
        };
        let error = save_game(
            State(app),
            Path(game.id),
            Json(SaveGameRequest {
                moves: vec![illegal],
                elapsed: 12,
            }),
        )
        .await
        .unwrap_err();
        assert_eq!(error.status, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn finalizar_partida_incompleta_falha() {
        let app = test_state().await;
        let Json(game) = create_game(
            State(app.clone()),
            Json(CreateGameRequest {
                draw: 3,
                scoring: ScoringMode::Standard,
                timed: false,
                abandon_game_id: None,
            }),
        )
        .await
        .unwrap();

        let error = finish_game(
            State(app),
            Path(game.id),
            Json(FinishRequest {
                player: Some("Teste".to_string()),
                seconds: 42,
            }),
        )
        .await
        .unwrap_err();
        assert_eq!(error.status, StatusCode::BAD_REQUEST);
    }

    #[tokio::test]
    async fn latest_retorna_partida_em_andamento() {
        let app = test_state().await;
        let Json(game) = create_game(
            State(app.clone()),
            Json(CreateGameRequest {
                draw: 1,
                scoring: ScoringMode::Vegas,
                timed: true,
                abandon_game_id: None,
            }),
        )
        .await
        .unwrap();

        let response = latest_game(State(app)).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        let bytes = axum::body::to_bytes(response.into_body(), 1024 * 1024)
            .await
            .unwrap();
        let view: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(view["id"], game.id);
        assert_eq!(view["scoring"], "vegas");
        assert_eq!(view["score"], -52);
    }
}
