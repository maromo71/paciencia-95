import { describe, expect, it } from 'vitest';
import { createDeck, deal, mulberry32, shuffle } from './cards.js';
import {
  createGame,
  gameReducer,
  serializeGame,
} from './gameReducer.js';
import { emptyState } from './rules.js';

function card(suit, rank, faceUp = true) {
  return { suit, rank, faceUp };
}

function newDeal(now) {
  const deck = shuffle(createDeck(), mulberry32(7));
  return createGame(
    {
      id: 'teste',
      draw: 3,
      scoring: 'standard',
      timed: false,
      state: deal(deck),
      moves: [],
      score: 0,
      elapsed: 0,
      status: 'playing',
    },
    now,
  );
}

describe('reducer da partida', () => {
  it('inicia o cronômetro na primeira compra', () => {
    const game = newDeal(5000);
    const drawn = gameReducer(game, { type: 'draw', now: 7000 });
    expect(drawn.moves).toEqual([{ type: 'draw' }]);
    expect(drawn.startedAt).toBe(7000);
    expect(drawn.elapsed).toBe(0);
    expect(drawn.waste).toHaveLength(3);

    const ticked = gameReducer(drawn, { type: 'tick', now: 9000 });
    expect(ticked.elapsed).toBe(2);
  });

  it('avança o tempo e encerra a partida com bônus', () => {
    const state = emptyState();
    state.foundations[0] = Array.from({ length: 12 }, (_, index) =>
      card('S', index + 1),
    );
    state.foundations[1] = Array.from({ length: 13 }, (_, index) =>
      card('H', index + 1),
    );
    state.foundations[2] = Array.from({ length: 13 }, (_, index) =>
      card('D', index + 1),
    );
    state.foundations[3] = Array.from({ length: 13 }, (_, index) =>
      card('C', index + 1),
    );
    state.tableau[0] = [card('S', 13)];

    const game = createGame(
      {
        id: 'vitoria',
        draw: 3,
        scoring: 'standard',
        timed: true,
        state,
        moves: [{ type: 'draw' }],
        score: 1000,
        elapsed: 90,
        status: 'playing',
      },
      1_000_000,
    );

    const won = gameReducer(game, {
      type: 'move',
      from: { pile: 'tableau', index: 0 },
      to: { pile: 'foundation', index: 0 },
      cardIndex: 0,
      now: 1_010_000,
    });

    expect(won.status).toBe('won');
    expect(won.won).toBe(true);
    expect(won.startedAt).toBeNull();
    expect(won.elapsed).toBe(100);
    expect(won.score).toBe(1000 + 10 + 7000);
    expect(won.moves).toHaveLength(2);
    expect(won.moves[1]).toEqual({
      type: 'move',
      from: { pile: 'tableau', index: 0 },
      to: { pile: 'foundation', index: 0 },
      cardIndex: 0,
    });
  });

  it('mantém o estado imutável e avisa jogadas inválidas', () => {
    const game = newDeal(0);
    const snapshot = JSON.stringify(game);
    const invalid = gameReducer(game, {
      type: 'move',
      from: { pile: 'waste', index: 0 },
      to: { pile: 'foundation', index: 0 },
      cardIndex: 0,
      now: 1000,
    });
    expect(invalid.notice).toBe('Não há carta para mover.');
    expect(JSON.stringify(game)).toBe(snapshot);
  });

  it('serializa e restaura uma partida', () => {
    const game = newDeal(5000);
    const saved = serializeGame(game);
    const restored = createGame({ ...saved, state: saved.state }, 10_000);
    expect(restored.id).toBe(game.id);
    expect(restored.tableau).toEqual(game.tableau);
    expect(restored.stock).toEqual(game.stock);
    expect(restored.moves).toEqual(game.moves);
  });
});
