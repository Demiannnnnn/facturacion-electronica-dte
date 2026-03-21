import axios from 'axios';
import tokenStore from '../../../utils/tokenStore.js';
import { getMachineId } from '../../../utils/machineId.js';
import { refreshTokens, clearSessionAndNotify } from '../core/auth-session.js';

const API_BASE_URL = process.env.API_URL || process.env.API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

function toSyncError(error, fallback = 'Error de sincronización') {
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data || {};
    return {
      status,
      message: data.error || data.message || fallback,
      data,
      offline: false
    };
  }

  if (error?.request) {
    return {
      status: 0,
      message: 'No se pudo conectar con el servidor',
      offline: true
    };
  }

  return {
    status: error?.status || 0,
    message: error?.message || fallback,
    offline: !!error?.offline
  };
}

function normalizeOperation(op) {
  const entityType = op.entity_type || op.entityType;
  const localId = op.entity_local_id ?? op.entityLocalId ?? op.local_id ?? op.localId;
  const operation = op.operation;
  const payload = op.payload || op.data || {};
  const queuedAt = op.queued_at || op.queuedAt || new Date().toISOString();

  if (!entityType || localId === undefined || !operation) {
    throw new Error('Operación inválida: faltan entity_type, entity_local_id u operation');
  }

  return {
    entity_type: entityType,
    entity_local_id: localId,
    operation,
    payload,
    queued_at: queuedAt
  };
}

apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.getAccessToken();
    config.headers.machineid = getMachineId();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
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

      originalConfig.headers = originalConfig.headers || {};
      originalConfig.headers.Authorization = `Bearer ${tokenStore.getAccessToken() || ''}`;
      return apiClient(originalConfig);
    }

    return Promise.reject(error);
  }
);

function isTrabajadorNotFoundFailure(entry = {}) {
  if ((entry.entity_type || '').toLowerCase() !== 'trabajador') {
    return false;
  }

  const code = String(entry.code || '').toLowerCase();
  const message = String(entry.message || entry.error || '').toLowerCase();
  return code === 'not_found' || message.includes('not_found') || message.includes('no existe');
}

function findOperationByFailedEntry(failedEntry, operations) {
  return (operations || []).find((op) => {
    const sameType = String(op.entity_type || '').toLowerCase() === String(failedEntry.entity_type || '').toLowerCase();
    const sameId = String(op.entity_local_id) === String(failedEntry.local_id ?? failedEntry.entity_local_id ?? failedEntry.id);
    return sameType && sameId;
  });
}

async function tryRecoverTrabajadorNotFound(failedEntries, operations) {
  if (!Array.isArray(failedEntries) || failedEntries.length === 0) {
    return { recoveredIds: new Set(), retryOperations: [] };
  }

  const apiTrabajadores = (await import('../facturacion/trabajadores.js')).default;
  const recoveredIds = new Set();
  const retryOperations = [];

  for (const failed of failedEntries) {
    if (!isTrabajadorNotFoundFailure(failed)) {
      continue;
    }

    const originalOp = findOperationByFailedEntry(failed, operations);
    if (!originalOp || originalOp.operation !== 'update') {
      continue;
    }

    try {
      const payload = originalOp.payload || {};
      await apiTrabajadores.createTrabajador({
        nombre: payload.nombre,
        rut: payload.rut,
        email: payload.email,
        password: payload.password || `Tmp-${originalOp.entity_local_id}-A1!`,
        rol: payload.rol || payload.cargo,
        permisos: payload.permisos,
        activo: payload.activo,
        local_id: payload.local_id || originalOp.entity_local_id
      });

      retryOperations.push(originalOp);
      recoveredIds.add(String(originalOp.entity_local_id));
    } catch (recoveryError) {
      console.warn('[SYNC] No se pudo recuperar trabajador not_found via POST /trabajadores:', recoveryError?.message || recoveryError);
    }
  }

  return { recoveredIds, retryOperations };
}

/**
 * SINCRONIZACIÓN DE FACTURAS
 */

