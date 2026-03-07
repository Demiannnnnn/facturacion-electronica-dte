import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function SubscriptionWarning() {
  const { subscription } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (subscription && subscription.daysRemaining && subscription.daysRemaining <= 7) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [subscription]);

  if (!visible) return null;

  const getWarningColor = () => {
    if (subscription.daysRemaining <= 2) return '#ef4444'; // Rojo
    if (subscription.daysRemaining <= 5) return '#f97316'; // Naranja
    return '#eab308'; // Amarillo
  };

  const handleRenew = async () => {
    try {
      // Abrir página de renovación
      window.location.href = '/subscription';
    } catch (error) {
      console.error('Error al renovar:', error);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: getWarningColor(),
        color: '#fff',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <div>
          <strong>Tu suscripción está por vencer</strong>
          <div style={{ fontSize: '14px', marginTop: '2px' }}>
            {subscription.daysRemaining === 1 
              ? 'Vence mañana' 
              : `Vence en ${subscription.daysRemaining} días`}
            {subscription.subscriptionType === 'trial' && ' (periodo de prueba)'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleRenew}
          style={{
            backgroundColor: '#fff',
            color: getWarningColor(),
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Renovar ahora
        </button>
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'transparent',
            color: '#fff',
            border: '2px solid #fff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default SubscriptionWarning;
