import { formatScore, formatTime } from '../game/scoring.js';

export default function StatusBar({ score, scoring, elapsed, message }) {
  return (
    <div className="statusbar">
      <div className="status-pane score" aria-label="Pontuação">
        Pontuação: {formatScore(scoring, score)}
      </div>
      <div className="status-pane message" role="status" aria-live="polite">
        {message}
      </div>
      <div className="status-pane time" aria-label="Tempo">
        Tempo: {formatTime(elapsed)}
      </div>
    </div>
  );
}
