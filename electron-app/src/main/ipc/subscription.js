import { ipcMain } from 'electron';
import axios from 'axios';
import tokenStore from '../utils/tokenStore.js';
import { getCurrentUser } from '../utils/session.js';
import { getMachineId } from '../utils/machineId.js';

// URL de tu API REST (configurable)
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Días máximos que se permite usar el cache offline sin verificar con la API
const OFFLINE_GRACE_DAYS = 7;

/**
 * Helper para obtener headers de autenticación
 */
function getAuthHeaders() {
  const token = tokenStore.getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    machineid: getMachineId()
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function canUseParentSubscriptionCache() {
  const user = getCurrentUser();
  if (!user || !user.rol) return false;
  return user.rol !== 'dueño';
}

/**
 * Verificar si el error es de red/conexión (no un error HTTP del servidor)
 */
function isNetworkError(error) {
  if (!error) return false;
  // Sin respuesta del servidor = problema de red
  if (!error.response) return true;
  // Códigos que indican problemas de red/proxy, no de la API
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK') return true;
  return false;
}

/**
 * Calcular días transcurridos desde una fecha ISO
 */
function daysSince(isoDate) {
  if (!isoDate) return Infinity;
  const then = new Date(isoDate);
  if (isNaN(then.getTime())) return Infinity;
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

/**
 * Handlers IPC para gestión de suscripciones
 */

// Obtener estado de suscripción
ipcMain.handle('subscription:getStatus', async () => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();
    const hasAccessToken = !!tokenStore.getAccessToken();
    const allowParentCache = canUseParentSubscriptionCache();

    // Log detallado del estado actual
    const cachedSub = store.get('subscription');
    const cachedTrial = store.get('trial_used');
    console.log('📋 [SUBSCRIPTION:getStatus] Estado actual:', {
      hasAccessToken,
      allowParentCache,
      cachedSubscription: cachedSub || null,
      trialUsed: cachedTrial || false
    });

    // ═══════════════════════════════════════════════════════════
    // PASO 1: Si hay token, SIEMPRE intentar la API primero
    // ═══════════════════════════════════════════════════════════
    if (hasAccessToken) {
      try {
        const response = await axios.get(`${API_URL}/licencias/status`, {
          headers: getAuthHeaders(),
          timeout: 10000
        });

        if (response.data.success && response.data.licence) {
          const licence = response.data.licence;
          const now = new Date();
          const expiresAt = new Date(licence.expiresAt);
          const isActive = licence.status === 'active' && now < expiresAt;

          console.log('✅ [SUBSCRIPTION:getStatus] Licencia verificada con API:', {
            type: licence.type,
            status: licence.status,
            expiresAt: licence.expiresAt,
            isActive,
            licenceKey: licence.licenceKey
          });

          // Sincronizar a cache local con timestamp de verificación
          const subscription = {
            type: licence.type || (licence.notes === 'trial' ? 'trial' : 'paid'),
            status: licence.status,
            startedAt: licence.issuedAt,
            expiresAt: licence.expiresAt,
            licenceKey: licence.licenceKey,
            autoRenew: licence.type === 'paid',
            lastVerifiedAt: new Date().toISOString()
          };
          store.set('subscription', subscription);

          return {
            success: true,
            hasActiveSubscription: isActive,
            isTrial: subscription.type === 'trial',
            type: subscription.type,
            expiresAt: licence.expiresAt,
            isActive,
            isOffline: false,
            daysRemaining: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
          };
        }

        // API respondió OK pero sin licencia válida → usuario sin licencia
        console.log('⚠️ [SUBSCRIPTION:getStatus] API respondió sin licencia activa');
        store.delete('subscription');
        store.delete('trial_used');
        return {
          success: true,
          hasActiveSubscription: false,
          isTrial: false,
          isOffline: false
        };
      } catch (apiError) {
        // La API respondió con un error HTTP (el servidor está vivo)
        if (apiError.response?.status === 404) {
          console.log('⚠️ [SUBSCRIPTION:getStatus] API 404 - Usuario sin licencia, limpiando cache');
          store.delete('subscription');
          store.delete('trial_used');
          return {
            success: true,
            hasActiveSubscription: false,
            isTrial: false,
            isOffline: false
          };
        }

        // Error de RED (no se pudo conectar) → caer a offline
        if (isNetworkError(apiError)) {
          console.log('📴 [SUBSCRIPTION:getStatus] Sin conexión a la API, cayendo a modo offline:', apiError.message);
        } else {
          // Error del servidor (500, 401, etc.) pero SÍ hay conexión
          console.log('⚠️ [SUBSCRIPTION:getStatus] Error del servidor:', apiError.response?.status, apiError.message);
          // Para errores 401/403, no confiar en cache
          if (apiError.response?.status === 401 || apiError.response?.status === 403) {
            return {
              success: true,
              hasActiveSubscription: false,
              isTrial: false,
              isOffline: false,
              reason: 'Sesión expirada o no autorizada'
            };
          }
          // Otros errores del servidor → caer a offline como fallback
        }
      }
    }

    if (!hasAccessToken && allowParentCache) {
      try {
        const response = await axios.get(`${API_URL}/licencias/status`, {
          headers: getAuthHeaders(),
          timeout: 10000
        });

        if (response.data.success && response.data.licence) {
          const licence = response.data.licence;
          const now = new Date();
          const expiresAt = new Date(licence.expiresAt);
          const isActive = licence.status === 'active' && now < expiresAt;

          const subscription = {
            type: licence.type || (licence.notes === 'trial' ? 'trial' : 'paid'),
            status: licence.status,
            startedAt: licence.issuedAt,
            expiresAt: licence.expiresAt,
            licenceKey: licence.licenceKey,
            autoRenew: licence.type === 'paid',
            lastVerifiedAt: new Date().toISOString()
          };
          store.set('subscription', subscription);

          console.log('✅ [SUBSCRIPTION:getStatus] Licencia de cuenta principal obtenida por machineid');
          return {
            success: true,
            hasActiveSubscription: isActive,
            isTrial: subscription.type === 'trial',
            type: subscription.type,
            expiresAt: licence.expiresAt,
            isActive,
            isOffline: false,
            daysRemaining: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
          };
        }
      } catch (apiError) {
        if (!isNetworkError(apiError)) {
          console.log('⚠️ [SUBSCRIPTION:getStatus] No fue posible validar licencia por machineid:', apiError.response?.status || apiError.message);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PASO 2: MODO OFFLINE - Cache local con grace period
    // (llegamos aquí si: no hay token, o la API no respondió por red)
    // ═══════════════════════════════════════════════════════════

    // Sin token y no es cuenta hija asociada: no hay licencia disponible
    if (!hasAccessToken) {
      if (!allowParentCache) {
        console.log('🔒 [SUBSCRIPTION:getStatus] Sin token de acceso, sin suscripción');
        return {
          success: true,
          hasActiveSubscription: false,
          isTrial: false,
          isOffline: true
        };
      }

      console.log('👥 [SUBSCRIPTION:getStatus] Usuario hijo sin token, evaluando cache de la cuenta principal');
    }

    const subscription = store.get('subscription');

    if (!subscription) {
      console.log('❌ [SUBSCRIPTION:getStatus] Sin cache local de suscripción');
      return {
        success: true,
        hasActiveSubscription: false,
        isTrial: false,
        isOffline: true
      };
    }

    // Si el cache no tiene lastVerifiedAt (cache viejo), agregar timestamp ahora
    // para dar un grace period desde este momento
    if (!subscription.lastVerifiedAt) {
      console.log('🔄 [SUBSCRIPTION:getStatus] Cache sin lastVerifiedAt, marcando timestamp actual');
      subscription.lastVerifiedAt = new Date().toISOString();
      store.set('subscription', subscription);
    }

    // Verificar grace period: ¿hace cuánto se verificó con la API?
    const daysOffline = daysSince(subscription.lastVerifiedAt);

    if (daysOffline > OFFLINE_GRACE_DAYS) {
      console.log(`🚫 [SUBSCRIPTION:getStatus] Grace period expirado (${daysOffline} días sin verificar, máx ${OFFLINE_GRACE_DAYS})`);
      return {
        success: true,
        hasActiveSubscription: false,
        isTrial: false,
        isOffline: true,
        offlineExpired: true,
        reason: `Se requiere conexión a internet para verificar la licencia. Último contacto con servidor: hace ${daysOffline} días.`
      };
    }

    // Verificar si la licencia misma no está vencida
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    const isActive = subscription.status === 'active' && now < expiresAt;

    if (!isActive) {
      console.log('⏰ [SUBSCRIPTION:getStatus] Licencia expirada en cache local');
      return {
        success: true,
        hasActiveSubscription: false,
        isTrial: false,
        isOffline: true
      };
    }

    // Cache válido dentro del grace period
    console.log(`📦 [SUBSCRIPTION:getStatus] Usando cache offline (verificado hace ${daysOffline} día(s), grace: ${OFFLINE_GRACE_DAYS} días):`, {
      type: subscription.type,
      status: subscription.status,
      expiresAt: subscription.expiresAt,
      lastVerifiedAt: subscription.lastVerifiedAt,
      isActive
    });

    return {
      success: true,
      hasActiveSubscription: true,
      isTrial: subscription.type === 'trial',
      type: subscription.type,
      expiresAt: subscription.expiresAt,
      isActive: true,
      isOffline: true,
      daysRemaining: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)),
      offlineGraceRemaining: OFFLINE_GRACE_DAYS - daysOffline
    };
  } catch (error) {
    console.error('💥 [SUBSCRIPTION:getStatus] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Activar período de prueba (REQUIERE conexión a la API)
ipcMain.handle('subscription:activateTrial', async () => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();

    console.log('🆓 [SUBSCRIPTION:activateTrial] Iniciando activación de trial...');

    // Verificar si ya usó el período de prueba
    const hasUsedTrial = store.get('trial_used');
    if (hasUsedTrial) {
      console.log('⛔ [SUBSCRIPTION:activateTrial] Trial ya fue usado anteriormente');
      return {
        success: false,
        error: 'Ya has utilizado el período de prueba anteriormente'
      };
    }

    // Calcular fecha de vencimiento (3 meses)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    // Crear licencia trial en la API (obligatorio - sin API no se activa)
    let response;
    try {
      response = await axios.post(`${API_URL}/licencias/activate`, {
        type: 'trial',
        expiresAt: expiresAt.toISOString(),
        notes: 'Período de prueba gratuito - 3 meses'
      }, {
        headers: getAuthHeaders(),
        timeout: 15000
      });
    } catch (apiError) {
      if (isNetworkError(apiError)) {
        return {
          success: false,
          error: 'Se requiere conexión a internet para activar el período de prueba'
        };
      }
      return {
        success: false,
        error: apiError.response?.data?.message || apiError.message || 'Error al activar el período de prueba'
      };
    }

    if (!response.data.success || !response.data.licence) {
      return {
        success: false,
        error: response.data.error || 'No se pudo activar el trial en el servidor'
      };
    }

    const licence = response.data.licence;
    const licenceKey = licence.licenceKey;

    const subscription = {
      type: 'trial',
      status: 'active',
      startedAt: licence.issuedAt || new Date().toISOString(),
      expiresAt: licence.expiresAt || expiresAt.toISOString(),
      autoRenew: false,
      licenceKey,
      lastVerifiedAt: new Date().toISOString()
    };

    store.set('subscription', subscription);
    store.set('trial_used', true);

    console.log('✅ [SUBSCRIPTION:activateTrial] Trial activado via API:', {
      licenceKey,
      expiresAt: subscription.expiresAt,
      type: subscription.type
    });

    return {
      success: true,
      expiresAt: subscription.expiresAt,
      licenceKey,
      message: 'Período de prueba activado correctamente'
    };
  } catch (error) {
    console.error('💥 [SUBSCRIPTION:activateTrial] Error:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error al activar el período de prueba'
    };
  }
});

// Inicializar pago con Flow
ipcMain.handle('subscription:initializePayment', async (event, { email, plan }) => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();

    const selectedPlan = plan || 'monthly';
    console.log('💳 [SUBSCRIPTION:initializePayment] Creando orden de pago:', { email, plan: selectedPlan });

    // Llamar a la API para crear orden de pago en Flow
    // El monto se determina en la API según el plan (no se envía desde el cliente)
    const response = await axios.post(`${API_URL}/flow/create-order`, {
      email: email || store.get('user_email'),
      plan: selectedPlan
    }, {
      headers: getAuthHeaders()
    });

    console.log('Flow create-order response:', JSON.stringify(response.data, null, 2));

    const data = response.data;
    const paymentUrl = data.paymentUrl || data.url || data.redirect_url || data.payment_url
      || data.data?.paymentUrl || data.data?.url || data.data?.redirect_url;
    const token = data.token || data.orderId || data.orderNumber || data.flowOrder
      || data.data?.token || data.data?.orderId || data.data?.orderNumber;

    if (paymentUrl) {
      // Guardar token/orderId para verificación posterior
      if (token) {
        store.set('pending_payment_token', token);
      }

      return {
        success: true,
        paymentUrl,
        token
      };
    }

    return {
      success: false,
      error: data.error || data.message || 'No se pudo generar la URL de pago'
    };
  } catch (error) {
    console.error('Error initializing payment:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
});

// Verificar estado del pago
ipcMain.handle('subscription:verifyPayment', async () => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();

    const token = store.get('pending_payment_token');
    if (!token) {
      return {
        success: false,
        error: 'No hay pagos pendientes de verificación'
      };
    }

    // Verificar estado del pago en Flow a través de la API
    const response = await axios.get(`${API_URL}/flow/status/${token}`, {
      headers: getAuthHeaders()
    });

    if (response.data.success && response.data.status === 'approved') {
      // El pago fue aprobado - la API ya debería haber creado la Licence vía webhook
      // Obtener la licencia actualizada desde la API
      let licence = response.data.licence;

      if (!licence) {
        // Si la respuesta no incluye la licencia, consultarla
        try {
          const licResponse = await axios.get(`${API_URL}/licencias/status`, {
            headers: getAuthHeaders()
          });
          if (licResponse.data.success) {
            licence = licResponse.data.licence;
          }
        } catch (e) {
          console.log('No se pudo obtener licencia del API:', e.message);
        }
      }

      // Guardar suscripción activa localmente
      const subscription = {
        type: 'paid',
        status: 'active',
        startedAt: licence?.issuedAt || new Date().toISOString(),
        expiresAt: licence?.expiresAt || response.data.expiresAt,
        autoRenew: true,
        paymentMethod: 'flow',
        transactionId: response.data.transactionId,
        licenceKey: licence?.licenceKey
      };

      store.set('subscription', subscription);
      store.delete('pending_payment_token');

      return {
        success: true,
        isActive: true,
        subscription
      };
    }

    return {
      success: false,
      isActive: false,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
});

// Cancelar suscripción
ipcMain.handle('subscription:cancel', async () => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();

    const subscription = store.get('subscription');
    if (!subscription) {
      return {
        success: false,
        error: 'No hay suscripción activa'
      };
    }

    // Cancelar en la API (actualiza status de Licence)
    try {
      await axios.post(`${API_URL}/licencias/cancel`, {}, {
        headers: getAuthHeaders()
      });
    } catch (apiError) {
      console.log('No se pudo notificar cancelación a la API:', apiError.message);
    }

    // Marcar como cancelada pero mantener hasta fecha de vencimiento
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    store.set('subscription', subscription);

    return {
      success: true,
      message: 'Suscripción cancelada. Tendrás acceso hasta ' + new Date(subscription.expiresAt).toLocaleDateString()
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Renovar suscripción manualmente
ipcMain.handle('subscription:renew', async () => {
  try {
    // Similar a initializePayment pero para renovación
    return await ipcMain.emit('subscription:initializePayment', null, { plan: 'monthly' });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

console.log('✅ Subscription IPC handlers registered (hybrid: API-first + offline grace period)');

export default {
  // Función auxiliar para verificar suscripción desde otros módulos
  async checkSubscription() {
    const { default: Store } = await import('electron-store');
    const store = new Store();
    const hasAccessToken = !!tokenStore.getAccessToken();
    const allowParentCache = canUseParentSubscriptionCache();

    // Si hay token, intentar verificar con API directamente
    if (hasAccessToken) {
      try {
        const response = await axios.get(`${API_URL}/licencias/status`, {
          headers: getAuthHeaders(),
          timeout: 10000
        });
        if (response.data.success && response.data.licence) {
          const licence = response.data.licence;
          const now = new Date();
          const expiresAt = new Date(licence.expiresAt);
          const isActive = licence.status === 'active' && now < expiresAt;

          // Actualizar cache con timestamp
          store.set('subscription', {
            type: licence.type,
            status: licence.status,
            startedAt: licence.issuedAt,
            expiresAt: licence.expiresAt,
            licenceKey: licence.licenceKey,
            autoRenew: licence.type === 'paid',
            lastVerifiedAt: new Date().toISOString()
          });

          return isActive;
        }
        return false;
      } catch (err) {
        // Solo caer a offline si es error de red
        if (!isNetworkError(err)) return false;
      }
    }

    if (!hasAccessToken && !allowParentCache) {
      return false;
    }

    // Fallback offline con grace period
    const subscription = store.get('subscription');
    if (!subscription) return false;

    // Cache viejo sin lastVerifiedAt → marcamos ahora
    if (!subscription.lastVerifiedAt) {
      subscription.lastVerifiedAt = new Date().toISOString();
      store.set('subscription', subscription);
    }

    const daysOffline = daysSince(subscription.lastVerifiedAt);
    if (daysOffline > OFFLINE_GRACE_DAYS) return false;

    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    return subscription.status === 'active' && now < expiresAt;
  }
};
