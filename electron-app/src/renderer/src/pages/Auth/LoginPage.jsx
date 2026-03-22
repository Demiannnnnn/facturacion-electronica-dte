import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isFirstRun } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (isFirstRun) {
        const forceLogin = searchParams.get('existing') === '1';
        if (forceLogin) {
          return;
        }

        // Verificar si ya hay rol seleccionado
        const roleConfig = await window.api.config.get('user_role');
        if (!roleConfig.value) {
          // No hay rol, ir a selección
          navigate('/role-selection');
        } else {
          // Ya hay rol, ir a registro
          navigate('/register');
        }
      }
    };
    
    checkRoleAndRedirect();
  }, [isFirstRun, navigate, searchParams]);

  // Fix: Auto-focus en el campo de usuario al montar el componente
  useEffect(() => {
    const timer = setTimeout(() => {
      const emailInput = document.querySelector('input[type="email"]');
      if (emailInput) {
        emailInput.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Obtener el rol del usuario para redirigir correctamente
      try {
        const roleConfig = await window.api.config.get('user_role');
        const onboardingConfig = await window.api.config.get('onboarding_completed');
        const businessProfileConfig = await window.api.config.get('business_profile_completed');
        let userRole = roleConfig?.value;
        const onboardingCompleted = onboardingConfig?.value === 'true';
        const businessProfileCompleted = businessProfileConfig?.value === 'true';

        // Si no existe rol de cuenta en configuración (usuarios antiguos / login directo),
        // inferir uno por defecto para evitar bucle login -> / -> login.
        if (!userRole) {
          if (result.user?.rol === 'contador') {
            userRole = 'contador';
          } else {
            // Dueño/administrador/vendedor pertenecen al módulo cliente en esta app
            userRole = 'empresa';
          }

          try {
            await window.api.config.set('user_role', userRole);
            // Al iniciar con cuenta existente damos onboarding por completado
            await window.api.config.set('onboarding_completed', 'true');
          } catch (configError) {
            console.warn('No se pudo persistir user_role inferido:', configError);
          }
        }

        if (userRole === 'contador') {
          navigate('/contador');
        } else if (userRole === 'empresa' || userRole === 'persona_natural') {
          if (!onboardingCompleted) {
            if (businessProfileCompleted) {
              navigate('/module-selector');
            } else {
              navigate('/business-profile-setup');
            }
          } else {
            navigate('/cliente');
          }
        } else {
          // Último fallback seguro
          navigate('/cliente');
        }
      } catch (error) {
        console.error('Error obteniendo rol:', error);
        navigate('/cliente');
      }
    } else {
      // Si no tiene suscripción activa, redirigir a página de suscripción
      if (result.needsSubscription) {
        setError('Suscripción inactiva. Redirigiendo...');
        setTimeout(() => navigate('/subscription'), 1500);
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    }

    setIsLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button
          type="button"
          onClick={() => navigate('/role-selection')}
          style={styles.backButton}
        >
          ← Volver al inicio
        </button>

        <h1 style={styles.title}>Sistema de Facturación</h1>
        <h2 style={styles.subtitle}>Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="tu@email.com"
              autoFocus
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  backButton: {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e1',
    color: '#334155',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    padding: '8px 12px',
    cursor: 'pointer',
    marginBottom: '14px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#333'
  },
  subtitle: {
    fontSize: '18px',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#666'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c33',
    fontSize: '14px'
  }
};

export default LoginPage;
