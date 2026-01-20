import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [userRole, setUserRole] = useState(null);
  
  // Datos de usuario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Datos de Contador
  const [contadorRut, setContadorRut] = useState('');
  const [contadorRazonSocial, setContadorRazonSocial] = useState('');
  const [contadorEmail, setContadorEmail] = useState('');
  const [contadorTelefono, setContadorTelefono] = useState('');
  
  // Datos de Cliente/Empresa
  const [empresaRut, setEmpresaRut] = useState('');
  const [empresaRazonSocial, setEmpresaRazonSocial] = useState('');
  const [empresaNombreFantasia, setEmpresaNombreFantasia] = useState('');
  const [empresaGiro, setEmpresaGiro] = useState('');
  const [empresaDireccion, setEmpresaDireccion] = useState('');
  const [empresaComuna, setEmpresaComuna] = useState('');
  const [empresaCiudad, setEmpresaCiudad] = useState('');
  const [empresaEmail, setEmpresaEmail] = useState('');
  const [empresaTelefono, setEmpresaTelefono] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRole = async () => {
      // Intentar obtener rol desde URL
      const roleParam = searchParams.get('role');
      const subtypeParam = searchParams.get('subtype');
      
      if (roleParam) {
        setUserRole(roleParam);
        if (subtypeParam) {
          await window.api.config.set('user_subtype', subtypeParam);
        }
        return;
      }
      
      // Si no hay rol en URL, obtener de configuración
      const roleConfig = await window.api.config.get('user_role');
      if (roleConfig.value) {
        setUserRole(roleConfig.value);
      } else {
        // No hay rol, redirigir a selección
        navigate('/role-selection');
      }
    };
    
    loadRole();
  }, [searchParams, navigate]);

  const validateForm = () => {
    // Validar datos de usuario
    if (!username || !password || !confirmPassword) {
      setError('Usuario y contraseña son requeridos');
      return false;
    }

    if (username.length < 3 || username.length > 50) {
      setError('El usuario debe tener entre 3 y 50 caracteres');
      return false;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Validar datos específicos según rol
    if (userRole === 'contador') {
      if (!contadorRut || !contadorRazonSocial || !contadorEmail) {
        setError('RUT, Razón Social y Email son requeridos');
        return false;
      }
    }

    if (userRole === 'empresa' || userRole === 'persona_natural') {
      if (!empresaRut || !empresaRazonSocial || !empresaGiro || !empresaDireccion) {
        setError('RUT, Razón Social, Giro y Dirección son requeridos');
        return false;
      }
    }

    return true;
  };

  const getPasswordStrength = () => {
    if (!password) return null;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { text: 'Débil', color: '#f44336' };
    if (strength <= 3) return { text: 'Media', color: '#ff9800' };
    return { text: 'Fuerte', color: '#4caf50' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Registrar usuario
      const result = await register(username, password);

      if (!result.success) {
        setError(result.error || 'Error al registrar usuario');
        setIsLoading(false);
        return;
      }

      // 2. Guardar datos adicionales según rol
      if (userRole === 'contador') {
        // Guardar datos del contador
        await window.api.config.set('contador_rut', contadorRut);
        await window.api.config.set('contador_razon_social', contadorRazonSocial);
        await window.api.config.set('contador_email', contadorEmail);
        await window.api.config.set('contador_telefono', contadorTelefono);
      }

      if (userRole === 'empresa' || userRole === 'persona_natural') {
        // Guardar datos del emisor (empresa o persona natural)
        const emisorResult = await window.api.emisor.save({
          rut: empresaRut,
          razon_social: empresaRazonSocial,
          nombre_fantasia: empresaNombreFantasia,
          giro: empresaGiro,
          direccion: empresaDireccion,
          comuna: empresaComuna,
          ciudad: empresaCiudad,
          telefono: empresaTelefono,
          email: empresaEmail,
          region: '' // Se puede agregar después
        });

        if (!emisorResult.success) {
          setError('Usuario creado, pero error guardando datos de empresa');
          setIsLoading(false);
          return;
        }
      }

      // 3. Redirigir según el rol
      if (userRole === 'contador') {
        // Contador va directo al login (no necesita selector de módulos)
        alert('✅ Cuenta de contador configurada exitosamente. Ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        // Empresa y Persona Natural van al selector de módulos
        alert('✅ Cuenta creada exitosamente. Ahora personaliza tu espacio de trabajo.');
        navigate('/module-selector');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setError('Error al completar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  const getRoleTitle = () => {
    if (userRole === 'contador') return 'Contador';
    if (userRole === 'empresa') return 'Empresa';
    if (userRole === 'persona_natural') return 'Persona Natural';
    return 'Usuario';
  };

  const getRoleIcon = () => {
    if (userRole === 'contador') return '👨‍💼';
    if (userRole === 'empresa') return '🏢';
    if (userRole === 'persona_natural') return '👤';
    return '📋';
  };

  if (!userRole) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{...styles.card, maxWidth: userRole === 'contador' ? '450px' : '600px'}}>
        {/* Botón para volver */}
        <button
          type="button"
          onClick={() => {
            window.api.config.delete('user_role');
            window.api.config.delete('user_subtype');
            navigate('/role-selection');
          }}
          style={styles.backButton}
        >
          ← Volver a Selección de Rol
        </button>

        <h1 style={styles.title}>Sistema de Facturación</h1>
        <h2 style={styles.subtitle}>
          {getRoleIcon()} Configuración de {getRoleTitle()}
        </h2>
        <p style={styles.description}>
          {userRole === 'contador' && 'Configura tu cuenta de contador para gestionar múltiples clientes'}
          {userRole === 'empresa' && 'Configura tu empresa y crea el usuario administrador'}
          {userRole === 'persona_natural' && 'Configura tu información personal y crea el usuario administrador'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* SECCIÓN: Datos de Usuario */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👤 Datos de Acceso</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Usuario *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                placeholder="Nombre de usuario"
                autoFocus
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contraseña *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                />
                {passwordStrength && (
                  <div style={{ ...styles.strengthIndicator, color: passwordStrength.color }}>
                    Fortaleza: {passwordStrength.text}
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmar Contraseña *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN: Datos de Contador */}
          {userRole === 'contador' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Datos del Contador</h3>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>RUT Contador *</label>
                <input
                  type="text"
                  value={contadorRut}
                  onChange={(e) => setContadorRut(e.target.value)}
                  style={styles.input}
                  placeholder="12.345.678-9"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Razón Social / Nombre Completo *</label>
                <input
                  type="text"
                  value={contadorRazonSocial}
                  onChange={(e) => setContadorRazonSocial(e.target.value)}
                  style={styles.input}
                  placeholder="Nombre completo o razón social"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    value={contadorEmail}
                    onChange={(e) => setContadorEmail(e.target.value)}
                    style={styles.input}
                    placeholder="contador@ejemplo.cl"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono</label>
                  <input
                    type="text"
                    value={contadorTelefono}
                    onChange={(e) => setContadorTelefono(e.target.value)}
                    style={styles.input}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>
            </div>
          )}

          {(userRole === 'empresa' || userRole === 'persona_natural') && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {userRole === 'empresa' ? '🏢 Datos de la Empresa' : '👤 Datos Personales'}
              </h3>
              
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    {userRole === 'empresa' ? 'RUT Empresa *' : 'RUT *'}
                  </label>
                  <input
                    type="text"
                    value={empresaRut}
                    onChange={(e) => setEmpresaRut(e.target.value)}
                    style={styles.input}
                    placeholder={userRole === 'empresa' ? '76.123.456-7' : '12.345.678-9'}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Giro / Rubro *</label>
                  <input
                    type="text"
                    value={empresaGiro}
                    onChange={(e) => setEmpresaGiro(e.target.value)}
                    style={styles.input}
                    placeholder="Ej: Comercio, Servicios, Honorarios, etc."
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {userRole === 'empresa' ? 'Razón Social *' : 'Nombre Completo *'}
                </label>
                <input
                  type="text"
                  value={empresaRazonSocial}
                  onChange={(e) => setEmpresaRazonSocial(e.target.value)}
                  style={styles.input}
                  placeholder={userRole === 'empresa' ? 'Razón social de la empresa' : 'Tu nombre completo'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre Fantasía / Comercial</label>
                <input
                  type="text"
                  value={empresaNombreFantasia}
                  onChange={(e) => setEmpresaNombreFantasia(e.target.value)}
                  style={styles.input}
                  placeholder="Nombre comercial (opcional)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Dirección *</label>
                <input
                  type="text"
                  value={empresaDireccion}
                  onChange={(e) => setEmpresaDireccion(e.target.value)}
                  style={styles.input}
                  placeholder="Calle, número, depto/oficina"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Comuna</label>
                  <input
                    type="text"
                    value={empresaComuna}
                    onChange={(e) => setEmpresaComuna(e.target.value)}
                    style={styles.input}
                    placeholder="Comuna"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Ciudad</label>
                  <input
                    type="text"
                    value={empresaCiudad}
                    onChange={(e) => setEmpresaCiudad(e.target.value)}
                    style={styles.input}
                    placeholder="Ciudad"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={empresaEmail}
                    onChange={(e) => setEmpresaEmail(e.target.value)}
                    style={styles.input}
                    placeholder="contacto@empresa.cl"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono</label>
                  <input
                    type="text"
                    value={empresaTelefono}
                    onChange={(e) => setEmpresaTelefono(e.target.value)}
                    style={styles.input}
                    placeholder="+56 2 1234 5678"
                  />
                </div>
              </div>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Configurando...' : 'Completar Configuración'}
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
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4a5568',
    backgroundColor: 'transparent',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#f7fafc',
      borderColor: '#a0aec0'
    }
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '10px',
    marginTop: '20px',
    color: '#1a202c'
  },
  subtitle: {
    fontSize: '20px',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#2d3748',
    fontWeight: '600'
  },
  description: {
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '30px',
    color: '#718096',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  section: {
    padding: '20px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #cbd5e0'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: 0
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '12px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a5568'
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: 'white',
    width: '100%',
    boxSizing: 'border-box'
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a5568'
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: 'white'
  },
  strengthIndicator: {
    fontSize: '12px',
    fontWeight: '600',
    marginTop: '4px'
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3182ce',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  },
  error: {
    padding: '12px',
    backgroundColor: '#fed7d7',
    border: '1px solid #fc8181',
    borderRadius: '6px',
    color: '#c53030',
    fontSize: '14px',
    textAlign: 'center'
  }
};

export default RegisterPage;
