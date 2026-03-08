import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PlanCard({ children, premium, style: extraStyle }) {
  const [hovered, setHovered] = useState(false);
  const base = {
    ...styles.planCard,
    ...(premium ? styles.planCardPremium : {}),
    ...(hovered ? {
      transform: premium ? 'scale(1.05)' : 'scale(1.04)',
      boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
      borderColor: premium ? '#0f766e' : '#3b82f6'
    } : {}),
    ...extraStyle
  };
  return (
    <div
      style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

function SubscriptionPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const result = await window.api.subscription.getStatus();
      if (result.success && result.hasActiveSubscription) {
        // Ya tiene suscripción activa, redirigir
        navigate('/login');
      }
      
      // Obtener email del usuario
      const userConfig = await window.api.config.get('user_email');
      if (userConfig?.value) {
        setUserEmail(userConfig.value);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSelectTrial = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Activar período de prueba de 3 meses (crea licencia trial en la API)
      const result = await window.api.subscription.activateTrial();
      
      if (result.success) {
        const fecha = new Date(result.expiresAt).toLocaleDateString('es-CL');
        let msg = `¡Período de prueba activado!\n\nTienes 3 meses para usar el sistema sin costo.\nFecha de vencimiento: ${fecha}`;
        if (result.licenceKey) {
          msg += `\n\nTu clave de licencia: ${result.licenceKey}`;
        }
        alert('✅ ' + msg);
        navigate('/login');
      } else {
        setError(result.error || 'Error al activar período de prueba');
      }
    } catch (error) {
      console.error('Error activating trial:', error);
      setError('Error al activar período de prueba');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPaid = async (plan) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await window.api.subscription.initializePayment({
        email: userEmail,
        plan
      });

      if (result.success && result.paymentUrl) {
        await window.api.openExternal(result.paymentUrl);
        
        alert('🌐 Se abrirá Flow en tu navegador para procesar el pago.\n\nUna vez completado el pago, vuelve aquí y presiona "Verificar Pago"');
        
        setSelectedPlan('paid');
      } else {
        setError(result.error || 'Error al inicializar pago');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      setError('Error al conectar con el sistema de pagos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await window.api.subscription.verifyPayment();
      
      if (result.success && result.isActive) {
        alert('✅ ¡Pago confirmado!\n\nTu suscripción está activa.');
        navigate('/login');
      } else {
        setError('No se ha detectado un pago confirmado. Por favor, completa el pago en Flow.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Error al verificar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>💼 Sistema de Facturación</h1>
          <h2 style={styles.subtitle}>Elige tu plan</h2>
          <p style={styles.description}>
            Selecciona cómo deseas comenzar a usar el sistema
          </p>
        </div>

        <div style={styles.plansContainer}>
          {/* Plan de Prueba */}
          <PlanCard>
            <div style={styles.planHeader}>
              <div style={styles.planIcon}>🎁</div>
              <h3 style={styles.planTitle}>Prueba Gratuita</h3>
              <div style={styles.planBadge}>Sin Tarjeta</div>
            </div>
            
            <div style={styles.planPrice}>
              <span style={styles.priceAmount}>$0</span>
              <span style={styles.pricePeriod}>/ 3 meses</span>
            </div>

            <ul style={styles.featureList}>
              <li style={styles.featureItem}>✅ Acceso completo al sistema</li>
              <li style={styles.featureItem}>✅ Todas las funcionalidades</li>
              <li style={styles.featureItem}>✅ Sin datos de pago requeridos</li>
              <li style={styles.featureItem}>✅ Cancela en cualquier momento</li>
              <li style={styles.featureItem}>⏰ 3 meses de duración</li>
            </ul>

            <button
              onClick={handleSelectTrial}
              disabled={isLoading}
              style={styles.trialButton}
            >
              {isLoading ? 'Activando...' : 'Comenzar Prueba Gratuita'}
            </button>
          </PlanCard>

          {/* Plan Mensual */}
          <PlanCard>
            <div style={styles.planHeader}>
              <div style={{...styles.planIcon, backgroundColor: '#0f766e'}}>⭐</div>
              <h3 style={styles.planTitle}>Suscripción Mensual</h3>
            </div>
            
            <div style={styles.planPrice}>
              <span style={styles.priceAmount}>$49.990</span>
              <span style={styles.pricePeriod}>/ mes</span>
            </div>

            <ul style={styles.featureList}>
              <li style={styles.featureItem}>✅ Acceso ilimitado</li>
              <li style={styles.featureItem}>✅ Soporte prioritario</li>
              <li style={styles.featureItem}>✅ Actualizaciones automáticas</li>
              <li style={styles.featureItem}>✅ Sin límite de facturas</li>
              <li style={styles.featureItem}>✅ Respaldo en la nube</li>
            </ul>

            {!selectedPlan || selectedPlan !== 'paid' ? (
              <button
                onClick={() => handleSelectPaid('monthly')}
                disabled={isLoading}
                style={styles.paidButton}
              >
                {isLoading ? 'Procesando...' : 'Suscribirme Mensual'}
              </button>
            ) : (
              <button
                onClick={handleVerifyPayment}
                disabled={isLoading}
                style={styles.verifyButton}
              >
                {isLoading ? 'Verificando...' : '🔍 Verificar Pago'}
              </button>
            )}
          </PlanCard>

          {/* Plan Anual */}
          <PlanCard premium>
            <div style={styles.planHeader}>
              <div style={{...styles.planIcon, backgroundColor: '#7c3aed'}}>💎</div>
              <h3 style={styles.planTitle}>Suscripción Anual</h3>
              <div style={{...styles.planBadge, ...styles.planBadgePremium}}>Recomendado</div>
            </div>
            
            <div style={styles.planPrice}>
              <span style={styles.priceAmount}>$499.900</span>
              <span style={styles.pricePeriod}>/ año</span>
            </div>
            <p style={{fontSize: '13px', color: '#059669', textAlign: 'center', margin: '0 0 16px'}}>
              Equivale a $41.658/mes — Ahorra 2 meses
            </p>

            <ul style={styles.featureList}>
              <li style={styles.featureItem}>✅ Todo lo del plan mensual</li>
              <li style={styles.featureItem}>✅ Ahorro de 2 meses</li>
              <li style={styles.featureItem}>✅ Soporte prioritario</li>
              <li style={styles.featureItem}>✅ Actualizaciones automáticas</li>
              <li style={styles.featureItem}>✅ Respaldo en la nube</li>
            </ul>

            {!selectedPlan || selectedPlan !== 'paid' ? (
              <button
                onClick={() => handleSelectPaid('yearly')}
                disabled={isLoading}
                style={{...styles.paidButton, backgroundColor: '#7c3aed'}}
              >
                {isLoading ? 'Procesando...' : 'Suscribirme Anual'}
              </button>
            ) : (
              <button
                onClick={handleVerifyPayment}
                disabled={isLoading}
                style={styles.verifyButton}
              >
                {isLoading ? 'Verificando...' : '🔍 Verificar Pago'}
              </button>
            )}
          </PlanCard>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            💳 Los pagos son procesados de forma segura por <strong>Flow</strong>
          </p>
          <p style={styles.footerText}>
            ¿Tienes dudas? Contáctanos en soporte@tuempresa.cl
          </p>
        </div>

        <button
          onClick={() => navigate('/login')}
          style={styles.skipButton}
        >
          Ya tengo una suscripción →
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '40px',
    maxWidth: '1200px',
    width: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: '12px'
  },
  description: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  plansContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '32px'
  },
  planCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '32px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: '#fafafa',
    cursor: 'pointer'
  },
  planCardPremium: {
    border: '2px solid #0f766e',
    backgroundColor: '#f0fdfa',
    transform: 'scale(1.02)'
  },
  planHeader: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  planIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 16px'
  },
  planTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  planBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  planBadgePremium: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  planPrice: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  priceAmount: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#0f766e'
  },
  pricePeriod: {
    fontSize: '16px',
    color: '#6b7280'
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '24px'
  },
  featureItem: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '12px',
    paddingLeft: '8px'
  },
  trialButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  paidButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  verifyButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0'
  },
  skipButton: {
    display: 'block',
    margin: '16px auto 0',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '16px'
  }
};

export default SubscriptionPage;
