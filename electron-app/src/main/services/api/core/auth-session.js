import fetch from 'node-fetch';
import { BrowserWindow } from 'electron';
import tokenStore from '../../../utils/tokenStore.js';
import { getMachineId } from '../../../utils/machineId.js';
import { clearCurrentUser } from '../../../utils/session.js';

const API_BASE_URL = process.env.API_BASE_URL || process.env.API_URL || 'http://localhost:3000/api';

let refreshInFlight = null;

function notifySessionExpired() {
  try {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send('auth:session-expired');
      }
    });
  } catch (error) {
    console.warn('[AUTH] No se pudo notificar expiracion de sesion al renderer:', error.message);
  }
}

export async function clearSessionAndNotify() {
  clearCurrentUser();
  tokenStore.setAccessToken(null);
  await tokenStore.deleteRefreshToken();
  notifySessionExpired();
}

export function extractTokens(payload = {}) {
  const accessToken =
    payload.accessToken ||
    payload.access ||
    payload.token ||
    payload?.tokens?.accessToken ||
    payload?.data?.accessToken ||
    payload?.data?.token ||
    null;

  const refreshToken =
    payload.refreshToken ||
    payload.refresh ||
    payload?.tokens?.refreshToken ||
    payload?.data?.refreshToken ||
    null;

  return { accessToken, refreshToken };
}

async function doRefreshRequest() {
  const refreshToken = await tokenStore.getRefreshToken();
  if (!refreshToken) {
    return { success: false, error: 'No hay refresh token disponible' };
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      machineid: getMachineId()
    },
    body: JSON.stringify({ refreshToken })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    return {
      success: false,
      error: payload?.error || payload?.message || 'No se pudo refrescar la sesion'
    };
  }

  const { accessToken, refreshToken: nextRefresh } = extractTokens(payload);
  if (!accessToken || !nextRefresh) {
    return { success: false, error: 'La respuesta de refresh no contiene tokens validos' };
  }

  await tokenStore.setTokens({ access: accessToken, refresh: nextRefresh });
  return { success: true, accessToken, refreshToken: nextRefresh };
}

export async function refreshTokens() {
  if (!refreshInFlight) {
    refreshInFlight = doRefreshRequest().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function isTokenExpiredResponse(response) {
  if (!response || response.status !== 401) {
    return false;
  }

  const payload = await response.clone().json().catch(() => null);
  return payload?.code === 'TOKEN_EXPIRED';
}

export function buildAuthHeaders(extraHeaders = {}) {
  const token = tokenStore.getAccessToken();
  const headers = {
    machineid: getMachineId(),
    ...extraHeaders
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function apiFetch(url, options = {}) {
  const originalHeaders = options.headers || {};

  const runRequest = (headers) => {
    return fetch(url, {
      ...options,
      headers
    });
  };

  let response = await runRequest(buildAuthHeaders(originalHeaders));

  if (await isTokenExpiredResponse(response)) {
    const refreshed = await refreshTokens();
    if (!refreshed.success) {
      await clearSessionAndNotify();
      return response;
    }

    // Reintento unico de la request original con el nuevo access token.
    response = await runRequest(buildAuthHeaders(originalHeaders));
  }

  return response;
}
