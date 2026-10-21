import { serializeGame } from './gameReducer.js';

const SAVE_KEY = 'paciencia95.save.v1';
const OPTIONS_KEY = 'paciencia95.options.v1';
const LOCAL_SCORES_KEY = 'paciencia95.scores.v1';

export const DEFAULT_OPTIONS = {
  draw: 3,
  scoring: 'standard',
  timed: false,
  cardBack: 'chipset',
  player: 'Jogador',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const CARD_BACKS = [
  'chipset',
  'campus',
  'etec',
  'terminal',
  'blue',
  'red',
  'green',
  'castle',
  'beach',
  'robot',
  'hand',
  'fish',
];

export function normalizeOptions(value) {
  return {
    draw: value?.draw === 1 ? 1 : 3,
    scoring: ['standard', 'vegas', 'none'].includes(value?.scoring)
      ? value.scoring
      : 'standard',
    timed: Boolean(value?.timed),
    cardBack: CARD_BACKS.includes(value?.cardBack)
      ? value.cardBack
      : 'blue',
    player: String(value?.player || 'Jogador').slice(0, 24),
  };
}

export function loadOptions() {
  return normalizeOptions(read(OPTIONS_KEY));
}

export function saveOptions(options) {
  const normalized = normalizeOptions(options);
  write(OPTIONS_KEY, normalized);
  return normalized;
}

export function loadSave() {
  const saved = read(SAVE_KEY);
  if (!saved || saved.version !== 1 || !saved.state) return null;
  return saved;
}

export function saveSave(game) {
  write(SAVE_KEY, serializeGame(game));
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // localStorage indisponível: o jogo continua em memória.
  }
}

export function loadLocalScores() {
  const scores = read(LOCAL_SCORES_KEY);
  return Array.isArray(scores) ? scores : [];
}

export function addLocalScore(score) {
  const scores = loadLocalScores();
  scores.push({
    id: `local-${Date.now()}`,
    player: score.player || 'Jogador',
    score: score.score,
    seconds: score.seconds,
    moves: score.moves,
    draw: score.draw,
    scoring: score.scoring,
    createdAt: Math.floor(Date.now() / 1000),
  });
  scores.sort((a, b) => b.score - a.score || a.seconds - b.seconds);
  write(LOCAL_SCORES_KEY, scores.slice(0, 20));
  return scores.slice(0, 20);
}
