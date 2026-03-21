import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SubscriptionWarning from '../SubscriptionWarning';

function ClienteLayout({ children }) {
  const { 
    user, 
    logout, 
    canAccessUsuarios,
    canAccessFacturas,
    canAccessBoletas,
    canAccessClientes,
    canAccessProductos,
    canAccessTrabajadores,
    canAccessCaja,
    canAccessReportes,
    canAccessConfiguracion,
    canAccessDocumentos,
    permisos
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userSubtype, setUserSubtype] = useState(null);
  const [enabledModules, setEnabledModules] = useState([]);
  const [showAllModules, setShowAllModules] = useState(false);
  const [syncStatusBanner, setSyncStatusBanner] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const roleConfig = await window.api.config.get('user_role');
        const subtypeConfig = await window.api.config.get('user_subtype');
        const modulesConfig = await window.api.config.get('enabled_modules');
        
        if (roleConfig?.value) setUserRole(roleConfig.value);
        if (subtypeConfig?.value) setUserSubtype(subtypeConfig.value);
        
        // Cargar módulos habilitados o usar todos por defecto
        if (modulesConfig?.value) {
          setEnabledModules(modulesConfig.value);
        } else {
          // Si no hay configuración, mostrar todos los módulos
          setEnabledModules(['dashboard', 'pos', 'caja', 'clientes', 'productos', 'trabajadores', 
                            'compras', 'documentos', 'facturas', 'boletas', 'guias', 
                            'nota-credito', 'nota-debito', 'cuentas-por-cobrar', 'reportes', 
                            'folios', 'configuracion']);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    let intervalId = null;
    let running = false;

    const updateSyncStatus = async () => {
      if (running) return;
      running = true;

      try {
        const isOnline = navigator.onLine;
        if (!isOnline) {
          setSyncStatusBanner({
            type: 'warning',
            message: 'Sin conexión a internet. Los cambios se guardan localmente y se sincronizarán cuando vuelva la conexión.'
          });
          return;
        }

        const connectionResult = await window.api.sync.checkConnection();
        if (!connectionResult?.success || !connectionResult?.connected) {
          setSyncStatusBanner({
            type: 'warning',
            message: 'Sin conexión al servidor. Los cambios pendientes se sincronizarán automáticamente cuando el servidor esté disponible.'
          });
          return;
        }

        const queueSize = Number(connectionResult.queueSize || 0);
        if (queueSize > 0) {
          setSyncStatusBanner({
            type: 'info',
            message: `Hay ${queueSize} cambio(s) pendiente(s) por sincronizar. Intentando sincronizar...`
          });

          await window.api.sync.processQueue();

          const refreshedStatus = await window.api.sync.checkConnection();
          const refreshedQueueSize = Number(refreshedStatus?.queueSize || 0);
          if (refreshedQueueSize > 0) {
            setSyncStatusBanner({
              type: 'info',
              message: `Quedan ${refreshedQueueSize} cambio(s) pendiente(s) por sincronizar.`
            });
          } else {
            setSyncStatusBanner(null);
          }
          return;
        }

        setSyncStatusBanner(null);
      } catch (error) {
        setSyncStatusBanner({
          type: 'warning',
          message: 'No se pudo verificar el estado de sincronización. Se reintentará automáticamente.'
        });
      } finally {
        running = false;
      }
    };

    updateSyncStatus();
    intervalId = setInterval(updateSyncStatus, 15000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
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

  const handleUsuarios = () => {
    navigate('/cliente/configuracion/usuarios');
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
      return ['/cliente', '/cliente/facturas', '/cliente/productos', '/cliente/clientes', '/cliente/trabajadores'];
    }
    // Por defecto, sugerir los básicos
    return ['/cliente', '/cliente/clientes', '/cliente/facturas'];
  };

  const suggestedPaths = getSuggestedModules();

  // Función para verificar si el usuario tiene acceso a un módulo
  const canAccessModule = (moduleId) => {
    // Dashboard siempre disponible
    if (moduleId === 'dashboard') return true;
    
    // Si no hay permisos cargados, no mostrar nada (excepto dashboard)
    if (!permisos) return false;

    // Mapeo de módulos a permisos
    const modulePermissions = {
      'facturas': canAccessFacturas,
      'boletas': canAccessBoletas,
      'clientes': canAccessClientes,
      'productos': canAccessProductos,
      'trabajadores': canAccessTrabajadores,
      'caja': canAccessCaja,
      'pos': canAccessCaja, // POS requiere permisos de caja
      'reportes': canAccessReportes,
      'configuracion': canAccessConfiguracion,
      'folios': canAccessConfiguracion,
      'documentos': canAccessDocumentos,
      'guias': canAccessDocumentos,
      'nota-credito': canAccessDocumentos,
      'nota-debito': canAccessDocumentos,
      'compras': () => true, // Por ahora todos pueden ver compras
      'cuentas-por-cobrar': () => canAccessFacturas() || canAccessBoletas(), // Requiere acceso a facturas/boletas
      'mi-contador': () => true // Todos pueden gestionar su vínculo con contador
    };

    const permissionCheck = modulePermissions[moduleId];
    return permissionCheck ? permissionCheck() : false;
  };

  const allMenuItems = [
    { id: 'dashboard', path: '/cliente', label: 'Dashboard', icon: '📊', description: 'Vista general' },
    { id: 'pos', path: '/cliente/pos', label: 'Punto de Venta', icon: '🛒', description: 'POS para ventas rápidas' },
    { id: 'caja', path: '/cliente/caja', label: 'Caja', icon: '💵', description: 'Gestión de caja y arqueo' },
    { id: 'clientes', path: '/cliente/clientes', label: 'Clientes', icon: '👥', description: 'Gestión de clientes' },
    { id: 'productos', path: '/cliente/productos', label: 'Productos', icon: '📦', description: 'Catálogo e inventario' },
    { id: 'trabajadores', path: '/cliente/trabajadores', label: 'Trabajadores', icon: '👥', description: 'Equipo de trabajo' },
    { id: 'compras', path: '/cliente/compras', label: 'Compras', icon: '🛍️', description: 'Proveedores y compras' },
    { id: 'documentos', path: '/cliente/documentos', label: 'Documentos', icon: '📑', description: 'Todos los documentos' },
    { id: 'facturas', path: '/cliente/facturas', label: 'Facturas', icon: '📄', description: 'Facturas electrónicas' },
    { id: 'boletas', path: '/cliente/boletas', label: 'Boletas', icon: '🧾', description: 'Boletas electrónicas' },
    { id: 'guias', path: '/cliente/guias', label: 'Guías', icon: '📦', description: 'Guías de despacho' },
    { id: 'nota-credito', path: '/cliente/nota-credito', label: 'Notas de Crédito', icon: '📉', description: 'Notas de crédito' },
    { id: 'nota-debito', path: '/cliente/nota-debito', label: 'Notas de Débito', icon: '📈', description: 'Notas de débito' },
    { id: 'cuentas-por-cobrar', path: '/cliente/cuentas-por-cobrar', label: 'Cuentas por Cobrar', icon: '💰', description: 'Control de pagos' },
    { id: 'reportes', path: '/cliente/reportes', label: 'Reportes', icon: '📊', description: 'Análisis y estadísticas' },
    { id: 'folios', path: '/cliente/folios', label: 'Folios', icon: '🔢', description: 'Gestión de folios SII' },
    { id: 'mi-contador', path: '/cliente/mi-contador', label: 'Mi Contador', icon: '🧑‍💼', description: 'Conexión con contador' },
    { id: 'configuracion', path: '/cliente/configuracion', label: 'Configuración', icon: '⚙️', description: 'Ajustes generales' }
  ];

  // FILTRAR por permisos primero, luego por módulos habilitados
  const menuItemsWithPermissions = allMenuItems.filter(item => canAccessModule(item.id));
  
  // Aplicar lógica de módulos habilitados/deshabilitados
  const menuItems = menuItemsWithPermissions.map(item => ({
    ...item,
    suggested: suggestedPaths.includes(item.path)
  }));

  // Dividir items según si están habilitados o no
  const enabledItems = menuItems.filter(item => enabledModules.includes(item.id));
  const disabledItems = menuItems.filter(item => !enabledModules.includes(item.id));

  // Determinar qué items mostrar
  const visibleItems = showAllModules ? menuItems : enabledItems;
  const hasHiddenModules = disabledItems.length > 0;

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
      <SubscriptionWarning />
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
            <span style={styles.userBadge}>
              {user?.nombre || user?.email}
            </span>
            <button onClick={handleUserManual} style={styles.manualBtn}>
              📚 Manual
            </button>
            {canAccessUsuarios && canAccessUsuarios() && (
              <button onClick={handleUsuarios} style={styles.usuariosBtn}>
                👥 Usuarios
              </button>
            )}
            <button onClick={handleChangePassword} style={styles.changePasswordBtn}>
              🔐 Contraseña
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Salir
            </button>
          </div>
        </div>
      </header>

      {syncStatusBanner && (
        <div
          style={{
            ...styles.syncBanner,
            ...(syncStatusBanner.type === 'warning' ? styles.syncBannerWarning : styles.syncBannerInfo)
          }}
        >
          {syncStatusBanner.message}
        </div>
      )}

      <div style={styles.body}>
        {sidebarOpen && (
          <aside style={styles.sidebar}>
            <nav style={styles.nav}>
              {visibleItems.map((item) => (
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
              
              {!showAllModules && hasHiddenModules && (
                <div style={styles.navItemContainer}>
                  <button
                    onClick={() => setShowAllModules(true)}
                    style={styles.moreButton}
                    title="Ver más módulos"
                  >
                    <span style={styles.navIcon}>➕</span>
                    <span style={styles.navLabel}>
                      Más... ({disabledItems.length} módulos)
                    </span>
                  </button>
                </div>
              )}
              
              {showAllModules && hasHiddenModules && (
                <div style={styles.navItemContainer}>
                  <button
                    onClick={() => setShowAllModules(false)}
                    style={styles.lessButton}
                    title="Ver menos módulos"
                  >
                    <span style={styles.navIcon}>➖</span>
                    <span style={styles.navLabel}>
                      Mostrar menos
                    </span>
                  </button>
                </div>
              )}
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
  userBadge: {
    padding: '6px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '14px'
  },
  userName: {
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
  usuariosBtn: {
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
  syncBanner: {
    paddingTop: '10px',
    paddingRight: '16px',
    paddingBottom: '10px',
    paddingLeft: '16px',
    fontSize: '13px',
    fontWeight: '500',
    borderBottom: '1px solid'
  },
  syncBannerWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderBottomColor: '#f59e0b'
  },
  syncBannerInfo: {
    backgroundColor: '#e0f2fe',
    color: '#075985',
    borderBottomColor: '#38bdf8'
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
    paddingTop: '12px',
    paddingRight: '24px',
    paddingBottom: '12px',
    paddingLeft: '24px',
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
  moreButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    color: '#6b7280',
    transition: 'all 0.2s',
    gap: '12px',
    fontStyle: 'italic',
    borderTop: '1px solid #e5e7eb',
    marginTop: '8px',
    paddingTop: '16px'
  },
  lessButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    color: '#6b7280',
    transition: 'all 0.2s',
    gap: '12px',
    fontStyle: 'italic',
    borderTop: '1px solid #e5e7eb',
    marginTop: '8px',
    paddingTop: '16px'
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
