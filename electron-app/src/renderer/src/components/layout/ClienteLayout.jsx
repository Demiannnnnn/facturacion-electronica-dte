import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ClienteLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userSubtype, setUserSubtype] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const roleConfig = await window.api.config.get('user_role');
        const subtypeConfig = await window.api.config.get('user_subtype');
        
        if (roleConfig?.value) setUserRole(roleConfig.value);
        if (subtypeConfig?.value) setUserSubtype(subtypeConfig.value);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const handleChangePassword = () => {
    navigate('/cliente/configuracion/cambiar-contrasena');
  };

  const handleUserManual = () => {
    navigate('/cliente/configuracion/manual');
  };

  // Definir módulos sugeridos según perfil
  const getSuggestedModules = () => {
    if (userRole === 'persona_natural' && userSubtype === 'honorarios') {
      return ['/cliente', '/cliente/clientes', '/cliente/reportes'];
    }
    if (userRole === 'persona_natural' && userSubtype === 'comerciante') {
      return ['/cliente', '/cliente/productos', '/cliente/facturas', '/cliente/clientes'];
    }
    if (userRole === 'empresa') {
      return ['/cliente', '/cliente/facturas', '/cliente/productos', '/cliente/clientes', '/cliente/vendedores'];
    }
    // Por defecto, sugerir los básicos
    return ['/cliente', '/cliente/clientes', '/cliente/facturas'];
  };

  const suggestedPaths = getSuggestedModules();

  const menuItems = [
    { path: '/cliente', label: 'Dashboard', icon: '📊', description: 'Vista general' },
    { path: '/cliente/clientes', label: 'Clientes', icon: '👥', description: 'Gestión de clientes' },
    { path: '/cliente/productos', label: 'Productos', icon: '📦', description: 'Catálogo e inventario' },
    { path: '/cliente/vendedores', label: 'Vendedores', icon: '👨‍💼', description: 'Equipo de ventas' },
    { path: '/cliente/facturas', label: 'Facturas', icon: '📄', description: 'Documentos tributarios' },
    { path: '/cliente/guias', label: 'Guías de Despacho', icon: '📦', description: 'Guías tipo 52' },
    { path: '/cliente/cuentas-por-cobrar', label: 'Cuentas por Cobrar', icon: '💰', description: 'Control de pagos' },
    { path: '/cliente/reportes', label: 'Reportes', icon: '📈', description: 'Análisis y estadísticas' },
    { path: '/cliente/folios', label: 'Folios', icon: '🔢', description: 'Gestión de folios SII' },
    { path: '/cliente/configuracion', label: 'Configuración', icon: '⚙️', description: 'Ajustes generales' }
  ].map(item => ({
    ...item,
    suggested: suggestedPaths.includes(item.path)
  }));

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuToggle}
            >
              ☰
            </button>
            <h2 style={styles.logo}>💼 Sistema de Facturación</h2>
          </div>
          <div style={styles.userSection}>
            <span style={styles.userBadge}>
              {user?.username}
            </span>
            <button onClick={handleUserManual} style={styles.manualBtn}>
              📚 Manual
            </button>
            <button onClick={handleChangePassword} style={styles.changePasswordBtn}>
              🔐 Contraseña
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Salir
            </button>
          </div>
        </div>
      </header>

      <div style={styles.body}>
        {sidebarOpen && (
          <aside style={styles.sidebar}>
            <nav style={styles.nav}>
              {menuItems.map((item) => (
                <div key={item.path} style={styles.navItemContainer}>
                  <button
                    onClick={() => navigate(item.path)}
                    style={{
                      ...styles.navItem,
                      ...(isActive(item.path) ? styles.navItemActive : {}),
                      ...(item.suggested && !isActive(item.path) ? styles.navItemSuggested : {})
                    }}
                    title={item.description}
                  >
                    <span style={styles.navIcon}>{item.icon}</span>
                    <span style={styles.navLabel}>
                      {item.label}
                      {item.suggested && <span style={styles.suggestedBadge}>⭐</span>}
                    </span>
                  </button>
                </div>
              ))}
            </nav>
          </aside>
        )}
        <main style={{
          ...styles.main,
          marginLeft: sidebarOpen ? '250px' : '0'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f7fa'
  },
  header: {
    backgroundColor: '#0f766e',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    maxWidth: '100%'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  menuToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'background 0.2s'
  },
  logo: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userBadge: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '14px'
  },
  username: {
    marginRight: '8px',
    fontSize: '14px'
  },
  manualBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background 0.2s'
  },
  changePasswordBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'background 0.2s'
  },
  logoutBtn: {
    padding: '6px 12px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background 0.2s'
  },
  body: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    position: 'fixed',
    left: 0,
    top: '60px',
    bottom: 0,
    overflowY: 'auto',
    zIndex: 999
  },
  nav: {
    padding: '16px 0'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 24px',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    color: '#4b5563',
    transition: 'all 0.2s',
    gap: '12px'
  },
  navItemActive: {
    backgroundColor: '#ccfbf1',
    color: '#0f766e',
    borderLeft: '4px solid #0f766e',
    paddingLeft: '20px',
    fontWeight: '600'
  },
  navIcon: {
    fontSize: '18px',
    minWidth: '24px'
  },
  navLabel: {
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  navItemContainer: {
    position: 'relative'
  },
  navItemSuggested: {
    backgroundColor: '#f0fdfa',
    borderLeft: '3px solid #14b8a6'
  },
  suggestedBadge: {
    fontSize: '12px',
    marginLeft: '4px',
    filter: 'drop-shadow(0 0 2px rgba(20, 184, 166, 0.3))'
  },
  main: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    transition: 'margin-left 0.3s',
    backgroundColor: '#f5f7fa'
  }
};

export default ClienteLayout;
