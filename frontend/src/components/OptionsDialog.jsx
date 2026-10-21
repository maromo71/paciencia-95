import { useState } from 'react';
import CardBack from './CardBack.jsx';
import Dialog from './Dialog.jsx';

const BACKS = [
  { id: 'chipset', label: 'FATEC Chipset' },
  { id: 'campus', label: 'Campus Etec/Fatec' },
  { id: 'etec', label: 'ETEC Técnico' },
  { id: 'terminal', label: 'DOS Vestibular' },
  { id: 'blue', label: 'Clássico Azul' },
  { id: 'red', label: 'Clássico Vermelho' },
  { id: 'green', label: 'Clássico Verde' },
  { id: 'castle', label: 'Castelo Retrô' },
  { id: 'beach', label: 'Praia 95' },
  { id: 'robot', label: 'Robô Cyber' },
  { id: 'hand', label: 'Ás na Manga' },
  { id: 'fish', label: 'Aquário 95' },
];

export default function OptionsDialog({ options, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...options });

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const restart =
    draft.draw !== options.draw ||
    draft.scoring !== options.scoring ||
    draft.timed !== options.timed;

  const save = () => {
    onSave(
      {
        ...draft,
        player: draft.player.trim().slice(0, 24) || 'Jogador',
      },
      restart,
    );
  };

  return (
    <Dialog
      title="Opções"
      width={380}
      onClose={onClose}
      buttons={
        <>
          <button type="button" className="win-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="win-button primary" onClick={save}>
            OK
          </button>
        </>
      }
    >
      <fieldset>
        <legend>Comprar</legend>
        <label className="option-row">
          <input
            type="radio"
            name="draw"
            checked={draft.draw === 1}
            onChange={() => update({ draw: 1 })}
          />
          Uma carta
        </label>
        <label className="option-row">
          <input
            type="radio"
            name="draw"
            checked={draft.draw === 3}
            onChange={() => update({ draw: 3 })}
          />
          Três cartas
        </label>
      </fieldset>

      <fieldset>
        <legend>Pontuação</legend>
        <label className="option-row">
          <input
            type="radio"
            name="scoring"
            checked={draft.scoring === 'standard'}
            onChange={() => update({ scoring: 'standard' })}
          />
          Padrão
        </label>
        <label className="option-row">
          <input
            type="radio"
            name="scoring"
            checked={draft.scoring === 'vegas'}
            onChange={() => update({ scoring: 'vegas' })}
          />
          Vegas
        </label>
        <label className="option-row">
          <input
            type="radio"
            name="scoring"
            checked={draft.scoring === 'none'}
            onChange={() => update({ scoring: 'none' })}
          />
          Nenhuma
        </label>
      </fieldset>

      <label className="option-row">
        <input
          type="checkbox"
          checked={draft.timed}
          onChange={(event) => update({ timed: event.target.checked })}
        />
        Jogo cronometrado
      </label>

      <fieldset>
        <legend>Verso das cartas</legend>
        <div className="card-back-picker">
          {BACKS.map((back) => (
            <button
              type="button"
              key={back.id}
              className={`card-back-choice ${
                draft.cardBack === back.id ? 'selected' : ''
              }`}
              title={back.label}
              aria-label={`Verso ${back.label}`}
              aria-pressed={draft.cardBack === back.id}
              onClick={() => update({ cardBack: back.id })}
            >
              <div className="card-back-swatch">
                <CardBack type={back.id} />
              </div>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="field-label" htmlFor="player-name">
        Seu nome
      </label>
      <input
        id="player-name"
        className="text-input"
        type="text"
        maxLength={24}
        value={draft.player}
        onChange={(event) => update({ player: event.target.value })}
      />

      {restart && (
        <p className="form-note">
          As opções de compra, pontuação e tempo começam uma nova partida. O
          verso e o nome podem ser alterados sem reiniciar.
        </p>
      )}
    </Dialog>
  );
}
