import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const handleChangePassword = () => {
    navigate('/configuracion/cambiar-contrasena');
  };

  const handleUserManual = () => {
    navigate('/configuracion/manual');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    { path: '/productos', label: 'Productos', icon: '📦' },
    { path: '/vendedores', label: 'Vendedores', icon: '👨‍💼' },
    { path: '/facturas', label: 'Facturas', icon: '📄' },
    { path: '/cuentas-por-cobrar', label: 'Cuentas por Cobrar', icon: '💰' },
    { path: '/reportes', label: 'Reportes', icon: '📈' },
    { path: '/configuracion/emisor', label: 'Configuración', icon: '⚙️' }
  ];

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
            <h2 style={styles.logo}>Sistema de Facturación</h2>
          </div>
          <div style={styles.userSection}>
            <span style={styles.username}>{user?.username}</span>
            <button onClick={handleUserManual} style={styles.manualBtn}>
              📚 Manual de Usuario
            </button>
            <button onClick={handleChangePassword} style={styles.changePasswordBtn}>
              Cambiar Contraseña
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div style={styles.body}>
        {sidebarOpen && (
          <aside style={styles.sidebar}>
            <nav style={styles.nav}>
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{
                    ...styles.navItem,
                    ...(isActive(item.path) ? styles.navItemActive : {})
                  }}
                >
                  <span style={styles.icon}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
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

      <footer style={styles.footer}>
        <p>Sistema de Facturación Electrónica B2B - 2025</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  menuToggle: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '5px 10px'
  },
  logo: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  username: {
    fontSize: '14px',
    fontWeight: '500'
  },
  manualBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  changePasswordBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  logoutBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  body: {
    display: 'flex',
    marginTop: '60px',
    minHeight: 'calc(100vh - 120px)'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#2c3e50',
    position: 'fixed',
    top: '60px',
    left: 0,
    bottom: '60px',
    overflowY: 'auto',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
  },
  nav: {
    padding: '20px 0'
  },
  navItem: {
    width: '100%',
    padding: '15px 20px',
    backgroundColor: 'transparent',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: 'none',
    color: '#ecf0f1',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'left',
    transition: 'background-color 0.2s'
  },
  navItemActive: {
    backgroundColor: '#34495e',
    borderLeft: '4px solid #007bff'
  },
  icon: {
    fontSize: '20px'
  },
  main: {
    flex: 1,
    padding: '30px',
    transition: 'margin-left 0.3s'
  },
  footer: {
    backgroundColor: '#333',
    color: 'white',
    textAlign: 'center',
    padding: '15px',
    fontSize: '14px',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0
  }
};

export default Layout;
