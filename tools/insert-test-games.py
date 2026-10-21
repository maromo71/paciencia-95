import json
import sqlite3
import time
import uuid
from pathlib import Path

root = Path(__file__).resolve().parent.parent
deal = json.loads(
    (root / "shared" / "fixtures" / "winning-deal.json").read_text(encoding="utf-8")
)
db_path = root / "data" / "paciencia.db"
now = int(time.time())
ids = {}

with sqlite3.connect(db_path, timeout=15) as connection:
    for kind, delta in (("api", 1_000), ("ui", 1_000_000), ("drag", 2_000_000)):
        game_id = f"win-{kind}-{uuid.uuid4()}"
        ids[kind] = game_id
        connection.execute(
            """
            INSERT INTO games
                (id, created_at, updated_at, draw, scoring, timed, seed, deck,
                 state, moves, status, score, elapsed, finished_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                game_id,
                now,
                now + delta,
                1,
                "standard",
                0,
                0,
                json.dumps(deal["deck"]),
                None,
                "[]",
                "playing",
                None,
                None,
                None,
            ),
        )
    connection.commit()

print(json.dumps(ids))
