import { invoke, isTauri } from '@tauri-apps/api/core';

export { isTauri };

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (response.status === 204) return null;

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      throw new ApiError(
        payload?.error || `A API respondeu com erro ${response.status}.`,
        response.status,
      );
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('O backend demorou demais para responder.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function tauriInvoke(cmd, args) {
  try {
    return await invoke(cmd, args);
  } catch (error) {
    throw new ApiError(typeof error === 'string' ? error : error?.message || 'Erro IPC');
  }
}

export const api = {
  health: async () => {
    if (isTauri()) return { status: 'ok', service: 'tauri-ipc' };
    return request('/health', { timeout: 2500 });
  },

  createGame: async ({ draw, scoring, timed, abandonGameId }) => {
    if (isTauri()) {
      return tauriInvoke('create_game', {
        request: { draw, scoring, timed, abandonGameId },
      });
    }
    return request('/games', {
      method: 'POST',
      body: { draw, scoring, timed, abandonGameId },
    });
  },

  latestGame: async () => {
    if (isTauri()) {
      return tauriInvoke('latest_game');
    }
    return request('/games/latest');
  },

  getGame: async (id) => {
    if (isTauri()) {
      return tauriInvoke('get_game', { id });
    }
    return request(`/games/${encodeURIComponent(id)}`);
  },

  saveGame: async (id, { moves, elapsed }) => {
    if (isTauri()) {
      return tauriInvoke('save_game', {
        id,
        request: { moves, elapsed },
      });
    }
    return request(`/games/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { moves, elapsed },
    });
  },

  finishGame: async (id, { player, seconds }) => {
    if (isTauri()) {
      return tauriInvoke('finish_game', {
        id,
        request: { player, seconds },
      });
    }
    return request(`/games/${encodeURIComponent(id)}/finish`, {
      method: 'POST',
      body: { player, seconds },
    });
  },

  scores: async (limit = 5) => {
    if (isTauri()) {
      return tauriInvoke('get_scores', { limit });
    }
    return request(`/scores?limit=${limit}`);
  },

  stats: async () => {
    if (isTauri()) {
      return tauriInvoke('get_stats');
    }
    return request('/stats');
  },
};

export async function closeApp() {
  if (isTauri()) {
    try {
      await invoke('close_app');
    } catch {
      // fallback
    }
  }
}

export async function minimizeApp() {
  if (isTauri()) {
    try {
      await invoke('minimize_window');
    } catch {
      // fallback
    }
  }
}

export async function toggleMaximizeApp() {
  if (isTauri()) {
    try {
      await invoke('toggle_maximize_window');
    } catch {
      // fallback
    }
  }
}
