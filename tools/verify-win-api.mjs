// Valida o fluxo completo de vitória no backend: replay, pontuação e finish.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const deal = JSON.parse(
  readFileSync(path.join(root, 'shared', 'fixtures', 'winning-deal.json'), 'utf8'),
);
const id = process.argv[2];
if (!id) throw new Error('informe o id da partida');

const API = 'http://127.0.0.1:3001/api';

async function request(url, options = {}) {
  const response = await fetch(`${API}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(payload?.error || `${response.status} ${response.statusText}`);
  }
  return payload;
}

const game = await request(`/games/${id}`);
console.log('carregada', {
  draw: game.draw,
  topCards: game.state.tableau.map((pile) => pile[pile.length - 1]?.rank),
});

const saved = await request(`/games/${id}`, {
  method: 'PUT',
  body: JSON.stringify({ moves: deal.moves, elapsed: 100 }),
});
console.log('replay backend', saved);

if (!saved.won) throw new Error('o backend não reconheceu a vitória');
if (saved.score !== deal.expectedScore) {
  throw new Error(`pontuação ${saved.score}, esperada ${deal.expectedScore}`);
}

const finished = await request(`/games/${id}/finish`, {
  method: 'POST',
  body: JSON.stringify({ player: 'Vitória de Teste', seconds: 100 }),
});
console.log('finish', finished);

if (finished.score !== deal.expectedScore) {
  throw new Error(`pontuação final ${finished.score}`);
}
console.log('ok: backend validou a vitória e gravou o recorde');
