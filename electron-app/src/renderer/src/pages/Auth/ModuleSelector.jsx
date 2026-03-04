import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ModuleSelector() {
  const navigate = useNavigate();
  const { user, refreshFirstRun } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [userSubtype, setUserSubtype] = useState(null);
  const [userName, setUserName] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Definición de todos los módulos disponibles
  const allModules = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Panel principal con estadísticas y resumen de tu negocio',
      required: true, // Siempre habilitado
      category: 'Esencial'
    },
    {
      id: 'pos',
      label: 'Punto de Venta',
      icon: '🛒',
      description: 'Sistema POS para ventas rápidas con productos',
      category: 'Ventas',
      recommendedFor: ['empresa', 'comerciante']
    },
    {
      id: 'caja',
      label: 'Caja',
      icon: '💵',
      description: 'Gestión de caja, arqueo y movimientos de efectivo',
      category: 'Ventas',
      recommendedFor: ['empresa', 'comerciante']
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: '👥',
      description: 'Gestión de clientes, contactos y relaciones comerciales',
      category: 'Gestión'
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: '📦',
      description: 'Catálogo de productos, precios y control de inventario',
      category: 'Gestión'
    },
    {
      id: 'compras',
      label: 'Compras',
      icon: '🛍️',
      description: 'Gestión de proveedores, órdenes de compra y cuentas por pagar',
      category: 'Gestión',
      recommendedFor: ['empresa', 'comerciante']
    },
    {
      id: 'documentos',
      label: 'Documentos',
      icon: '📑',
      description: 'Vista unificada de todos los documentos tributarios',
      category: 'Facturación'
    },
    {
      id: 'facturas',
      label: 'Facturas',
      icon: '📄',
      description: 'Emisión y gestión de facturas electrónicas (DTE 33)',
      category: 'Facturación'
    },
    {
      id: 'boletas',
      label: 'Boletas',
      icon: '🧾',
      description: 'Emisión de boletas electrónicas para ventas al público (DTE 39)',
      category: 'Facturación',
      recommendedFor: ['empresa', 'comerciante']
    },
    {
      id: 'guias',
      label: 'Guías de Despacho',
      icon: '📦',
      description: 'Guías de despacho tipo 52 para envíos',
      category: 'Facturación'
    },
    {
      id: 'nota-credito',
      label: 'Notas de Crédito',
      icon: '📉',
      description: 'Anulaciones y correcciones de facturas (DTE 61)',
      category: 'Facturación'
    },
    {
      id: 'nota-debito',
      label: 'Notas de Débito',
      icon: '📈',
      description: 'Aumentos a facturas existentes (DTE 56)',
      category: 'Facturación'
    },
    {
      id: 'cuentas-por-cobrar',
      label: 'Cuentas por Cobrar',
      icon: '💰',
      description: 'Seguimiento de pagos, cobros y estados de cuenta',
      category: 'Facturación'
    },
    {
      id: 'vendedores',
      label: 'Vendedores',
      icon: '🤝',
      description: 'Gestión de equipo de ventas y comisiones',
      category: 'Equipo',
      recommendedFor: ['empresa']
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: '📊',
      description: 'Informes de ventas, productos y análisis de negocio',
      category: 'Análisis'
    },
    {
      id: 'folios',
      label: 'Folios',
      icon: '🔢',
      description: 'Control de numeración de documentos tributarios',
      category: 'Configuración'
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: '⚙️',
      description: 'Datos del emisor, usuarios y ajustes del sistema',
      required: true,
      category: 'Esencial'
    }
  ];

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const roleResult = await window.api.config.get('user_role');
      const subtypeResult = await window.api.config.get('user_subtype');
      
      const role = roleResult?.value || roleResult;
      const subtype = subtypeResult?.value || subtypeResult;
      const name = user?.nombre || user?.email || 'Usuario';
      
      setUserRole(role);
      setUserSubtype(subtype);
      setUserName(name);

      // Obtener módulos recomendados según el perfil
      const recommended = getRecommendedModules(role, subtype);
      
      // Seleccionar módulos recomendados + requeridos por defecto
      const defaultSelection = allModules
        .filter(m => m.required || recommended.includes(m.id))
        .map(m => m.id);
      
      setSelectedModules(defaultSelection);
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedModules = (role, subtype) => {
    if (role === 'persona_natural' && subtype === 'honorarios') {
      return ['dashboard', 'clientes', 'facturas', 'cuentas-por-cobrar', 'reportes', 'configuracion'];
    }
    if (role === 'persona_natural' && subtype === 'comerciante') {
      return ['dashboard', 'pos', 'caja', 'productos', 'boletas', 'facturas', 'clientes', 'compras', 'cuentas-por-cobrar', 'documentos', 'configuracion'];
    }
    if (role === 'empresa') {
      return ['dashboard', 'pos', 'caja', 'facturas', 'boletas', 'productos', 'clientes', 'vendedores', 'compras', 'cuentas-por-cobrar', 'documentos', 'reportes', 'configuracion'];
    }
    return ['dashboard', 'clientes', 'facturas', 'documentos', 'configuracion'];
  };

  const isRecommended = (moduleId) => {
    const recommended = getRecommendedModules(userRole, userSubtype);
    return recommended.includes(moduleId);
  };

  const toggleModule = (moduleId) => {
    const module = allModules.find(m => m.id === moduleId);
    
    // No permitir desactivar módulos requeridos
    if (module.required) return;

    if (selectedModules.includes(moduleId)) {
      setSelectedModules(selectedModules.filter(id => id !== moduleId));
    } else {
      setSelectedModules([...selectedModules, moduleId]);
    }
  };

  const handleContinue = async () => {
    try {
      // Guardar módulos habilitados en la configuración
      await window.api.config.set('enabled_modules', JSON.stringify(selectedModules));
      await window.api.config.set('onboarding_completed', 'true');

      // Actualizar el estado de "first run" en el contexto de autenticación
      try {
        await refreshFirstRun();
      } catch (e) {
        console.warn('No se pudo refrescar firstRun:', e);
      }

      // Redirigir al login después de la personalización
      navigate('/login');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    }
  };

  const selectAll = () => {
    setSelectedModules(allModules.map(m => m.id));
  };

  const selectRecommended = () => {
    const recommended = getRecommendedModules(userRole, userSubtype);
    setSelectedModules(recommended);
  };

  const getProfileTitle = () => {
    if (userRole === 'persona_natural' && userSubtype === 'honorarios') {
      return '💼 Profesional Independiente';
    }
    if (userRole === 'persona_natural' && userSubtype === 'comerciante') {
      return '🏪 Comerciante';
    }
    if (userRole === 'empresa') {
      return '🏢 Empresa';
    }
    return 'Usuario';
  };

  const getProfileDescription = () => {
    if (userRole === 'persona_natural' && userSubtype === 'honorarios') {
      return 'Enfocado en servicios profesionales y gestión de clientes';
    }
    if (userRole === 'persona_natural' && userSubtype === 'comerciante') {
      return 'Enfocado en venta de productos e inventario';
    }
    if (userRole === 'empresa') {
      return 'Gestión completa con equipo de trabajo';
    }
    return '';
  };

  // Agrupar módulos por categoría
  const modulesByCategory = allModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.welcomeSection}>
            <span style={styles.welcomeEmoji}>👋</span>
            <div>
              <h1 style={styles.welcomeTitle}>¡Bienvenido, {userName}!</h1>
              <p style={styles.welcomeSubtitle}>Personaliza tu espacio de trabajo</p>
            </div>
          </div>
          <p style={styles.subtitle}>
            Selecciona los módulos que aparecerán como accesos rápidos en tu dashboard. Todos los módulos estarán siempre disponibles en el menú lateral.
          </p>
        </div>

        {/* Profile Badge */}
        <div style={styles.profileBadge}>
          <div style={styles.profileIcon}>{getProfileTitle().split(' ')[0]}</div>
          <div>
            <div style={styles.profileTitle}>{getProfileTitle()}</div>
            <div style={styles.profileDesc}>{getProfileDescription()}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <button onClick={selectRecommended} style={styles.quickButton}>
            ⭐ Usar Recomendados
          </button>
          <button onClick={selectAll} style={styles.quickButton}>
            ✅ Seleccionar Todos
          </button>
          <div style={styles.selectedCount}>
            {selectedModules.length} de {allModules.length} módulos seleccionados
          </div>
        </div>

        {/* Info Banner */}
        <div style={styles.infoBanner}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <div style={styles.infoBannerText}>
            <strong>Los módulos seleccionados aparecerán como botones de acceso rápido en tu dashboard.</strong>
            {' '}Los recomendados están marcados con <span style={styles.starBadge}>⭐</span>
            {' '}según tu tipo de negocio. Todos los módulos siguen disponibles en el menú lateral.
          </div>
        </div>

        {/* Modules Grid */}
        <div style={styles.modulesContainer}>
          {Object.entries(modulesByCategory).map(([category, modules]) => (
            <div key={category} style={styles.categorySection}>
              <h3 style={styles.categoryTitle}>{category}</h3>
              <div style={styles.moduleGrid}>
                {modules.map((module) => {
                  const isSelected = selectedModules.includes(module.id);
                  const isRec = isRecommended(module.id);
                  
                  return (
                    <div
                      key={module.id}
                      onClick={() => toggleModule(module.id)}
                      style={{
                        ...styles.moduleCard,
                        ...(isSelected ? styles.moduleCardSelected : {}),
                        ...(module.required ? styles.moduleCardRequired : {}),
                        ...(!isSelected && isRec ? styles.moduleCardRecommended : {}),
                        ...(!isSelected && !isRec && !module.required ? styles.moduleCardInactive : {}),
                        cursor: module.required ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {/* Recommended Badge */}
                      {isRec && !module.required && (
                        <div style={styles.recommendedBadge}>⭐ Recomendado</div>
                      )}
                      
                      {/* Required Badge */}
                      {module.required && (
                        <div style={styles.requiredBadge}>✓ Esencial</div>
                      )}

                      {/* Checkbox */}
                      <div style={styles.moduleCheckbox}>
                        <div style={{
                          ...styles.checkbox,
                          ...(isSelected ? styles.checkboxChecked : {})
                        }}>
                          {isSelected && '✓'}
                        </div>
                      </div>

                      {/* Icon */}
                      <div style={styles.moduleIcon}>{module.icon}</div>
                      
                      {/* Label */}
                      <div style={styles.moduleLabel}>{module.label}</div>
                      
                      {/* Description */}
                      <div style={styles.moduleDesc}>{module.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div style={styles.footer}>
          <button
            onClick={handleContinue}
            style={styles.continueButton}
            disabled={selectedModules.length === 0}
          >
            Continuar al Dashboard →
          </button>
          <p style={styles.footerNote}>
            Podrás modificar estos módulos más tarde desde Configuración
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    overflowY: 'auto'
  },
  content: {
    maxWidth: '1200px',
    width: '100%'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #0f766e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  welcomeSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  welcomeEmoji: {
    fontSize: '48px'
  },
  welcomeTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#0f766e',
    margin: '0',
    background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  welcomeSubtitle: {
    fontSize: '18px',
    color: '#6b7280',
    margin: '4px 0 0 0',
    fontWeight: '500'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  profileBadge: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  profileIcon: {
    fontSize: '48px'
  },
  profileTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937'
  },
  profileDesc: {
    fontSize: '14px',
    color: '#6b7280'
  },
  quickActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  quickButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#0f766e',
    color: '#0f766e',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  selectedCount: {
    marginLeft: 'auto',
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '600'
  },
  infoBanner: {
    backgroundColor: '#dbeafe',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#3b82f6',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px'
  },
  infoBannerText: {
    fontSize: '14px',
    color: '#1e40af',
    lineHeight: '1.5'
  },
  starBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  modulesContainer: {
    marginBottom: '40px'
  },
  categorySection: {
    marginBottom: '32px'
  },
  categoryTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px',
    paddingLeft: '4px'
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  moduleCard: {
    backgroundColor: 'white',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    position: 'relative',
    transition: 'all 0.2s',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column'
  },
  moduleCardSelected: {
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)'
  },
  moduleCardRequired: {
    backgroundColor: '#f9fafb',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#9ca3af',
    opacity: 0.9
  },
  moduleCardRecommended: {
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
    borderWidth: '2px',
    borderStyle: 'solid'
  },
  moduleCardInactive: {
    opacity: 0.6,
    backgroundColor: '#f9fafb'
  },
  recommendedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700'
  },
  requiredBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#e5e7eb',
    color: '#4b5563',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700'
  },
  moduleCheckbox: {
    position: 'absolute',
    top: '12px',
    left: '12px'
  },
  checkbox: {
    width: '24px',
    height: '24px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#d1d5db',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white'
  },
  checkboxChecked: {
    backgroundColor: '#0f766e',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#0f766e'
  },
  moduleIcon: {
    fontSize: '40px',
    marginTop: '20px',
    marginBottom: '12px'
  },
  moduleLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  moduleDesc: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.4',
    flex: 1
  },
  footer: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTopWidth: '2px',
    borderTopStyle: 'solid',
    borderTopColor: '#e5e7eb'
  },
  continueButton: {
    padding: '14px 32px',
    backgroundColor: '#0f766e',
    color: 'white',
    borderWidth: '0',
    borderStyle: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'background 0.2s'
  },
  footerNote: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0
  }
};

export default ModuleSelector;
