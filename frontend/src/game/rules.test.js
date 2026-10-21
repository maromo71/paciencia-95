import { describe, expect, it } from 'vitest';
import {
  applyMove,
  canMove,
  canPlaceOnFoundation,
  canPlaceOnTableau,
  drawCards,
  emptyState,
  findAutoMove,
  isWon,
  recycleCards,
} from './rules.js';

function card(suit, rank, faceUp = true) {
  return { suit, rank, faceUp };
}

describe('regras do Klondike', () => {
  it('compra três cartas e recicla mantendo a ordem', () => {
    const state = emptyState();
    state.stock = [
      card('S', 1, false),
      card('S', 2, false),
      card('S', 3, false),
      card('S', 4, false),
    ];

    const first = drawCards(state, 3);
    expect(first.waste.map((item) => item.rank)).toEqual([4, 3, 2]);
    expect(first.waste.every((item) => item.faceUp)).toBe(true);

    const second = drawCards(first, 3);
    expect(second.waste.map((item) => item.rank)).toEqual([4, 3, 2, 1]);

    const recycled = recycleCards(second);
    expect(recycled.waste).toEqual([]);
    expect(recycled.stock.map((item) => item.rank)).toEqual([1, 2, 3, 4]);
    expect(recycled.stock.every((item) => !item.faceUp)).toBe(true);
  });

  it('aceita ás na fundação e rei em coluna vazia', () => {
    expect(canPlaceOnFoundation(card('H', 1), [])).toBe(true);
    expect(canPlaceOnFoundation(card('H', 2), [])).toBe(false);
    expect(canPlaceOnTableau(card('S', 13), [])).toBe(true);
    expect(canPlaceOnTableau(card('S', 12), [])).toBe(false);
  });

  it('valida sequência descendente de cores alternadas', () => {
    const state = emptyState();
    state.tableau[0] = [card('S', 9), card('H', 8)];
    state.tableau[1] = [card('D', 10)];
    expect(canMove(state, { pile: 'tableau', index: 0 }, { pile: 'tableau', index: 1 }, 0)).toBe(true);
    expect(canMove(state, { pile: 'tableau', index: 0 }, { pile: 'tableau', index: 1 }, 1)).toBe(false);
  });

  it('move sequência e desvira a carta exposta', () => {
    const state = emptyState();
    state.tableau[0] = [card('S', 5, false), card('S', 9), card('H', 8)];
    state.tableau[1] = [card('D', 10)];
    const result = applyMove(
      state,
      { pile: 'tableau', index: 0 },
      { pile: 'tableau', index: 1 },
      1,
    );
    expect(result.ok).toBe(true);
    expect(result.flipped).toBe(true);
    expect(result.state.tableau[0]).toHaveLength(1);
    expect(result.state.tableau[0][0].faceUp).toBe(true);
    expect(result.state.tableau[1]).toHaveLength(3);
    expect(state.tableau[0][0].faceUp).toBe(false);
  });

  it('recusa mover sequência inválida', () => {
    const state = emptyState();
    state.tableau[0] = [card('S', 9), card('S', 8)];
    state.tableau[1] = [card('D', 10)];
    const result = applyMove(
      state,
      { pile: 'tableau', index: 0 },
      { pile: 'tableau', index: 1 },
      0,
    );
    expect(result.ok).toBe(false);
  });

  it('encontra jogada automática para a fundação', () => {
    const state = emptyState();
    state.waste = [card('C', 1)];
    expect(findAutoMove(state, { pile: 'waste', index: 0 })).toEqual({
      from: { pile: 'waste', index: 0 },
      to: { pile: 'foundation', index: 0 },
      cardIndex: 0,
    });
  });

  it('detecta vitória com as quatro fundações completas', () => {
    const state = emptyState();
    state.foundations = ['S', 'H', 'D', 'C'].map((suit) =>
      Array.from({ length: 13 }, (_, index) => card(suit, index + 1)),
    );
    expect(isWon(state)).toBe(true);
  });
});
