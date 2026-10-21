import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { api, isTauri, minimizeApp, toggleMaximizeApp } from './api/client.js';
import AboutDialog from './components/AboutDialog.jsx';
import Board from './components/Board.jsx';
import ContinueDialog from './components/ContinueDialog.jsx';
import ExitDialog from './components/ExitDialog.jsx';
import MenuBar from './components/MenuBar.jsx';
import OptionsDialog from './components/OptionsDialog.jsx';
import StatsDialog from './components/StatsDialog.jsx';
import StatusBar from './components/StatusBar.jsx';
import WinDialog from './components/WinDialog.jsx';
import WindowShell from './components/WindowShell.jsx';
import { createGame, gameReducer } from './game/gameReducer.js';
import { createLocalGame } from './game/session.js';
import { formatTime, SCORING_MODES } from './game/scoring.js';
import {
  addLocalScore,
  clearSave,
  loadLocalScores,
  loadOptions,
  loadSave,
  saveOptions,
  saveSave,
} from './game/storage.js';
import { useViewportScale } from './hooks/useViewportScale.js';
import './styles/win95.css';
import './styles/cards.css';
import './styles/board.css';

export default function App() {
  const [options, setOptions] = useState(() => loadOptions());
  const [game, dispatch] = useReducer(gameReducer, null);
  const [dialog, setDialog] = useState(null);
  const [pending, setPending] = useState(null);
  const [winResult, setWinResult] = useState(null);
  const [winAnimation, setWinAnimation] = useState(false);
  const [offline, setOffline] = useState(false);
  const [statsRefresh, setStatsRefresh] = useState(0);
  const [booting, setBooting] = useState(true);

  const bootedRef = useRef(false);
  const finishedGameRef = useRef(null);
  const scale = useViewportScale(660, 568);

  const startNewGame = useCallback(
    async (nextOptions = options, { abandonGameId } = {}) => {
      const chosen = { ...options, ...nextOptions };
      setDialog(null);
      setPending(null);
      setWinResult(null);
      setWinAnimation(false);
      finishedGameRef.current = null;

      const previousId =
        abandonGameId ??
        (game?.status === 'playing' &&
        game.id &&
        !game.id.startsWith('local-')
          ? game.id
          : null);

      try {
        const payload = await api.createGame({
          draw: chosen.draw,
          scoring: chosen.scoring,
          timed: chosen.timed,
          abandonGameId: previousId,
        });
        const next = createGame(payload);
        if (!next) throw new Error('Estado inicial inválido.');
        dispatch({ type: 'replace', game: next });
        setOffline(false);
      } catch {
        const next = createGame(createLocalGame(chosen));
        dispatch({ type: 'replace', game: next });
        setOffline(true);
      } finally {
        setBooting(false);
      }
    },
    [game, options],
  );

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    async function boot() {
      let remote = null;
      const local = loadSave();

      try {
        remote = await api.latestGame();
        setOffline(false);
      } catch {
        setOffline(true);
      }

      const remoteHasProgress = remote && (remote.moves?.length ?? 0) > 0;
      const localHasProgress = local && (local.moves?.length ?? 0) > 0;

      if (remoteHasProgress || localHasProgress) {
        const source = remoteHasProgress ? 'remote' : 'local';
        const restored = createGame(remoteHasProgress ? remote : local);
        if (restored) {
          dispatch({ type: 'replace', game: restored });
          setPending({ game: restored, source });
          setDialog('continue');
          setBooting(false);
          return;
        }
      }

      if (remote?.state) {
        const restored = createGame(remote);
        if (restored) {
          dispatch({ type: 'replace', game: restored });
          setBooting(false);
          return;
        }
      }

      await startNewGame(options);
    }

    boot();
    // A inicialização roda uma única vez; startNewGame usa o estado do primeiro render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const elapsedBucket = game ? Math.floor(game.elapsed / 5) : 0;

  useEffect(() => {
    if (!game) return undefined;

    if (game.status === 'playing') {
      saveSave(game);
    }

    if (
      game.status !== 'playing' ||
      !game.id ||
      game.id.startsWith('local-')
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      api
        .saveGame(game.id, { moves: game.moves, elapsed: game.elapsed })
        .then(() => setOffline(false))
        .catch(() => setOffline(true));
    }, 700);

    return () => clearTimeout(timer);
    // Salvamos ao mudar a quantidade de jogadas, o status ou a cada 5 segundos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, game?.moves.length, game?.status, elapsedBucket]);

  const isPlaying = game?.status === 'playing';

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = setInterval(() => {
      dispatch({ type: 'tick', now: Date.now() });
    }, 1000);
    return () => clearInterval(timer);
  }, [game?.id, isPlaying]);

  useEffect(() => {
    if (!game?.notice) return undefined;
    const timer = setTimeout(() => {
      dispatch({ type: 'clear-notice' });
    }, 2600);
    return () => clearTimeout(timer);
  }, [game?.notice]);

  useEffect(() => {
    if (!game || game.status !== 'won' || finishedGameRef.current === game.id) {
      return;
    }

    finishedGameRef.current = game.id;
    const seconds = game.elapsed;
    const moveCount = game.moves.length;
    clearSave();

    setWinResult({
      score: game.score,
      seconds,
      moves: moveCount,
      isRecord: false,
      pending: true,
    });

    async function persistResult() {
      let result = null;

      if (game.id && !game.id.startsWith('local-')) {
        try {
          await api.saveGame(game.id, {
            moves: game.moves,
            elapsed: seconds,
          });
          result = await api.finishGame(game.id, {
            player: options.player,
            seconds,
          });
          setOffline(false);
        } catch {
          setOffline(true);
        }
      }

      if (!result) {
        const previousBest = loadLocalScores().reduce(
          (best, entry) =>
            best == null || entry.score > best ? entry.score : best,
          null,
        );
        result = {
          score: game.score,
          seconds,
          moves: moveCount,
          isRecord: previousBest == null || game.score > previousBest,
          offline: true,
        };
        addLocalScore({
          player: options.player,
          score: game.score,
          seconds,
          moves: moveCount,
          draw: game.draw,
          scoring: game.scoring,
        });
      }

      setWinResult(result);
      setStatsRefresh((value) => value + 1);
    }

    persistResult();

    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduced) {
      setDialog('win');
    } else {
      setWinAnimation(true);
    }
    // Executa uma vez por partida vencida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.status, game?.id]);

  const handleNewGame = useCallback(() => {
    startNewGame(options);
  }, [options, startNewGame]);

  const handleOptionsSave = (next, restart) => {
    const normalized = saveOptions(next);
    setOptions(normalized);
    setDialog(null);
    if (restart) startNewGame(normalized);
  };

  const handleContinue = () => {
    if (pending?.game) {
      setOptions(
        saveOptions({
          ...options,
          draw: pending.game.draw,
          scoring: pending.game.scoring,
          timed: pending.game.timed,
        }),
      );
    }
    setPending(null);
    setDialog(null);
  };

  const handleDeclineContinue = () => {
    const previousId = pending?.game?.id;
    setPending(null);
    startNewGame(options, { abandonGameId: previousId });
  };

  const handleWinAnimationDone = useCallback(() => {
    setWinAnimation(false);
    setDialog('win');
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'F2') {
        event.preventDefault();
        if (!dialog && !winAnimation) startNewGame(options);
        return;
      }
      if (event.key === 'Escape') {
        if (winAnimation) {
          setWinAnimation(false);
          setDialog('win');
          return;
        }
        if (dialog) setDialog(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog, options, startNewGame, winAnimation]);

  const message = offline
    ? 'Backend indisponível — salvando neste navegador.'
    : game?.notice
      ? game.notice
      : game?.status === 'won'
        ? 'Você ganhou!'
        : `${SCORING_MODES[game?.scoring ?? 'standard']} · ${
            game?.draw === 1 ? 'comprar uma' : 'comprar três'
          } · F2 novo jogo`;

  return (
    <>
      <WindowShell
        scale={scale}
        onClose={() => setDialog('exit')}
        onMinimize={minimizeApp}
        onMaximize={toggleMaximizeApp}
      >
        <MenuBar
          onNewGame={handleNewGame}
          onOptions={() => setDialog('options')}
          onStats={() => setDialog('stats')}
          onAbout={() => setDialog('about')}
          onExit={() => setDialog('exit')}
          disabled={!game}
        />

        <div className="window-body">
          {!game || booting ? (
            <div className="loading-screen">
              <div className="loading-card">
                <div className="mini-deck" />
                <span>Embaralhando as cartas...</span>
              </div>
            </div>
          ) : (
            <div
              className="board-scaler"
              style={
                isTauri()
                  ? {
                      transform: `scale(${scale})`,
                      transformOrigin: 'center center',
                    }
                  : undefined
              }
            >
              <Board
                game={game}
                cardBack={options.cardBack}
                winAnimation={winAnimation}
                onWinAnimationDone={handleWinAnimationDone}
                onDraw={() => dispatch({ type: 'draw', now: Date.now() })}
                onRecycle={() => dispatch({ type: 'recycle', now: Date.now() })}
                onMove={(from, to, cardIndex) =>
                  dispatch({
                    type: 'move',
                    from,
                    to,
                    cardIndex,
                    now: Date.now(),
                  })
                }
              />
            </div>
          )}
        </div>

        <StatusBar
          score={game?.score ?? 0}
          scoring={game?.scoring ?? options.scoring}
          elapsed={game?.elapsed ?? 0}
          message={message}
        />
      </WindowShell>

      {dialog === 'continue' && pending && (
        <ContinueDialog
          game={pending.game}
          onContinue={handleContinue}
          onNew={handleDeclineContinue}
        />
      )}

      {dialog === 'options' && (
        <OptionsDialog
          options={options}
          onSave={handleOptionsSave}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === 'about' && <AboutDialog onClose={() => setDialog(null)} />}

      {dialog === 'stats' && (
        <StatsDialog
          onClose={() => setDialog(null)}
          refreshKey={statsRefresh}
        />
      )}

      {dialog === 'win' && game && (
        <WinDialog
          result={winResult}
          scoring={game.scoring}
          onNew={handleNewGame}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog === 'exit' && <ExitDialog onClose={() => setDialog(null)} />}

      {booting && !game && (
        <span className="sr-only" role="status">
          Carregando o jogo
        </span>
      )}

      {game?.status === 'won' && !winAnimation && dialog !== 'win' && (
        <span className="sr-only" role="status">
          Partida concluída em {formatTime(game.elapsed)}
        </span>
      )}
    </>
  );
}
