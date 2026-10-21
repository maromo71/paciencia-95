use std::path::Path;

use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
use sqlx::{FromRow, SqlitePool};

#[derive(Debug, Clone, FromRow)]
pub struct GameRecord {
    pub id: String,
    pub created_at: i64,
    pub draw: i64,
    pub scoring: String,
    pub timed: i64,
    pub deck: String,
    pub moves: String,
    pub status: String,
    pub elapsed: Option<i64>,
}

#[derive(Debug, Clone, FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScoreRecord {
    pub id: i64,
    pub player: String,
    pub score: i64,
    pub seconds: i64,
    pub moves: i64,
    pub draw: i64,
    pub scoring: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, FromRow)]
pub struct StatsRecord {
    pub played: i64,
    pub won: i64,
    pub best_score: Option<i64>,
    pub best_seconds: Option<i64>,
    pub total_moves: i64,
}

/// Abre (ou cria) o banco e aplica as migrations embutidas no binário.
pub async fn init(path: &Path) -> Result<SqlitePool, String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|error| format!("não foi possível criar a pasta do banco: {error}"))?;
    }

    let options = SqliteConnectOptions::new()
        .filename(path)
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await
        .map_err(|error| format!("não foi possível abrir o SQLite: {error}"))?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|error| format!("falha ao aplicar migrations: {error}"))?;

    Ok(pool)
}

/// Banco em memória usado pelos testes de API.
#[cfg(test)]
pub async fn init_memory() -> Result<SqlitePool, String> {
    use std::str::FromStr;

    let options = SqliteConnectOptions::from_str("sqlite::memory:")
        .map_err(|error| error.to_string())?
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect_with(options)
        .await
        .map_err(|error| format!("não foi possível abrir o SQLite em memória: {error}"))?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(|error| format!("falha ao aplicar migrations: {error}"))?;

    Ok(pool)
}

#[allow(clippy::too_many_arguments)]
pub async fn insert_game(
    pool: &SqlitePool,
    id: &str,
    created_at: i64,
    draw: u8,
    scoring: &str,
    timed: bool,
    seed: u64,
    deck: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        INSERT INTO games (id, created_at, updated_at, draw, scoring, timed, seed, deck, moves, status)
        VALUES (?1, ?2, ?2, ?3, ?4, ?5, ?6, ?7, '[]', 'playing')
        "#,
    )
    .bind(id)
    .bind(created_at)
    .bind(draw as i64)
    .bind(scoring)
    .bind(timed as i64)
    .bind(seed as i64)
    .bind(deck)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_game(pool: &SqlitePool, id: &str) -> Result<Option<GameRecord>, sqlx::Error> {
    sqlx::query_as::<_, GameRecord>(
        r#"
        SELECT id, created_at, draw, scoring, timed, deck, moves, status, elapsed
        FROM games WHERE id = ?1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await
}

pub async fn latest_playing(pool: &SqlitePool) -> Result<Option<GameRecord>, sqlx::Error> {
    sqlx::query_as::<_, GameRecord>(
        r#"
        SELECT id, created_at, draw, scoring, timed, deck, moves, status, elapsed
        FROM games
        WHERE status = 'playing'
        ORDER BY updated_at DESC
        LIMIT 1
        "#,
    )
    .fetch_optional(pool)
    .await
}

pub async fn abandon_game(pool: &SqlitePool, id: &str, updated_at: i64) -> Result<(), sqlx::Error> {
    sqlx::query("UPDATE games SET status = 'abandoned', updated_at = ?2 WHERE id = ?1 AND status = 'playing'")
        .bind(id)
        .bind(updated_at)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn save_game(
    pool: &SqlitePool,
    id: &str,
    moves: &str,
    score: i64,
    elapsed: i64,
    updated_at: i64,
) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        UPDATE games
        SET moves = ?2, score = ?3, elapsed = ?4, updated_at = ?5
        WHERE id = ?1 AND status = 'playing'
        "#,
    )
    .bind(id)
    .bind(moves)
    .bind(score)
    .bind(elapsed)
    .bind(updated_at)
    .execute(pool)
    .await?;
    Ok(result.rows_affected())
}

pub async fn finish_game(
    pool: &SqlitePool,
    id: &str,
    score: i64,
    elapsed: i64,
    finished_at: i64,
) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        UPDATE games
        SET status = 'won', score = ?2, elapsed = ?3, updated_at = ?3, finished_at = ?3
        WHERE id = ?1 AND status = 'playing'
        "#,
    )
    .bind(id)
    .bind(score)
    .bind(elapsed)
    .bind(finished_at)
    .execute(pool)
    .await?;
    Ok(result.rows_affected())
}

#[allow(clippy::too_many_arguments)]
pub async fn insert_score(
    pool: &SqlitePool,
    game_id: &str,
    player: &str,
    score: i64,
    seconds: i64,
    moves: i64,
    draw: u8,
    scoring: &str,
    created_at: i64,
) -> Result<i64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        INSERT INTO scores (game_id, player, score, seconds, moves, draw, scoring, created_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        "#,
    )
    .bind(game_id)
    .bind(player)
    .bind(score)
    .bind(seconds)
    .bind(moves)
    .bind(draw as i64)
    .bind(scoring)
    .bind(created_at)
    .execute(pool)
    .await?;
    Ok(result.last_insert_rowid())
}

pub async fn scores(pool: &SqlitePool, limit: i64) -> Result<Vec<ScoreRecord>, sqlx::Error> {
    sqlx::query_as::<_, ScoreRecord>(
        r#"
        SELECT id, player, score, seconds, moves, draw, scoring, created_at
        FROM scores
        ORDER BY score DESC, seconds ASC, created_at ASC
        LIMIT ?1
        "#,
    )
    .bind(limit)
    .fetch_all(pool)
    .await
}

pub async fn stats(pool: &SqlitePool) -> Result<StatsRecord, sqlx::Error> {
    sqlx::query_as::<_, StatsRecord>(
        r#"
        SELECT
            (SELECT COUNT(*) FROM games) AS played,
            (SELECT COUNT(*) FROM games WHERE status = 'won') AS won,
            (SELECT MAX(score) FROM scores) AS best_score,
            (SELECT MIN(seconds) FROM scores) AS best_seconds,
            (SELECT COALESCE(SUM(moves), 0) FROM scores) AS total_moves
        "#,
    )
    .fetch_one(pool)
    .await
}
