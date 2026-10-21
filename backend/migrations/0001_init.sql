CREATE TABLE IF NOT EXISTS games (
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,
    draw        INTEGER NOT NULL,
    scoring     TEXT NOT NULL,
    timed       INTEGER NOT NULL,
    seed        INTEGER NOT NULL,
    deck        TEXT NOT NULL,
    state       TEXT,
    moves       TEXT NOT NULL DEFAULT '[]',
    status      TEXT NOT NULL DEFAULT 'playing',
    score       INTEGER,
    elapsed     INTEGER,
    finished_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_games_status_updated
    ON games (status, updated_at DESC);

CREATE TABLE IF NOT EXISTS scores (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id    TEXT NOT NULL,
    player     TEXT NOT NULL,
    score      INTEGER NOT NULL,
    seconds    INTEGER NOT NULL,
    moves      INTEGER NOT NULL,
    draw       INTEGER NOT NULL,
    scoring    TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_rank
    ON scores (score DESC, seconds ASC, created_at ASC);
