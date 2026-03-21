import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Layout({ children }) {
  const { 
    user, 
    logout,
    canAccessFacturas,
    canAccessClientes,
    canAccessProductos,
    canAccessTrabajadores,
    canAccessReportes,
    canAccessConfiguracion,
    permisos
  } = useAuth();
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

  // Función para verificar acceso a módulos
  const canAccessModule = (moduleId) => {
    if (!permisos) return false;
    
    const modulePermissions = {
      'dashboard': () => true, // Siempre disponible
      'clientes': canAccessClientes,
      'productos': canAccessProductos,
      'trabajadores': canAccessTrabajadores,
      'facturas': canAccessFacturas,
      'cuentas-por-cobrar': () => canAccessFacturas() || canAccessClientes(),
      'reportes': canAccessReportes,
      'folios': canAccessConfiguracion,
      'configuracion': canAccessConfiguracion
    };

    const permissionCheck = modulePermissions[moduleId];
    return permissionCheck ? permissionCheck() : false;
  };

  const allMenuItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: '📊' },
    { id: 'clientes', path: '/clientes', label: 'Clientes', icon: '👥' },
    { id: 'productos', path: '/productos', label: 'Productos', icon: '📦' },
    { id: 'trabajadores', path: '/trabajadores', label: 'Trabajadores', icon: '👥' },
    { id: 'facturas', path: '/facturas', label: 'Facturas', icon: '📄' },
    { id: 'cuentas-por-cobrar', path: '/cuentas-por-cobrar', label: 'Cuentas por Cobrar', icon: '💰' },
    { id: 'reportes', path: '/reportes', label: 'Reportes', icon: '📈' },
    { id: 'folios', path: '/configuracion/folios', label: 'Folios', icon: '🔢' },
    { id: 'configuracion', path: '/configuracion/emisor', label: 'Configuración', icon: '⚙️' }
  ];

  // Filtrar items según permisos
  const menuItems = allMenuItems.filter(item => canAccessModule(item.id));

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Función para obtener información visual del rol
  const getRoleBadgeInfo = () => {
    if (!permisos?.rol) return null;
    
    const roleInfo = {
      'dueño': { label: 'Dueño', icon: '👑', color: '#dc2626', bgColor: '#fee2e2' },
      'administrador': { label: 'Administrador', icon: '⭐', color: '#ea580c', bgColor: '#ffedd5' },
      'vendedor': { label: 'Vendedor', icon: '💼', color: '#2563eb', bgColor: '#dbeafe' },
      'cajero': { label: 'Cajero', icon: '💵', color: '#16a34a', bgColor: '#dcfce7' },
      'contador': { label: 'Contador', icon: '📊', color: '#7c3aed', bgColor: '#ede9fe' }
    };
    
    return roleInfo[permisos.rol] || { label: permisos.rol, icon: '👤', color: '#6b7280', bgColor: '#f3f4f6' };
  };

  const roleBadge = getRoleBadgeInfo();

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
            {roleBadge && (
              <span style={{
                ...styles.roleBadge,
                color: roleBadge.color,
                backgroundColor: roleBadge.bgColor,
                borderColor: roleBadge.color
              }}>
                <span style={styles.roleIcon}>{roleBadge.icon}</span>
                {roleBadge.label}
              </span>
            )}
            <span style={styles.userName}>{user?.nombre || user?.email}</span>
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
  roleBadge: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1.5px solid',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  roleIcon: {
    fontSize: '14px'
  },
  userName: {
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
