import { formatScore, formatTime } from '../game/scoring.js';
import Dialog from './Dialog.jsx';

export default function WinDialog({
  result,
  scoring,
  onNew,
  onClose,
  onOpenCourses,
}) {
  return (
    <Dialog
      title="Colação de Grau - Concluída com Sucesso!"
      width={420}
      onClose={onClose}
      buttons={
        <>
          <button
            type="button"
            className="win-button"
            onClick={onOpenCourses}
            title="Abrir o Guia de Cursos da Etec e Fatec"
          >
            📖 Conhecer Cursos
          </button>
          <button type="button" className="win-button" onClick={onClose}>
            Ver tabuleiro
          </button>
          <button type="button" className="win-button primary" onClick={onNew}>
            Nova Jornada
          </button>
        </>
      }
    >
      <div className="dialog-with-icon">
        <div className="dialog-icon" style={{ fontSize: 24 }} aria-hidden="true">
          🎓
        </div>
        <div className="dialog-text">
          <h2
            className="win-dialog-headline"
            style={{ color: '#000080', margin: '0 0 6px' }}
          >
            Parabéns, Formando!
          </h2>
          <p>
            Você completou a jornada acadêmica com maestria! Todas as fundações
            do conhecimento foram preenchidas e seu diploma está pronto.
          </p>
        </div>
      </div>

      <div className="win-summary">
        <span>Pontuação Final</span>
        <span className="value">
          {result ? formatScore(scoring, result.score) : '—'}
        </span>
        <span>Tempo de Curso</span>
        <span className="value">
          {result ? formatTime(result.seconds) : '—'}
        </span>
        <span>Jogadas Realizadas</span>
        <span className="value">{result?.moves ?? '—'}</span>
      </div>

      {result?.isRecord && (
        <div className="record-badge">⭐ Novo Recorde Acadêmico! ⭐</div>
      )}

      <div
        style={{
          marginTop: 10,
          padding: 8,
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: 3,
          fontSize: 11,
        }}
      >
        <strong>Centro Paula Souza:</strong> O aprendizado não para por aqui.
        Explore as graduações na Fatec e os cursos técnicos na Etec clicando em{' '}
        <em>Conhecer Cursos</em>!
      </div>

      {result?.offline && (
        <p className="form-note">
          O backend não respondeu. O resultado foi guardado neste navegador.
        </p>
      )}
    </Dialog>
  );
}
