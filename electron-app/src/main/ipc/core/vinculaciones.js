import { ipcMain } from 'electron';
import axios from 'axios';
import tokenStore from '../../utils/tokenStore.js';
import { refreshTokens, clearSessionAndNotify } from '../../services/api/core/auth-session.js';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const authAxios = axios.create();

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error?.config || {};
    const isExpiredToken =
      error?.response?.status === 401 &&
      error?.response?.data?.code === 'TOKEN_EXPIRED';

    if (isExpiredToken && !originalConfig._retry) {
      originalConfig._retry = true;
      const refreshed = await refreshTokens();

      if (!refreshed.success) {
        await clearSessionAndNotify();
        return Promise.reject(error);
      }

      originalConfig.headers = {
        ...(originalConfig.headers || {}),
        ...getAuthHeaders()
      };

      return authAxios(originalConfig);
    }

    return Promise.reject(error);
  }
);

function getAuthHeaders() {
  const token = tokenStore.getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function registerVinculacionesHandlers() {
  // Buscar usuarios (contador busca dueños, dueño busca contadores)
  ipcMain.handle('vinculaciones:buscar', async (event, query) => {
    try {
      const response = await authAxios.get(`${API_URL}/vinculaciones/buscar`, {
        params: { q: query },
        headers: getAuthHeaders(),
        timeout: 10000
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('[VINCULACIONES:buscar] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  });

  // Enviar solicitud de vinculación
  ipcMain.handle('vinculaciones:enviarSolicitud', async (event, targetUserId) => {
    try {
      const response = await authAxios.post(`${API_URL}/vinculaciones/solicitud`, {
        targetUserId
      }, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('[VINCULACIONES:enviarSolicitud] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  });

  // Obtener solicitudes pendientes (recibidas)
  ipcMain.handle('vinculaciones:pendientes', async () => {
    try {
      const response = await authAxios.get(`${API_URL}/vinculaciones/pendientes`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('[VINCULACIONES:pendientes] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  });

  // Obtener solicitudes enviadas
  ipcMain.handle('vinculaciones:enviadas', async () => {
    try {
      const response = await authAxios.get(`${API_URL}/vinculaciones/enviadas`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('[VINCULACIONES:enviadas] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  });

  // Obtener vínculos activos
  ipcMain.handle('vinculaciones:activas', async () => {
    try {
      const response = await authAxios.get(`${API_URL}/vinculaciones/activas`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('[VINCULACIONES:activas] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  });

  // Aceptar solicitud
  ipcMain.handle('vinculaciones:aceptar', async (event, id) => {
    try {
      const response = await authAxios.put(`${API_URL}/vinculaciones/${encodeURIComponent(id)}/aceptar`, {}, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('[VINCULACIONES:aceptar] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  });

  // Rechazar solicitud
  ipcMain.handle('vinculaciones:rechazar', async (event, id) => {
    try {
      const response = await authAxios.put(`${API_URL}/vinculaciones/${encodeURIComponent(id)}/rechazar`, {}, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('[VINCULACIONES:rechazar] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  });

  // Eliminar vínculo
  ipcMain.handle('vinculaciones:eliminar', async (event, id) => {
    try {
      const response = await authAxios.delete(`${API_URL}/vinculaciones/${encodeURIComponent(id)}`, {
        headers: getAuthHeaders(),
        timeout: 10000
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('[VINCULACIONES:eliminar] Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  });

  console.log('✅ Vinculaciones IPC handlers registered');
}
