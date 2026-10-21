import { initialScore, recyclePenalty, scoreForMove, winBonus } from './scoring.js';
import {
  applyMove,
  drawCards,
  isWon,
  recycleCards,
} from './rules.js';

function normalizeRef(ref) {
  return {
    pile: ref.pile,
    index: ref.pile === 'waste' ? 0 : ref.index,
  };
}

function timing(game, now) {
  const startedAt = game.startedAt ?? now;
  return {
    startedAt,
    elapsed: Math.max(game.elapsed, Math.floor((now - startedAt) / 1000)),
  };
}

function validSavedState(state) {
  return Boolean(
    state &&
      Array.isArray(state.stock) &&
      Array.isArray(state.waste) &&
      Array.isArray(state.foundations) &&
      state.foundations.length === 4 &&
      Array.isArray(state.tableau) &&
      state.tableau.length === 7,
  );
}

export function createGame(payload, now = Date.now()) {
  if (!payload || !validSavedState(payload.state)) return null;
  const status = payload.status === 'won' ? 'won' : 'playing';
  const moves = Array.isArray(payload.moves) ? payload.moves.slice() : [];
  const elapsed = Math.max(0, Number(payload.elapsed) || 0);
  const startedAt =
    status === 'playing' && (elapsed > 0 || moves.length > 0)
      ? now - elapsed * 1000
      : null;

  return {
    id: payload.id ?? null,
    draw: payload.draw === 1 ? 1 : 3,
    scoring: payload.scoring ?? 'standard',
    timed: Boolean(payload.timed),
    createdAt: payload.createdAt ?? now,
    status,
    won: status === 'won',
    stock: payload.state.stock.map((card) => ({ ...card })),
    waste: payload.state.waste.map((card) => ({ ...card })),
    foundations: payload.state.foundations.map((pile) =>
      pile.map((card) => ({ ...card })),
    ),
    tableau: payload.state.tableau.map((pile) =>
      pile.map((card) => ({ ...card })),
    ),
    moves,
    score: Number.isFinite(payload.score)
      ? payload.score
      : initialScore(payload.scoring),
    elapsed,
    startedAt,
    notice: null,
    lastFlip: null,
    bonus: Number(payload.bonus) || 0,
  };
}

export function serializeGame(game) {
  return {
    version: 1,
    id: game.id,
    draw: game.draw,
    scoring: game.scoring,
    timed: game.timed,
    createdAt: game.createdAt,
    status: game.status,
    score: game.score,
    elapsed: game.elapsed,
    moves: game.moves,
    state: {
      stock: game.stock,
      waste: game.waste,
      foundations: game.foundations,
      tableau: game.tableau,
    },
  };
}

export function gameReducer(game, action) {
  switch (action.type) {
    case 'replace':
      return action.game;

    case 'clear-notice':
      return game.notice ? { ...game, notice: null } : game;

    case 'tick': {
      if (!game || game.status !== 'playing' || !game.startedAt) return game;
      const elapsed = Math.floor((action.now - game.startedAt) / 1000);
      if (elapsed === game.elapsed) return game;
      return { ...game, elapsed };
    }

    case 'draw': {
      if (!game || game.status !== 'playing') return game;
      const next = drawCards(game, game.draw);
      if (!next) {
        return { ...game, notice: 'O monte está vazio.' };
      }
      const clock = timing(game, action.now);
      return {
        ...game,
        ...next,
        moves: [...game.moves, { type: 'draw' }],
        elapsed: clock.elapsed,
        startedAt: clock.startedAt,
        notice: null,
        lastFlip: null,
      };
    }

    case 'recycle': {
      if (!game || game.status !== 'playing') return game;
      const next = recycleCards(game);
      if (!next) {
        return { ...game, notice: 'O descarte está vazio.' };
      }
      const clock = timing(game, action.now);
      return {
        ...game,
        ...next,
        moves: [...game.moves, { type: 'recycle' }],
        score: game.score + recyclePenalty(game.scoring, game.draw),
        elapsed: clock.elapsed,
        startedAt: clock.startedAt,
        notice: null,
        lastFlip: null,
      };
    }

    case 'move': {
      if (!game || game.status !== 'playing') return game;
      const from = normalizeRef(action.from);
      const to = normalizeRef(action.to);
      const cardIndex = action.cardIndex ?? 0;
      const result = applyMove(game, from, to, cardIndex);
      if (!result.ok) {
        return { ...game, notice: result.reason };
      }

      const clock = timing(game, action.now);
      const won = isWon(result.state);
      const bonus = won ? winBonus(game.scoring, game.timed, clock.elapsed) : 0;
      const delta = scoreForMove(
        game.scoring,
        game.draw,
        from,
        to,
        result.flipped,
      );

      return {
        ...game,
        ...result.state,
        moves: [
          ...game.moves,
          { type: 'move', from, to, cardIndex },
        ],
        score: game.score + delta + bonus,
        elapsed: clock.elapsed,
        startedAt: won ? null : clock.startedAt,
        status: won ? 'won' : 'playing',
        won,
        bonus,
        notice: won ? 'Você ganhou!' : null,
        lastFlip: result.flipped
          ? {
              pile: 'tableau',
              index: from.index,
              cardIndex: result.state.tableau[from.index].length - 1,
            }
          : null,
      };
    }

    default:
      return game;
  }
}
