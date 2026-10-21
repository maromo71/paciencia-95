use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use rand::SeedableRng;
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;

use crate::db::{self, GameRecord};
use crate::engine::{
    deal, full_deck, replay, win_bonus, Card, GameState, Move, ScoringMode,
};
use crate::now;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ServiceError {
    BadRequest(String),
    NotFound(String),
    Conflict(String),
    Internal(String),
}

impl std::fmt::Display for ServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::BadRequest(msg) => write!(f, "{msg}"),
            Self::NotFound(msg) => write!(f, "{msg}"),
            Self::Conflict(msg) => write!(f, "{msg}"),
            Self::Internal(msg) => write!(f, "{msg}"),
        }
    }
}

impl std::error::Error for ServiceError {}

impl From<sqlx::Error> for ServiceError {
    fn from(error: sqlx::Error) -> Self {
        tracing::error!(%error, "erro de banco de dados");
        ServiceError::Internal("Erro ao acessar o banco de dados.".to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateGameRequest {
    #[serde(default = "default_draw")]
    pub draw: u8,
    #[serde(default = "default_scoring")]
    pub scoring: ScoringMode,
    #[serde(default)]
    pub timed: bool,
    #[serde(default)]
    pub abandon_game_id: Option<String>,
}

fn default_draw() -> u8 {
    3
}

fn default_scoring() -> ScoringMode {
    ScoringMode::Standard
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GameView {
    pub id: String,
    pub draw: u8,
    pub scoring: ScoringMode,
    pub timed: bool,
    pub state: GameState,
    pub moves: Vec<Move>,
    pub score: i64,
    pub elapsed: u64,
    pub status: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveGameRequest {
    pub moves: Vec<Move>,
    #[serde(default)]
    pub elapsed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveResponse {
    pub score: i64,
    pub moves: usize,
    pub won: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FinishRequest {
    #[serde(default)]
    pub player: Option<String>,
    #[serde(default)]
    pub seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FinishResponse {
    pub score: i64,
    pub seconds: u64,
    pub moves: usize,
    pub is_record: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsResponse {
    pub played: i64,
    pub won: i64,
    pub win_rate: f64,
    pub best_score: Option<i64>,
    pub best_seconds: Option<i64>,
    pub total_moves: i64,
}

pub async fn create_game(
    pool: &SqlitePool,
    request: CreateGameRequest,
) -> Result<GameView, ServiceError> {
    if request.draw != 1 && request.draw != 3 {
        return Err(ServiceError::BadRequest(
            "O modo de compra precisa ser 1 ou 3.".to_string(),
        ));
    }

    if let Some(previous_id) = request.abandon_game_id.as_deref()
        && !previous_id.is_empty()
        && !previous_id.starts_with("local-")
    {
        db::abandon_game(pool, previous_id, now()).await?;
    }

    let seed: u64 = rand::random();
    let mut rng = StdRng::seed_from_u64(seed);
    let mut deck = full_deck();
    deck.shuffle(&mut rng);

    let deck_json = serde_json::to_string(&deck)
        .map_err(|error| ServiceError::Internal(format!("falha ao serializar baralho: {error}")))?;
    let id = uuid::Uuid::new_v4().to_string();
    let created_at = now();

    db::insert_game(
        pool,
        &id,
        created_at,
        request.draw,
        request.scoring.as_str(),
        request.timed,
        seed,
        &deck_json,
    )
    .await?;

    let state = deal(&deck);
    let score = if request.scoring == ScoringMode::Vegas {
        i64::from(crate::engine::replay::VEGAS_ANTE)
    } else {
        0
    };

    Ok(GameView {
        id,
        draw: request.draw,
        scoring: request.scoring,
        timed: request.timed,
        state,
        moves: Vec::new(),
        score,
        elapsed: 0,
        status: "playing".to_string(),
        created_at,
    })
}

pub async fn latest_game(pool: &SqlitePool) -> Result<Option<GameView>, ServiceError> {
    match db::latest_playing(pool).await? {
        Some(record) => Ok(Some(build_view(record)?)),
        None => Ok(None),
    }
}

pub async fn get_game(pool: &SqlitePool, id: &str) -> Result<GameView, ServiceError> {
    let record = db::get_game(pool, id)
        .await?
        .ok_or_else(|| ServiceError::NotFound("Partida não encontrada.".to_string()))?;
    build_view(record)
}

pub fn build_view(record: GameRecord) -> Result<GameView, ServiceError> {
    let deck: Vec<Card> = serde_json::from_str(&record.deck)
        .map_err(|error| ServiceError::Internal(format!("baralho salvo inválido: {error}")))?;
    if deck.len() != 52 {
        return Err(ServiceError::Internal(
            "baralho salvo não tem 52 cartas.".to_string(),
        ));
    }

    let scoring = ScoringMode::parse(&record.scoring)
        .ok_or_else(|| ServiceError::Internal("modo de pontuação salvo inválido.".to_string()))?;
    let moves: Vec<Move> = serde_json::from_str(&record.moves)
        .map_err(|error| ServiceError::Internal(format!("jogadas salvas inválidas: {error}")))?;

    let result = replay(&deck, record.draw as u8, scoring, &moves)
        .map_err(ServiceError::BadRequest)?;

    Ok(GameView {
        id: record.id,
        draw: record.draw as u8,
        scoring,
        timed: record.timed != 0,
        state: result.state,
        moves,
        score: i64::from(result.base_score),
        elapsed: record.elapsed.unwrap_or(0).max(0) as u64,
        status: record.status,
        created_at: record.created_at,
    })
}

pub async fn save_game(
    pool: &SqlitePool,
    id: &str,
    request: SaveGameRequest,
) -> Result<SaveResponse, ServiceError> {
    let record = db::get_game(pool, id)
        .await?
        .ok_or_else(|| ServiceError::NotFound("Partida não encontrada.".to_string()))?;

    if record.status != "playing" {
        return Err(ServiceError::Conflict("Essa partida já foi encerrada.".to_string()));
    }

    let deck: Vec<Card> = serde_json::from_str(&record.deck)
        .map_err(|error| ServiceError::Internal(format!("baralho salvo inválido: {error}")))?;
    if deck.len() != 52 {
        return Err(ServiceError::Internal(
            "baralho salvo não tem 52 cartas.".to_string(),
        ));
    }
    let scoring = ScoringMode::parse(&record.scoring)
        .ok_or_else(|| ServiceError::Internal("modo de pontuação salvo inválido.".to_string()))?;

    let result = replay(&deck, record.draw as u8, scoring, &request.moves)
        .map_err(ServiceError::BadRequest)?;

    let moves_json = serde_json::to_string(&request.moves)
        .map_err(|error| ServiceError::Internal(format!("falha ao serializar jogadas: {error}")))?;

    let updated = db::save_game(
        pool,
        id,
        &moves_json,
        i64::from(result.base_score),
        request.elapsed as i64,
        now(),
    )
    .await?;

    if updated == 0 {
        return Err(ServiceError::Conflict(
            "Não foi possível salvar a partida.".to_string(),
        ));
    }

    Ok(SaveResponse {
        score: i64::from(result.base_score),
        moves: result.move_count,
        won: result.won,
    })
}

pub async fn finish_game(
    pool: &SqlitePool,
    id: &str,
    request: FinishRequest,
) -> Result<FinishResponse, ServiceError> {
    let record = db::get_game(pool, id)
        .await?
        .ok_or_else(|| ServiceError::NotFound("Partida não encontrada.".to_string()))?;

    if record.status != "playing" {
        return Err(ServiceError::Conflict("Essa partida já foi encerrada.".to_string()));
    }

    let deck: Vec<Card> = serde_json::from_str(&record.deck)
        .map_err(|error| ServiceError::Internal(format!("baralho salvo inválido: {error}")))?;
    if deck.len() != 52 {
        return Err(ServiceError::Internal(
            "baralho salvo não tem 52 cartas.".to_string(),
        ));
    }
    let scoring = ScoringMode::parse(&record.scoring)
        .ok_or_else(|| ServiceError::Internal("modo de pontuação salvo inválido.".to_string()))?;
    let moves: Vec<Move> = serde_json::from_str(&record.moves)
        .map_err(|error| ServiceError::Internal(format!("jogadas salvas inválidas: {error}")))?;

    let result = replay(&deck, record.draw as u8, scoring, &moves)
        .map_err(ServiceError::Internal)?;

    if !result.won {
        return Err(ServiceError::BadRequest(
            "A partida ainda não foi concluída.".to_string(),
        ));
    }

    let seconds = request.seconds.min(86_400 * 7);
    let bonus = win_bonus(scoring, record.timed != 0, seconds);
    let final_score = if scoring == ScoringMode::None {
        0
    } else {
        i64::from(result.base_score + bonus)
    };

    let previous_best: Option<i64> = sqlx::query_scalar("SELECT MAX(score) FROM scores")
        .fetch_one(pool)
        .await?;
    let is_record = previous_best.is_none_or(|best| final_score > best);

    let player_raw = request
        .player
        .as_deref()
        .unwrap_or("Jogador")
        .trim()
        .to_string();
    let player: String = if player_raw.is_empty() {
        "Jogador".to_string()
    } else {
        player_raw.chars().take(24).collect()
    };

    let finished_at = now();
    let updated = db::finish_game(pool, id, final_score, seconds as i64, finished_at).await?;

    if updated == 0 {
        return Err(ServiceError::Conflict(
            "Não foi possível finalizar a partida.".to_string(),
        ));
    }

    db::insert_score(
        pool,
        id,
        &player,
        final_score,
        seconds as i64,
        result.move_count as i64,
        record.draw as u8,
        scoring.as_str(),
        finished_at,
    )
    .await?;

    Ok(FinishResponse {
        score: final_score,
        seconds,
        moves: result.move_count,
        is_record,
    })
}

pub async fn list_scores(
    pool: &SqlitePool,
    limit: i64,
) -> Result<Vec<db::ScoreRecord>, ServiceError> {
    let limit = limit.clamp(1, 50);
    Ok(db::scores(pool, limit).await?)
}

pub async fn stats(pool: &SqlitePool) -> Result<StatsResponse, ServiceError> {
    let record = db::stats(pool).await?;
    let win_rate = if record.played > 0 {
        (record.won as f64 / record.played as f64) * 100.0
    } else {
        0.0
    };

    Ok(StatsResponse {
        played: record.played,
        won: record.won,
        win_rate: (win_rate * 10.0).round() / 10.0,
        best_score: record.best_score,
        best_seconds: record.best_seconds,
        total_moves: record.total_moves,
    })
}
