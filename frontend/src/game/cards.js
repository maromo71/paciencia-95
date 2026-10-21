export const SUITS = ['S', 'H', 'D', 'C'];

export const SUIT_SYMBOLS = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
};

export const SUIT_NAMES = {
  S: 'Espadas',
  H: 'Copas',
  D: 'Ouros',
  C: 'Paus',
};

export const RANK_LABELS = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export function isRed(card) {
  return card.suit === 'H' || card.suit === 'D';
}

export function cardColor(card) {
  return isRed(card) ? 'red' : 'black';
}

export function cardKey(card) {
  return `${card.suit}${card.rank}`;
}

export function cardName(card) {
  return `${RANK_LABELS[card.rank]} de ${SUIT_NAMES[card.suit]}`;
}

export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank += 1) {
      deck.push({ suit, rank, faceUp: false });
    }
  }
  return deck;
}

/** Fisher-Yates com gerador injetável para testes determinísticos. */
export function shuffle(deck, random = Math.random) {
  const copy = deck.map((card) => ({ ...card }));
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mesma distribuição do backend: linhas 0..6, colunas row..6. As 28 primeiras
 * cartas vão para o tableau; o restante forma o monte, com o topo no fim.
 */
export function deal(deck) {
  if (deck.length !== 52) {
    throw new Error('O baralho precisa ter 52 cartas.');
  }
  const tableau = Array.from({ length: 7 }, () => []);
  let cursor = 0;
  for (let row = 0; row < 7; row += 1) {
    for (let column = row; column < 7; column += 1) {
      tableau[column].push({ ...deck[cursor], faceUp: row === column });
      cursor += 1;
    }
  }
  const stock = deck.slice(cursor).map((card) => ({ ...card, faceUp: false }));
  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  };
}

export function isSameCard(a, b) {
  return Boolean(a && b && a.suit === b.suit && a.rank === b.rank);
}
