// Verifica a paridade entre o motor JS e o replay em Rust:
// gera jogadas legais, envia ao backend e compara pontuação e vitória.
import {
  applyMove,
  drawCards,
  getMovingCards,
  isWon,
  recycleCards,
  canPlaceOnTableau,
  canPlaceOnFoundation,
} from '../frontend/src/game/rules.js';
import {
  recyclePenalty,
  scoreForMove,
} from '../frontend/src/game/scoring.js';

const API = 'http://127.0.0.1:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error || response.statusText);
  return data;
}

const ref = (pile, index = 0) => ({ pile, index });

function possibleMoves(state) {
  const moves = [];

  for (let f = 0; f < 4; f += 1) {
    const pile = state.foundations[f];
    const card = pile[pile.length - 1];
    if (!card) continue;
    for (let t = 0; t < 7; t += 1) {
      if (canPlaceOnTableau(card, state.tableau[t])) {
        moves.push({
          type: 'move',
          from: ref('foundation', f),
          to: ref('tableau', t),
          cardIndex: 0,
        });
      }
    }
  }

  for (let t = 0; t < 7; t += 1) {
    const pile = state.tableau[t];
    for (let index = pile.length - 1; index >= 0; index -= 1) {
      if (!pile[index].faceUp) break;
      const moving = getMovingCards(state, ref('tableau', t), index);
      if (!moving) continue;
      if (moving.length > 1) continue;
      for (let f = 0; f < 4; f += 1) {
        if (canPlaceOnFoundation(moving[0], state.foundations[f])) {
          moves.push({
            type: 'move',
            from: ref('tableau', t),
            to: ref('foundation', f),
            cardIndex: index,
          });
        }
      }
    }
  }

  if (state.waste.length) {
    const card = state.waste[state.waste.length - 1];
    for (let f = 0; f < 4; f += 1) {
      if (canPlaceOnFoundation(card, state.foundations[f])) {
        moves.push({
          type: 'move',
          from: ref('waste'),
          to: ref('foundation', f),
          cardIndex: 0,
        });
      }
    }
    for (let t = 0; t < 7; t += 1) {
      if (canPlaceOnTableau(card, state.tableau[t])) {
        moves.push({
          type: 'move',
          from: ref('waste'),
          to: ref('tableau', t),
          cardIndex: 0,
        });
      }
    }
  }

  for (let t = 0; t < 7; t += 1) {
    const pile = state.tableau[t];
    for (let index = 0; index < pile.length; index += 1) {
      const moving = getMovingCards(state, ref('tableau', t), index);
      if (!moving) continue;
      for (let d = 0; d < 7; d += 1) {
        if (d === t) continue;
        if (!canPlaceOnTableau(moving[0], state.tableau[d])) continue;
        if (state.tableau[d].length === 0 && index === 0) continue;
        moves.push({
          type: 'move',
          from: ref('tableau', t),
          to: ref('tableau', d),
          cardIndex: index,
        });
      }
    }
  }

  if (state.stock.length) {
    moves.push({ type: 'draw' });
  } else if (state.waste.length) {
    moves.push({ type: 'recycle' });
  }

  return moves;
}

function moveKey(move) {
  return JSON.stringify(move);
}

function chooseMove(state, recent, draw) {
  const moves = possibleMoves(state);
  if (!moves.length) return null;

  const score = (move) => {
    if (move.type === 'draw') return 20;
    if (move.type === 'recycle') return 80;
    const key = moveKey(move);
    if (recent.includes(key)) return 1000;
    if (move.to.pile === 'foundation') return 0;
    if (move.from.pile === 'waste' && move.to.pile === 'tableau') return 1;
    if (move.type === 'move' && move.from.pile === 'tableau') {
      const source = state.tableau[move.from.index];
      const below = source[move.cardIndex - 1];
      if (below && !below.faceUp) return 2;
      if (move.to.pile === 'tableau' && state.tableau[move.to.index].length === 0) {
        return 8;
      }
      return 5;
    }
    return 6;
  };

  moves.sort((a, b) => score(a) - score(b));
  return moves[0];
}

function simulate(state, draw) {
  const moves = [];
  const recent = [];
  let score = 0;
  let current = state;

  for (let step = 0; step < 400; step += 1) {
    if (isWon(current)) {
      return { won: true, moves, score, state: current };
    }
    const move = chooseMove(current, recent, draw);
    if (!move) break;

    if (move.type === 'draw') {
      const next = drawCards(current, draw);
      if (!next) break;
      current = next;
      moves.push({ type: 'draw' });
      recent.push(moveKey(move));
    } else if (move.type === 'recycle') {
      const next = recycleCards(current);
      if (!next) break;
      current = next;
      score += recyclePenalty('standard', draw);
      moves.push({ type: 'recycle' });
      recent.push(moveKey(move));
    } else {
      const result = applyMove(current, move.from, move.to, move.cardIndex);
      if (!result.ok) break;
      score += scoreForMove(
        'standard',
        draw,
        move.from,
        move.to,
        result.flipped,
      );
      current = result.state;
      moves.push(move);
      recent.push(moveKey(move));
    }
    if (recent.length > 6) recent.shift();
  }

  return { won: isWon(current), moves, score, state: current };
}

let previousId = null;
let last = null;
let wins = 0;

for (let attempt = 1; attempt <= 60; attempt += 1) {
  const game = await request('/games', {
    method: 'POST',
    body: JSON.stringify({
      draw: 1,
      scoring: 'standard',
      timed: false,
      abandonGameId: previousId,
    }),
  });
  previousId = game.id;

  const result = simulate(game.state, 1);
  last = { game, result };
  if (!result.won) continue;

  const saved = await request(`/games/${game.id}`, {
    method: 'PUT',
    body: JSON.stringify({ moves: result.moves, elapsed: 100 }),
  });
  if (saved.score !== result.score) {
    throw new Error(
      `Pontuação divergente: JS ${result.score}, Rust ${saved.score}`,
    );
  }

  const finished = await request(`/games/${game.id}/finish`, {
    method: 'POST',
    body: JSON.stringify({ player: 'Verificador', seconds: 100 }),
  });
  if (finished.score !== result.score) {
    throw new Error(
      `Pontuação final divergente: JS ${result.score}, Rust ${finished.score}`,
    );
  }

  wins += 1;
  console.log('vitória encontrada', {
    attempt,
    moves: result.moves.length,
    score: result.score,
    isRecord: finished.isRecord,
  });
  break;
}

if (!wins) {
  console.log('nenhuma vitória em 60 partidas; testando paridade parcial');
  if (last) {
    const saved = await request(`/games/${last.game.id}`, {
      method: 'PUT',
      body: JSON.stringify({ moves: last.result.moves, elapsed: 100 }),
    });
    console.log('paridade parcial', {
      moves: last.result.moves.length,
      js: last.result.score,
      rust: saved.score,
      won: last.result.won,
    });
  }
}