/**
 * Enviar factura XML al servidor central
 * @param {Object} facturaData - Datos de la factura a enviar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function syncFacturaToServer(facturaData) {
  try {
    const operations = [
      {
        entity_type: 'documento',
        entity_local_id: facturaData.id || facturaData.local_id || facturaData.folio,
        operation: facturaData.deleted ? 'delete' : (facturaData.id ? 'update' : 'create'),
        payload: facturaData,
        queued_at: facturaData.updated_at || new Date().toISOString()
      }
    ];
    return await syncPushOperations(operations);
  } catch (error) {
    const parsed = toSyncError(error, 'Error al sincronizar factura');
    return { success: false, error: parsed.message, offline: parsed.offline };
  }
}

/**
 * Enviar XML de factura al servidor
 * @param {string} facturaId - ID de la factura
 * @param {string} xmlContent - Contenido XML del DTE
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function syncFacturaXML(facturaId, xmlContent) {
  try {
    const operations = [
      {
        entity_type: 'documento',
        entity_local_id: facturaId,
        operation: 'update',
        payload: { xml: xmlContent },
        queued_at: new Date().toISOString()
      }
    ];
    return await syncPushOperations(operations);
  } catch (error) {
    const parsed = toSyncError(error, 'Error al sincronizar XML');
    return { success: false, error: parsed.message, offline: parsed.offline };
  }
}

/**
 * SINCRONIZACIÓN DE DATOS DE VENTAS
 */

/**
 * Enviar datos de ventas al servidor
 * @param {Object} ventaData - Datos de la venta
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function syncVentaToServer(ventaData) {
  try {
    const operations = [
      {
        entity_type: 'documento',
        entity_local_id: ventaData.id || ventaData.local_id || ventaData.folio,
        operation: 'update',
        payload: ventaData,
        queued_at: ventaData.updated_at || new Date().toISOString()
      }
    ];
    return await syncPushOperations(operations);
  } catch (error) {
    const parsed = toSyncError(error, 'Error al sincronizar venta');
    return { success: false, error: parsed.message, offline: parsed.offline };
  }
}

/**
 * SINCRONIZACIÓN DE PRODUCTOS
 */

/**
 * Sincronizar productos con el servidor
 * @param {Array} productos - Lista de productos a sincronizar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function syncProductosToServer(productos) {
  try {
    const operations = (productos || []).map((p) => ({
      entity_type: 'producto',
      entity_local_id: p.id || p.local_id || p.codigo,
      operation: p.deleted ? 'delete' : 'update',
      payload: p,
      queued_at: p.updated_at || new Date().toISOString()
    }));
    return await syncPushOperations(operations);
  } catch (error) {
    const parsed = toSyncError(error, 'Error al sincronizar productos');
    return { success: false, error: parsed.message, offline: parsed.offline };
  }
}

/**
 * SINCRONIZACIÓN DE CLIENTES
 */

/**
 * Sincronizar clientes con el servidor
 * @param {Array} clientes - Lista de clientes a sincronizar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function syncClientesToServer(clientes) {
  try {
    const operations = (clientes || []).map((c) => ({
      entity_type: 'cliente',
      entity_local_id: c.id || c.local_id || c.rut,
      operation: c.deleted ? 'delete' : 'update',
      payload: c,
      queued_at: c.updated_at || new Date().toISOString()
    }));
    return await syncPushOperations(operations);
  } catch (error) {
    const parsed = toSyncError(error, 'Error al sincronizar clientes');
    return { success: false, error: parsed.message, offline: parsed.offline };
  }
}

/**
 * VERIFICACIÓN DE ESTADO DEL SERVIDOR
 */

/**
 * Verificar conexión con el servidor
 * @returns {Promise<boolean>} true si el servidor está disponible
 */
export async function checkServerConnection() {
  try {
    const response = await apiClient.get('/sync/status');
    return response.status === 200 && response.data?.success !== false;
  } catch (error) {
    console.error('[SYNC] Servidor no disponible:', toSyncError(error).message);
    return false;
  }
}

export async function syncPushOperations(operations = []) {
  if (!Array.isArray(operations) || operations.length === 0) {
    return {
      success: true,
      results: [],
      conflicts: [],
      failed: []
    };
  }

  const normalizedOps = operations.map(normalizeOperation);
  const token = tokenStore.getAccessToken();
  console.log(`[SYNC] PUSH ${normalizedOps.length} operaciones -> ${API_BASE_URL}/sync/push`, {
    hasToken: !!token,
    machineId: getMachineId()
  });

  try {
    const response = await apiClient.post('/sync/push', { operations: normalizedOps });
    const data = response.data || {};

    const failed = data.failed || [];
    const { recoveredIds, retryOperations } = await tryRecoverTrabajadorNotFound(failed, normalizedOps);

    let retryResults = [];
    let retryFailed = [];
    let retryConflicts = [];

    if (retryOperations.length > 0) {
      try {
        const retryResponse = await apiClient.post('/sync/push', { operations: retryOperations });
        const retryData = retryResponse.data || {};
        retryResults = retryData.results || [];
        retryFailed = retryData.failed || [];
        retryConflicts = retryData.conflicts || [];
      } catch (retryError) {
        const retryParsed = toSyncError(retryError, 'Error al reintentar sync de trabajadores recuperados');
        retryFailed = retryOperations.map((op) => ({
          entity_type: op.entity_type,
          local_id: op.entity_local_id,
          message: retryParsed.message,
          code: retryParsed.status === 401 ? 'auth_error' : 'retry_error'
        }));
      }
    }

    const baseFailed = failed.filter((entry) => {
      const id = String(entry.local_id ?? entry.entity_local_id ?? entry.id);
      return !recoveredIds.has(id);
    });

    return {
      success: data.success !== false,
      results: [...(data.results || []), ...retryResults],
      conflicts: [...(data.conflicts || []), ...retryConflicts],
      failed: [...baseFailed, ...retryFailed]
    };
  } catch (error) {
    const parsed = toSyncError(error, 'Error al ejecutar sync/push');
    return {
      success: false,
      error: parsed.message,
      status: parsed.status,
      offline: parsed.offline,
      results: [],
      conflicts: [],
      failed: []
    };
  }
}

