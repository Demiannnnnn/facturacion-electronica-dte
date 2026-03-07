import { ipcMain } from 'electron';
import axios from 'axios';

// URL de tu API REST (configurable)
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

let subscriptionCache = null;

/**
 * Handlers IPC para gestión de suscripciones
 */

// Obtener estado de suscripción
ipcMain.handle('subscription:getStatus', async () => {
  try {
    // Primero verificar en configuración local
    const { default: Store } = await import('electron-store');
    const store = new Store();
    
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

    const subscription = {
      type: 'trial',
      status: 'active',
      startedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      autoRenew: false
    };

    store.set('subscription', subscription);
    store.set('trial_used', true);

    // Opcional: Notificar a tu API
    try {
      const userEmail = store.get('user_email');
      if (userEmail) {
        await axios.post(`${API_URL}/subscriptions/trial`, {
          email: userEmail,
          expiresAt: subscription.expiresAt
        });
      }
    } catch (apiError) {
      console.log('No se pudo notificar a la API:', apiError.message);
      // No fallar si la API no está disponible
    }

    return {
      success: true,
      expiresAt: subscription.expiresAt,
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

    // Llamar a tu API REST para obtener URL de Flow
    const response = await axios.post(`${API_URL}/subscriptions/flow/create`, {
      email: email || store.get('user_email'),
      plan,
      returnUrl: 'http://localhost:5173/subscription/callback', // URL de retorno
      cancelUrl: 'http://localhost:5173/subscription/cancel'
    });

    if (response.data.success && response.data.paymentUrl) {
      // Guardar token de pago para verificación posterior
      store.set('pending_payment_token', response.data.token);
      
      return {
        success: true,
        paymentUrl: response.data.paymentUrl,
        token: response.data.token
      };
    }

    return {
      success: false,
      error: 'No se pudo generar la URL de pago'
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

    // Verificar con tu API
    const response = await axios.get(`${API_URL}/subscriptions/flow/verify/${token}`);

    if (response.data.success && response.data.status === 'approved') {
      // Guardar suscripción activa
      const subscription = {
        type: 'paid',
        status: 'active',
        startedAt: new Date().toISOString(),
        expiresAt: response.data.expiresAt,
        autoRenew: true,
        paymentMethod: 'flow',
        transactionId: response.data.transactionId
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

    // Notificar a la API
    try {
      const userEmail = store.get('user_email');
      await axios.post(`${API_URL}/subscriptions/cancel`, {
        email: userEmail
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
