import { ipcMain } from 'electron';
import axios from 'axios';
import tokenStore from '../utils/tokenStore.js';

// URL de tu API REST (configurable)
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

/**
 * Helper para obtener headers de autenticación
 */
function getAuthHeaders() {
  const token = tokenStore.getAccessToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Handlers IPC para gestión de suscripciones
 */

// Obtener estado de suscripción
ipcMain.handle('subscription:getStatus', async () => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();

    // Intentar obtener licencia desde la API
    try {
      const response = await axios.get(`${API_URL}/licencias/status`, {
        headers: getAuthHeaders()
      });

      if (response.data.success && response.data.licence) {
        const licence = response.data.licence;
        const now = new Date();
        const expiresAt = new Date(licence.expiresAt);
        const isActive = licence.status === 'active' && now < expiresAt;

        // Sincronizar a store local
        const subscription = {
          type: licence.type || (licence.notes === 'trial' ? 'trial' : 'paid'),
          status: licence.status,
          startedAt: licence.issuedAt,
          expiresAt: licence.expiresAt,
          licenceKey: licence.licenceKey,
          autoRenew: licence.type === 'paid'
        };
        store.set('subscription', subscription);

        return {
          success: true,
          hasActiveSubscription: isActive,
          isTrial: subscription.type === 'trial',
          type: subscription.type,
          expiresAt: licence.expiresAt,
          isActive,
          daysRemaining: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
        };
      }
    } catch (apiError) {
      if (apiError.response?.status === 404) {
        // API confirma que no existe licencia — limpiar cache local stale
        console.log('Usuario sin licencia en la API, limpiando cache local');
        store.delete('subscription');
        store.delete('trial_used');
      } else {
        console.log('No se pudo consultar licencia en API, usando cache local:', apiError.message);
      }
    }

    // Fallback: verificar en configuración local
    const subscription = store.get('subscription');

    if (!subscription) {
      return {
        success: true,
        hasActiveSubscription: false,
        isTrial: false
      };
    }

    // Verificar si está vencida
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    const isActive = now < expiresAt;

    return {
      success: true,
      hasActiveSubscription: isActive,
      isTrial: subscription.type === 'trial',
      type: subscription.type,
      expiresAt: subscription.expiresAt,
      isActive,
      daysRemaining: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Activar período de prueba
ipcMain.handle('subscription:activateTrial', async () => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();

    // Verificar si ya usó el período de prueba
    const hasUsedTrial = store.get('trial_used');
    if (hasUsedTrial) {
      return {
        success: false,
        error: 'Ya has utilizado el período de prueba anteriormente'
      };
    }

    // Calcular fecha de vencimiento (3 meses)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    let licenceKey = null;

    // Crear licencia trial en la API
    try {
      const response = await axios.post(`${API_URL}/licencias/activate`, {
        type: 'trial',
        expiresAt: expiresAt.toISOString(),
        notes: 'Período de prueba gratuito - 3 meses'
      }, {
        headers: getAuthHeaders()
      });

      if (response.data.success && response.data.licence) {
        licenceKey = response.data.licence.licenceKey;
        // Usar la fecha de expiración de la API (es la fuente de verdad)
        if (response.data.licence.expiresAt) {
          expiresAt.setTime(new Date(response.data.licence.expiresAt).getTime());
        }
      }
    } catch (apiError) {
      console.log('No se pudo crear licencia en la API:', apiError.message);
      // Continuar con activación local si la API no está disponible
    }

    const subscription = {
      type: 'trial',
      status: 'active',
      startedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      autoRenew: false,
      licenceKey
    };

    store.set('subscription', subscription);
    store.set('trial_used', true);

    return {
      success: true,
      expiresAt: subscription.expiresAt,
      licenceKey,
      message: 'Período de prueba activado correctamente'
    };
  } catch (error) {
    console.error('Error activating trial:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Inicializar pago con Flow
ipcMain.handle('subscription:initializePayment', async (event, { email, plan }) => {
  try {
    const { default: Store } = await import('electron-store');
    const store = new Store();

    const selectedPlan = plan || 'monthly';

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

console.log('✅ Subscription IPC handlers registered');

export default {
  // Función auxiliar para verificar suscripción desde otros módulos
  async checkSubscription() {
    const { default: Store } = await import('electron-store');
    const store = new Store();
    
    const subscription = store.get('subscription');
    if (!subscription) return false;

    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    return now < expiresAt;
  }
};
