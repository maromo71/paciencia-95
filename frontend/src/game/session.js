import { createDeck, deal, mulberry32, shuffle } from './cards.js';
import { initialScore } from './scoring.js';

export function createLocalGame({ draw, scoring, timed, player }) {
  const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  const deck = shuffle(createDeck(), mulberry32(seed));
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? `local-${crypto.randomUUID()}`
      : `local-${Date.now()}`;

  return {
    id,
    draw,
    scoring,
    timed,
    player,
    state: deal(deck),
    moves: [],
    score: initialScore(scoring),
    elapsed: 0,
    status: 'playing',
    createdAt: Date.now(),
  };
}
