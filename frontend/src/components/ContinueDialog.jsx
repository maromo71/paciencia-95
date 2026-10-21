import { formatTime, SCORING_MODES } from '../game/scoring.js';
import Dialog from './Dialog.jsx';

export default function ContinueDialog({ game, onContinue, onNew }) {
  return (
    <Dialog
      title="Paciência"
      width={390}
      onClose={onContinue}
      buttons={
        <>
          <button type="button" className="win-button" onClick={onNew}>
            Novo jogo
          </button>
          <button
            type="button"
            className="win-button primary"
            onClick={onContinue}
          >
            Continuar
          </button>
        </>
      }
    >
      <div className="dialog-with-icon">
        <div className="dialog-icon" aria-hidden="true">
          ♠
        </div>
        <div className="dialog-text">
          <p>Há uma partida anterior salva. Deseja continuar?</p>
          <p>
            Compra: {game.draw === 1 ? 'uma carta' : 'três cartas'} · Pontuação:{' '}
            {SCORING_MODES[game.scoring]} · Tempo:{' '}
            {formatTime(game.elapsed)}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
