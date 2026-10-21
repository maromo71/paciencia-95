import { formatScore, formatTime } from '../game/scoring.js';
import Dialog from './Dialog.jsx';

export default function WinDialog({ result, scoring, onNew, onClose }) {
  return (
    <Dialog
      title="Você ganhou!"
      width={390}
      onClose={onClose}
      buttons={
        <>
          <button type="button" className="win-button" onClick={onClose}>
            Ver tabuleiro
          </button>
          <button type="button" className="win-button primary" onClick={onNew}>
            Jogar novamente
          </button>
        </>
      }
    >
      <h2 className="win-dialog-headline">Parabéns!</h2>
      <p className="dialog-text">
        Todas as cartas chegaram às fundações. Esta é a sua pontuação:
      </p>

      <div className="win-summary">
        <span>Pontuação</span>
        <span className="value">
          {result ? formatScore(scoring, result.score) : '—'}
        </span>
        <span>Tempo</span>
        <span className="value">
          {result ? formatTime(result.seconds) : '—'}
        </span>
        <span>Jogadas</span>
        <span className="value">{result?.moves ?? '—'}</span>
      </div>

      {result?.isRecord && <div className="record-badge">Novo recorde!</div>}

      {result?.offline && (
        <p className="form-note">
          O backend não respondeu. O resultado foi guardado neste navegador.
        </p>
      )}
    </Dialog>
  );
}
