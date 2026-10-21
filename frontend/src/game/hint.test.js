import { describe, expect, it } from 'vitest';
import { emptyState } from './rules.js';
import { findHint } from './hint.js';

describe('hint engine', () => {
  it('sugere subir Ás do tableau para a fundação imediatamente', () => {
    const state = {
      ...emptyState(),
      status: 'playing',
      tableau: [
        [{ suit: 'S', rank: 1, faceUp: true }],
        [],
        [],
        [],
        [],
        [],
        [],
      ],
    };

    const hint = findHint(state);
    expect(hint).not.toBeNull();
    expect(hint.type).toBe('move');
    expect(hint.to.pile).toBe('foundation');
    expect(hint.card.rank).toBe(1);
    expect(hint.priority).toBe(1);
  });

  it('sugere desvirar carta oculta com maior prioridade que compras', () => {
    const state = {
      ...emptyState(),
      status: 'playing',
      stock: [{ suit: 'D', rank: 5, faceUp: false }],
      tableau: [
        [
          { suit: 'H', rank: 9, faceUp: false },
          { suit: 'S', rank: 6, faceUp: true },
        ],
        [
          { suit: 'D', rank: 7, faceUp: true },
        ],
        [],
        [],
        [],
        [],
        [],
      ],
    };

    const hint = findHint(state);
    expect(hint).not.toBeNull();
    expect(hint.type).toBe('move');
    expect(hint.from.index).toBe(0);
    expect(hint.to.index).toBe(1);
    expect(hint.priority).toBe(3);
  });

  it('sugere comprar carta do monte quando não há movimentos no tabuleiro', () => {
    const state = {
      ...emptyState(),
      status: 'playing',
      stock: [{ suit: 'C', rank: 10, faceUp: false }],
      waste: [],
      tableau: [
        [{ suit: 'S', rank: 8, faceUp: true }],
        [{ suit: 'C', rank: 7, faceUp: true }], // mesmo naipe preto, não empilha
        [],
        [],
        [],
        [],
        [],
      ],
    };

    const hint = findHint(state);
    expect(hint).not.toBeNull();
    expect(hint.type).toBe('draw');
  });
});
