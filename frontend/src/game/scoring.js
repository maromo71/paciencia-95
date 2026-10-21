export const SCORING_MODES = {
  standard: 'Padrão',
  vegas: 'Vegas',
  none: 'Nenhuma',
};

export const DRAW_MODES = {
  1: 'Comprar uma',
  3: 'Comprar três',
};

// Tabela clássica do Paciência do Windows.
export const SCORE_RULES = {
  wasteToTableau: 5,
  toFoundation: 10,
  flipTableau: 5,
  foundationToTableau: -15,
  recycleDrawThree: -100,
  recycleDrawOne: -20,
  vegasAnte: -52,
  vegasFoundation: 5,
  winBonusBase: 700000,
  minimumBonusSeconds: 30,
};

export function initialScore(mode) {
  return mode === 'vegas' ? SCORE_RULES.vegasAnte : 0;
}

export function scoreForMove(mode, draw, from, to, flipped) {
  if (mode === 'none') return 0;
  if (mode === 'vegas') {
    return to.pile === 'foundation' ? SCORE_RULES.vegasFoundation : 0;
  }

  let delta = 0;
  if (to.pile === 'foundation') delta += SCORE_RULES.toFoundation;
  if (from.pile === 'foundation') delta += SCORE_RULES.foundationToTableau;
  if (from.pile === 'waste' && to.pile === 'tableau') {
    delta += SCORE_RULES.wasteToTableau;
  }
  if (flipped) delta += SCORE_RULES.flipTableau;
  return delta;
}

export function recyclePenalty(mode, draw) {
  if (mode !== 'standard') return 0;
  return draw === 3
    ? SCORE_RULES.recycleDrawThree
    : SCORE_RULES.recycleDrawOne;
}

export function winBonus(mode, timed, seconds) {
  if (mode !== 'standard' || !timed || seconds <= SCORE_RULES.minimumBonusSeconds) {
    return 0;
  }
  return Math.floor(SCORE_RULES.winBonusBase / seconds);
}

export function formatScore(mode, score) {
  if (mode === 'none') return '—';
  if (mode === 'vegas') {
    return score < 0 ? `-$${Math.abs(score)}` : `$${score}`;
  }
  return String(score);
}

export function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
  }
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