export async function syncPullChanges(since) {
  try {
    const response = await apiClient.get('/sync/pull', {
      params: since ? { since } : {}
    });
    return response.data;
  } catch (error) {
    const parsed = toSyncError(error, 'Error al ejecutar sync/pull');
    return { success: false, error: parsed.message, status: parsed.status, offline: parsed.offline };
  }
}

export async function syncResolveConflict(conflictData) {
  try {
    const response = await apiClient.post('/sync/resolve-conflict', conflictData || {});
    return response.data;
  } catch (error) {
    const parsed = toSyncError(error, 'Error al resolver conflicto de sync');
    return { success: false, error: parsed.message, status: parsed.status, offline: parsed.offline };
  }
}

export async function syncGetStatus() {
  try {
    const response = await apiClient.get('/sync/status');
    return response.data;
  } catch (error) {
    const parsed = toSyncError(error, 'Error al consultar estado de sync');
    return { success: false, error: parsed.message, status: parsed.status, offline: parsed.offline };
  }
}

/**
 * COLA DE SINCRONIZACIÓN (para modo offline)
 */

// Cola en memoria (temporal)
let syncQueue = [];

/**
 * Añadir operación a la cola de sincronización
 * @param {Object} operation - Operación a encolar
 */
export function addToSyncQueue(operation) {
  syncQueue.push({
    ...operation,
    queuedAt: new Date().toISOString()
  });
  
  console.log('[SYNC] Operación añadida a cola:', operation.type);
  console.log('[SYNC] Items en cola:', syncQueue.length);
}

/**
 * Procesar cola de sincronización
 * @returns {Promise<Object>} Resultado del procesamiento
 */
export async function processSyncQueue() {
  if (syncQueue.length === 0) {
    return { success: true, processed: 0 };
  }

  console.log('[SYNC] Procesando cola:', syncQueue.length, 'items');
  const pushResult = await syncPushOperations(syncQueue);

  if (!pushResult.success) {
    return {
      success: false,
      processed: 0,
      failed: syncQueue.length,
      errors: [pushResult.error || 'No se pudo procesar la cola']
    };
  }

  const processedIds = new Set((pushResult.results || []).map((r) => `${r.entity_type || ''}:${r.local_id}`));
  const failedIds = new Set((pushResult.failed || []).map((r) => `${r.entity_type || ''}:${r.local_id}`));
  const conflictIds = new Set((pushResult.conflicts || []).map((r) => `${r.entity_type || ''}:${r.local_id}`));

  syncQueue = syncQueue.filter((op) => {
    const normalized = normalizeOperation(op);
    const id = `${normalized.entity_type}:${normalized.entity_local_id}`;
    return failedIds.has(id) || conflictIds.has(id);
  });

  return {
    success: true,
    processed: processedIds.size,
    failed: failedIds.size,
    conflicts: conflictIds.size,
    remainingInQueue: syncQueue.length,
    server: pushResult
  };
}

/**
 * Obtener tamaño de la cola de sincronización
 * @returns {number} Número de items en cola
 */
export function getSyncQueueSize() {
  return syncQueue.length;
}

export default {
  syncFacturaToServer,
  syncFacturaXML,
  syncVentaToServer,
  syncProductosToServer,
  syncClientesToServer,
  syncPushOperations,
  syncPullChanges,
  syncResolveConflict,
  syncGetStatus,
  checkServerConnection,
  addToSyncQueue,
  processSyncQueue,
  getSyncQueueSize
};
