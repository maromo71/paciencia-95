import { describe, expect, it } from 'vitest';
import {
  createDeck,
  deal,
  mulberry32,
  shuffle,
} from './cards.js';

describe('baralho e distribuição', () => {
  it('cria 52 cartas únicas', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((card) => `${card.suit}${card.rank}`)).size).toBe(52);
  });

  it('embaralha de forma determinística com a mesma seed', () => {
    const first = shuffle(createDeck(), mulberry32(42));
    const second = shuffle(createDeck(), mulberry32(42));
    expect(first).toEqual(second);
    expect(new Set(first.map((card) => `${card.suit}${card.rank}`)).size).toBe(52);
  });

  it('distribui 1..7 cartas e deixa 24 no monte', () => {
    const state = deal(createDeck());
    expect(state.tableau.map((pile) => pile.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(state.stock).toHaveLength(24);
    expect(state.waste).toHaveLength(0);
    state.tableau.forEach((pile) => {
      pile.slice(0, -1).forEach((card) => expect(card.faceUp).toBe(false));
      expect(pile[pile.length - 1].faceUp).toBe(true);
    });
    expect(state.stock.every((card) => !card.faceUp)).toBe(true);
  });

  it('usa a mesma ordem de distribuição do backend', () => {
    const deck = createDeck().map((card, index) => ({ ...card, rank: (index % 13) + 1 }));
    const state = deal(deck);
    // Cada coluna recebe as cartas nas posições row..6 para row=0..col.
    expect(state.tableau[0][0].suit).toBe(deck[0].suit);
    expect(state.tableau[1][0].suit).toBe(deck[1].suit);
    expect(state.tableau[1][1].suit).toBe(deck[7].suit);
    expect(state.tableau[6][0].suit).toBe(deck[6].suit);
    expect(state.tableau[6][6].suit).toBe(deck[27].suit);
    expect(state.stock[0].suit).toBe(deck[28].suit);
    expect(state.stock[23].suit).toBe(deck[51].suit);
  });
});
