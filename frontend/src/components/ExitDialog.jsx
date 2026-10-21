import { isTauri } from '@tauri-apps/api/core';
import Dialog from './Dialog.jsx';
import { closeApp } from '../api/client.js';

export default function ExitDialog({ onClose }) {
  const inTauri = isTauri();

  const handleConfirmExit = () => {
    if (inTauri) {
      closeApp();
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      title="Sair"
      width={360}
      onClose={onClose}
      buttons={
        inTauri ? (
          <>
            <button
              type="button"
              className="win-button primary"
              onClick={handleConfirmExit}
            >
              Sair
            </button>
            <button type="button" className="win-button" onClick={onClose}>
              Cancelar
            </button>
          </>
        ) : (
          <button type="button" className="win-button primary" onClick={onClose}>
            OK
          </button>
        )
      }
    >
      <div className="dialog-text">
        {inTauri ? (
          <>
            <p>Deseja realmente sair do Paciência?</p>
            <p>O jogo em andamento é salvo automaticamente.</p>
          </>
        ) : (
          <>
            <p>Para sair do Paciência, feche esta aba do navegador.</p>
            <p>O jogo em andamento é salvo automaticamente.</p>
          </>
        )}
      </div>
    </Dialog>
  );
}
