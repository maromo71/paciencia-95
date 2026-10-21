import { describe, expect, it } from 'vitest';
import {
  formatScore,
  formatTime,
  initialScore,
  recyclePenalty,
  scoreForMove,
  winBonus,
} from './scoring.js';

const tableau = { pile: 'tableau', index: 0 };
const waste = { pile: 'waste', index: 0 };
const foundation = { pile: 'foundation', index: 0 };

describe('pontuação', () => {
  it('começa em zero, exceto no modo Vegas', () => {
    expect(initialScore('standard')).toBe(0);
    expect(initialScore('none')).toBe(0);
    expect(initialScore('vegas')).toBe(-52);
  });

  it('aplica a tabela padrão', () => {
    expect(scoreForMove('standard', 3, waste, tableau, false)).toBe(5);
    expect(scoreForMove('standard', 3, waste, tableau, true)).toBe(10);
    expect(scoreForMove('standard', 3, tableau, foundation, false)).toBe(10);
    expect(scoreForMove('standard', 3, foundation, tableau, false)).toBe(-15);
    expect(scoreForMove('standard', 3, tableau, tableau, false)).toBe(0);
  });

  it('aplica penalidade de reciclagem conforme a compra', () => {
    expect(recyclePenalty('standard', 3)).toBe(-100);
    expect(recyclePenalty('standard', 1)).toBe(-20);
    expect(recyclePenalty('vegas', 3)).toBe(0);
  });

  it('paga cinco dólares por carta no Vegas', () => {
    expect(scoreForMove('vegas', 3, waste, foundation, false)).toBe(5);
    expect(scoreForMove('vegas', 3, tableau, foundation, false)).toBe(5);
    expect(scoreForMove('vegas', 3, waste, tableau, false)).toBe(0);
  });

  it('calcula o bônus clássico de tempo', () => {
    expect(winBonus('standard', true, 100)).toBe(7000);
    expect(winBonus('standard', true, 30)).toBe(0);
    expect(winBonus('standard', false, 100)).toBe(0);
    expect(winBonus('vegas', true, 100)).toBe(0);
  });

  it('formata pontuação e tempo', () => {
    expect(formatScore('standard', 120)).toBe('120');
    expect(formatScore('vegas', -52)).toBe('-$52');
    expect(formatScore('vegas', 120)).toBe('$120');
    expect(formatScore('none', 0)).toBe('—');
    expect(formatTime(42)).toBe('0:42');
    expect(formatTime(3661)).toBe('1:01:01');
  });
});
