import { useEffect, useRef } from 'react';
import { RANK_LABELS, SUIT_SYMBOLS, isRed } from '../game/cards.js';

const WIDTH = 640;
const HEIGHT = 480;
const CARD_W = 71;
const CARD_H = 96;
const DURATION = 10_000;

function foundationX(index) {
  return WIDTH - 20 - CARD_W - (3 - index) * (CARD_W + 16);
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function drawCard(context, card, x, y, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;

  context.fillStyle = '#fffdf4';
  context.strokeStyle = '#263238';
  context.lineWidth = 1;
  roundedRect(context, x, y, CARD_W, CARD_H, 4);
  context.fill();
  context.stroke();

  const red = isRed(card);
  context.fillStyle = red ? '#b00000' : '#111111';
  context.font = 'bold 18px Tahoma, Arial, sans-serif';
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillText(RANK_LABELS[card.rank], x + 6, y + 4);

  context.font = '14px Tahoma, Arial, sans-serif';
  context.fillText(SUIT_SYMBOLS[card.suit], x + 6, y + 23);

  context.font = '30px Tahoma, Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(SUIT_SYMBOLS[card.suit], x + CARD_W / 2, y + CARD_H / 2 + 6);

  context.restore();
}

function drawGraduationCap(context, x, y, angle = 0, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;
  context.translate(x + CARD_W / 2, y + CARD_H / 2);
  context.rotate(angle);
  const size = 38;

  // Losango do capelo de formatura
  context.fillStyle = '#111827';
  context.strokeStyle = '#374151';
  context.lineWidth = 1.2;
  context.beginPath();
  context.moveTo(0, -size * 0.38);
  context.lineTo(size * 0.65, 0);
  context.lineTo(0, size * 0.38);
  context.lineTo(-size * 0.65, 0);
  context.closePath();
  context.fill();
  context.stroke();

  // Gorro inferior
  context.beginPath();
  context.rect(-size * 0.22, 0, size * 0.44, size * 0.26);
  context.fill();
  context.stroke();

  // Borla / Pingente dourado
  context.strokeStyle = '#d4af37';
  context.lineWidth = 1.6;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(size * 0.45, size * 0.3);
  context.stroke();
  context.fillStyle = '#d4af37';
  context.beginPath();
  context.arc(size * 0.45, size * 0.3, 2.5, 0, Math.PI * 2);
  context.fill();

  context.restore();
}

function drawDiploma(context, x, y, angle = 0, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;
  context.translate(x + CARD_W / 2, y + CARD_H / 2);
  context.rotate(angle);
  const w = 48;
  const h = 24;

  context.fillStyle = '#fffdf0';
  context.strokeStyle = '#a8a29e';
  context.lineWidth = 1;
  roundedRect(context, -w / 2, -h / 2, w, h, 4);
  context.fill();
  context.stroke();

  // Fita vermelha de graduação
  context.fillStyle = '#dc2626';
  context.fillRect(-5, -h / 2, 10, h);

  // Selo dourado de excelência CPS
  context.fillStyle = '#d4af37';
  context.beginPath();
  context.arc(0, 2, 4, 0, Math.PI * 2);
  context.fill();

  context.restore();
}

function renderItem(context, particle, x, y, alpha) {
  if (particle.itemType === 'cap') {
    drawGraduationCap(context, x, y, particle.angle, alpha);
  } else if (particle.itemType === 'diploma') {
    drawDiploma(context, x, y, particle.angle, alpha);
  } else {
    drawCard(context, particle.card, x, y, alpha);
  }
}

export default function WinAnimation({ active, foundations, onDone }) {
  const canvasRef = useRef(null);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!active) return undefined;

    const prefersReduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) {
      onDoneRef.current?.();
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    const context = canvas.getContext('2d');
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particles = [];
    foundations.forEach((pile, foundationIndex) => {
      pile.forEach((card, cardIndex) => {
        let itemType = 'card';
        if (cardIndex === 12) itemType = 'diploma'; // O Rei vira Diploma de formatura
        else if (cardIndex === 11) itemType = 'cap'; // A Dama joga o Capelo

        particles.push({
          card,
          itemType,
          startX: foundationX(foundationIndex) + (cardIndex % 3) * 2,
          startY: 20 + (cardIndex % 3) * 2,
          delay: foundationIndex * 45 + cardIndex * 32,
          x: foundationX(foundationIndex),
          y: 20,
          vx: 0,
          vy: 0,
          angle: 0,
          vRot: (Math.random() - 0.5) * 6,
          launched: false,
          removed: false,
          trail: [],
        });
      });
    });

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDoneRef.current?.();
    };

    let frame = 0;
    let previous = performance.now();
    let startedAt = previous;

    const animate = (now) => {
      const total = now - startedAt;
      const dt = Math.min(0.033, (now - previous) / 1000);
      previous = now;

      context.clearRect(0, 0, WIDTH, HEIGHT);

      for (const particle of particles) {
        if (total < particle.delay) continue;

        if (!particle.launched) {
          particle.launched = true;
          particle.x = particle.startX;
          particle.y = particle.startY;
          particle.vx = (Math.random() - 0.5) * 560;
          particle.vy = -520 - Math.random() * 380;
        }

        if (particle.removed) continue;

        particle.vy += 1350 * dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.angle += particle.vRot * dt;

        if (particle.y + CARD_H > HEIGHT) {
          particle.y = HEIGHT - CARD_H;
          particle.vy = -Math.abs(particle.vy) * 0.8;
          particle.vx *= 0.985;
          particle.vRot = (Math.random() - 0.5) * 8;
        }
        if (particle.x < 0) {
          particle.x = 0;
          particle.vx = Math.abs(particle.vx) * 0.8;
        }
        if (particle.x + CARD_W > WIDTH) {
          particle.x = WIDTH - CARD_W;
          particle.vx = -Math.abs(particle.vx) * 0.8;
        }

        particle.trail.unshift({ x: particle.x, y: particle.y });
        if (particle.trail.length > 7) particle.trail.pop();

        if (particle.x < -CARD_W * 2 || particle.x > WIDTH + CARD_W) {
          particle.removed = true;
          continue;
        }

        for (let index = particle.trail.length - 1; index >= 1; index -= 1) {
          const point = particle.trail[index];
          renderItem(context, particle, point.x, point.y, 0.055 * (7 - index));
        }
        renderItem(context, particle, particle.x, particle.y, 1);
      }

      if (total > DURATION) {
        finish();
        return;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      context.clearRect(0, 0, WIDTH, HEIGHT);
    };
  }, [active, foundations]);

  if (!active) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="win-canvas"
        aria-label="Animação de vitória e colação de grau. Clique para continuar."
        tabIndex={0}
        onClick={() => {
          if (!doneRef.current) {
            doneRef.current = true;
            onDoneRef.current?.();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!doneRef.current) {
              doneRef.current = true;
              onDoneRef.current?.();
            }
          }
        }}
      />
      <div className="win-hint">🎓 Parabéns Formando! Clique para receber o diploma</div>
    </>
  );
}
