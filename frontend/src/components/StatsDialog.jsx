import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { formatScore, formatTime } from '../game/scoring.js';
import { loadLocalScores } from '../game/storage.js';
import Dialog from './Dialog.jsx';

function fallbackFromLocal() {
  const local = loadLocalScores();
  const best = local.reduce(
    (current, entry) =>
      !current || entry.score > current.score ? entry : current,
    null,
  );
  const fastest = local.reduce(
    (current, entry) =>
      !current || entry.seconds < current.seconds ? entry : current,
    null,
  );
  return {
    stats: {
      played: local.length,
      won: local.length,
      winRate: local.length ? 100 : 0,
      bestScore: best?.score ?? null,
      bestSeconds: fastest?.seconds ?? null,
      totalMoves: local.reduce((total, entry) => total + entry.moves, 0),
    },
    scores: local.slice(0, 5),
  };
}

export default function StatsDialog({ onClose, refreshKey = 0 }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [stats, scores] = await Promise.all([api.stats(), api.scores(5)]);
        if (!cancelled) {
          setData({ stats, scores, offline: false });
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setData({ ...fallbackFromLocal(), offline: true });
          setError(
            'O backend não está disponível. Exibindo apenas os recordes salvos neste navegador.',
          );
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <Dialog
      title="Estatísticas"
      width={430}
      onClose={onClose}
      buttons={
        <button type="button" className="win-button primary" onClick={onClose}>
          OK
        </button>
      }
    >
      {!data && <p className="dialog-text">Carregando estatísticas...</p>}

      {data && (
        <>
          <div className="stats-grid">
            <span>Partidas iniciadas</span>
            <span className="value">{data.stats.played}</span>
            <span>Vitórias</span>
            <span className="value">{data.stats.won}</span>
            <span>Aproveitamento</span>
            <span className="value">{data.stats.winRate}%</span>
            <span>Melhor pontuação</span>
            <span className="value">
              {data.stats.bestScore == null ? '—' : data.stats.bestScore}
            </span>
            <span>Melhor tempo</span>
            <span className="value">
              {data.stats.bestSeconds == null
                ? '—'
                : formatTime(data.stats.bestSeconds)}
            </span>
            <span>Jogadas vitoriosas</span>
            <span className="value">{data.stats.totalMoves}</span>
          </div>

          <table className="score-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th className="numeric">Pontos</th>
                <th className="numeric">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {data.scores.length === 0 && (
                <tr>
                  <td colSpan={4}>Nenhum recorde ainda. Ganhe uma partida!</td>
                </tr>
              )}
              {data.scores.map((entry, index) => (
                <tr key={entry.id ?? `${entry.player}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{entry.player}</td>
                  <td className="numeric">
                    {formatScore(entry.scoring, entry.score)}
                  </td>
                  <td className="numeric">{formatTime(entry.seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {error && <p className="form-note">{error}</p>}
        </>
      )}
    </Dialog>
  );
}
