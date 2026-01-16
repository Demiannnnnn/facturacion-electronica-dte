import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    // Si no tiene subtipos, limpiar subtipo
    if (role !== 'persona_natural') {
      setSelectedSubtype(null);
    }
  };

  const handleSubtypeSelect = (subtype) => {
    setSelectedSubtype(subtype);
  };

  const handleContinue = async () => {
    if (!selectedRole) {
      alert('Por favor selecciona un tipo de cuenta');
      return;
    }

    // Validar que si es persona natural, tenga subtipo
    if (selectedRole === 'persona_natural' && !selectedSubtype) {
      alert('Por favor selecciona el tipo de actividad');
      return;
    }

    try {
      // Guardar el rol y subtipo seleccionados
      await window.api.config.set('user_role', selectedRole);
      
      if (selectedSubtype) {
        await window.api.config.set('user_subtype', selectedSubtype);
      }
      
      // Redirigir a la página de registro
      const params = new URLSearchParams({ role: selectedRole });
      if (selectedSubtype) {
        params.append('subtype', selectedSubtype);
      }
      navigate(`/register?${params.toString()}`);
    } catch (error) {
      console.error('Error guardando rol:', error);
      alert('Error al seleccionar el tipo de cuenta');
    }
  };

  const handleSeedProfiles = async () => {
    if (!confirm('⚠️ Esto creará/reseteará todos los perfiles de desarrollo.\n\n¿Continuar?')) {
      return;
    }

    setSeeding(true);
    try {
      const result = await window.api.seed.all();
      
      if (result.success) {
        alert('✅ Todos los perfiles han sido creados exitosamente!\n\nAhora puedes cerrar la app y reiniciar con:\n- npm run dev:contador\n- npm run dev:empresa\n- npm run dev:personaA\n- npm run dev:personaB\n\nVer testing.md para las credenciales.');
      } else {
        alert('❌ Error al crear los perfiles:\n\n' + result.results.map(r => `${r.profile}: ${r.error || 'OK'}`).join('\n'));
      }
    } catch (error) {
      console.error('Error seeding profiles:', error);
      alert('Error: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  const getRoleTitle = () => {
    if (selectedRole === 'contador') return 'Cuenta Contador';
    if (selectedRole === 'empresa') return 'Cuenta Empresa';
    if (selectedRole === 'persona_natural' && selectedSubtype === 'honorarios') return 'Persona Natural - Honorarios';
    if (selectedRole === 'persona_natural' && selectedSubtype === 'comerciante') return 'Persona Natural - Comerciante';
    return 'Selección';
  };

  return (
    <div style={styles.container}>
      {/* Botón de seed en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleSeedProfiles}
          disabled={seeding}
          style={styles.seedButton}
        >
          {seeding ? '⏳ Creando perfiles...' : '🌱 Seed All Profiles (DEV)'}
        </button>
      )}

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Sistema de Facturación Electrónica</h1>
          <p style={styles.subtitle}>Selecciona el tipo de cuenta que mejor se adapte a tu situación</p>
        </div>

        <div style={styles.rolesContainer}>
          {/* CONTADOR */}
          <div
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'contador' ? styles.roleCardSelected : {})
            }}
            onClick={() => handleRoleSelect('contador')}
          >
            <div style={styles.roleIcon}>👨‍💼</div>
            <h2 style={styles.roleTitle}>Contador</h2>
            <p style={styles.roleDescription}>
              Gestiona múltiples empresas clientes desde una sola plataforma
            </p>
            <ul style={styles.featureList}>
              <li>✅ Administra múltiples clientes</li>
              <li>✅ Dashboard consolidado</li>
              <li>✅ Gestión centralizada de folios</li>
              <li>✅ Aprobación de documentos</li>
              <li>✅ Certificados digitales</li>
              <li>✅ Reportes por cliente</li>
            </ul>
            {selectedRole === 'contador' && (
              <div style={styles.selectedBadge}>✓ Seleccionado</div>
            )}
          </div>

          {/* EMPRESA */}
          <div
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'empresa' ? styles.roleCardSelected : {})
            }}
            onClick={() => handleRoleSelect('empresa')}
          >
            <div style={styles.roleIcon}>🏢</div>
            <h2 style={styles.roleTitle}>Empresa</h2>
            <p style={styles.roleDescription}>
              Persona jurídica (SpA, SRL, SA, EIRL)
            </p>
            <ul style={styles.featureList}>
              <li>✅ Facturación completa (33, 34, 61, etc.)</li>
              <li>✅ Control de inventario</li>
              <li>✅ Múltiples usuarios*</li>
              <li>✅ Gestión de clientes y proveedores</li>
              <li>✅ Guías de despacho</li>
              <li>✅ Reportes tributarios</li>
            </ul>
            <p style={styles.footnote}>* Próximamente con sincronización</p>
            {selectedRole === 'empresa' && (
              <div style={styles.selectedBadge}>✓ Seleccionado</div>
            )}
          </div>

          {/* PERSONA NATURAL */}
          <div
            style={{
              ...styles.roleCard,
              ...(selectedRole === 'persona_natural' ? styles.roleCardSelected : {})
            }}
            onClick={() => handleRoleSelect('persona_natural')}
          >
            <div style={styles.roleIcon}>👤</div>
            <h2 style={styles.roleTitle}>Persona Natural</h2>
            <p style={styles.roleDescription}>
              Profesional independiente o emprendedor
            </p>
            <ul style={styles.featureList}>
              <li>✅ Boletas de honorarios (Subtipo A)</li>
              <li>✅ Boletas o facturas (Subtipo B)</li>
              <li>✅ Gestión simplificada</li>
              <li>✅ Clientes y servicios</li>
              <li>✅ Reportes básicos</li>
              <li>✅ Libro de ventas</li>
            </ul>
            {selectedRole === 'persona_natural' && (
              <div style={styles.selectedBadge}>✓ Seleccionado</div>
            )}
          </div>
        </div>

        {/* SUBTIPOS DE PERSONA NATURAL */}
        {selectedRole === 'persona_natural' && (
          <div style={styles.subtypesSection}>
            <h3 style={styles.subtypesTitle}>Selecciona tu tipo de actividad:</h3>
            
            <div style={styles.subtypesContainer}>
              {/* Subtipo A: Honorarios */}
              <div
                style={{
                  ...styles.subtypeCard,
                  ...(selectedSubtype === 'honorarios' ? styles.subtypeCardSelected : {})
                }}
                onClick={() => handleSubtypeSelect('honorarios')}
              >
                <div style={styles.subtypeIcon}>📄</div>
                <h4 style={styles.subtypeTitle}>Honorarios</h4>
                <p style={styles.subtypeDescription}>Segunda categoría</p>
                <ul style={styles.subtypeFeatures}>
                  <li>• Boletas de honorarios electrónicas</li>
                  <li>• Retención 10% o 11.5%</li>
                  <li>• Profesionales independientes</li>
                  <li>• Servicios personales</li>
                </ul>
                {selectedSubtype === 'honorarios' && (
                  <div style={styles.subtypeSelectedBadge}>✓</div>
                )}
              </div>

              {/* Subtipo B: Comerciante */}
              <div
                style={{
                  ...styles.subtypeCard,
                  ...(selectedSubtype === 'comerciante' ? styles.subtypeCardSelected : {})
                }}
                onClick={() => handleSubtypeSelect('comerciante')}
              >
                <div style={styles.subtypeIcon}>💼</div>
                <h4 style={styles.subtypeTitle}>Comerciante / Emprendedor</h4>
                <p style={styles.subtypeDescription}>Primera categoría, Pro-Pyme</p>
                <ul style={styles.subtypeFeatures}>
                  <li>• Boletas electrónicas (39)</li>
                  <li>• Facturas electrónicas (33)</li>
                  <li>• Venta de productos o servicios</li>
                  <li>• Inicio de actividades comercial</li>
                </ul>
                {selectedSubtype === 'comerciante' && (
                  <div style={styles.subtypeSelectedBadge}>✓</div>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          style={{
            ...styles.continueButton,
            ...((!selectedRole || (selectedRole === 'persona_natural' && !selectedSubtype)) 
              ? styles.continueButtonDisabled 
              : {})
          }}
          onClick={handleContinue}
          disabled={!selectedRole || (selectedRole === 'persona_natural' && !selectedSubtype)}
        >
          Continuar con {getRoleTitle()}
        </button>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            💡 <strong>¿No estás seguro?</strong>
            <br />
            {selectedRole === 'contador' && 'Como contador, podrás administrar las empresas de múltiples clientes desde un solo sistema.'}
            {selectedRole === 'empresa' && 'Como empresa, tendrás acceso completo a facturación, inventario y gestión multi-usuario.'}
            {selectedRole === 'persona_natural' && !selectedSubtype && 'Selecciona el tipo de actividad que realizas para continuar.'}
            {selectedSubtype === 'honorarios' && 'Ideal para profesionales que emiten boletas de honorarios (abogados, médicos, consultores, etc.)'}
            {selectedSubtype === 'comerciante' && 'Ideal para emprendedores que venden productos o servicios y necesitan emitir boletas o facturas.'}
          </p>
        </div>
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
    backgroundColor: '#f5f7fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '40px 20px'
  },
  content: {
    maxWidth: '1400px',
    width: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '12px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#718096',
    fontWeight: '400'
  },
  rolesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '30px'
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px 24px',
    cursor: 'pointer',
    border: '3px solid #e2e8f0',
    transition: 'all 0.3s ease',
    position: 'relative',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    minHeight: '380px'
  },
  roleCardSelected: {
    borderColor: '#3182ce',
    backgroundColor: '#ebf8ff',
    boxShadow: '0 8px 20px rgba(49, 130, 206, 0.25)',
    transform: 'translateY(-4px)'
  },
  roleIcon: {
    fontSize: '56px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  roleTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '10px',
    textAlign: 'center'
  },
  roleDescription: {
    fontSize: '15px',
    color: '#4a5568',
    marginBottom: '20px',
    textAlign: 'center',
    lineHeight: '1.5',
    minHeight: '40px'
  },
  featureList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    fontSize: '14px',
    color: '#2d3748',
    lineHeight: '1.8'
  },
  footnote: {
    fontSize: '12px',
    color: '#a0aec0',
    fontStyle: 'italic',
    marginTop: '12px',
    textAlign: 'center'
  },
  selectedBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: '#3182ce',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  subtypesSection: {
    marginTop: '40px',
    marginBottom: '30px',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '2px solid #3182ce',
    boxShadow: '0 4px 12px rgba(49, 130, 206, 0.15)'
  },
  subtypesTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '24px',
    textAlign: 'center'
  },
  subtypesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  subtypeCard: {
    backgroundColor: '#f7fafc',
    borderRadius: '10px',
    padding: '24px',
    cursor: 'pointer',
    border: '2px solid #cbd5e0',
    transition: 'all 0.3s ease',
    position: 'relative'
  },
  subtypeCardSelected: {
    borderColor: '#2b6cb0',
    backgroundColor: '#e6f7ff',
    boxShadow: '0 4px 12px rgba(43, 108, 176, 0.2)',
    transform: 'scale(1.02)'
  },
  subtypeIcon: {
    fontSize: '40px',
    marginBottom: '12px',
    textAlign: 'center'
  },
  subtypeTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '6px',
    textAlign: 'center'
  },
  subtypeDescription: {
    fontSize: '13px',
    color: '#718096',
    marginBottom: '16px',
    textAlign: 'center',
    fontWeight: '500'
  },
  subtypeFeatures: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    fontSize: '13px',
    color: '#4a5568',
    lineHeight: '1.8'
  },
  subtypeSelectedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#2b6cb0',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600'
  },
  seedButton: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '10px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
    transition: 'all 0.2s'
  },
  continueButton: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    display: 'block',
    padding: '18px 32px',
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#3182ce',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)'
  },
  continueButtonDisabled: {
    backgroundColor: '#cbd5e0',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '14px',
    color: '#718096',
    lineHeight: '1.7',
    maxWidth: '800px',
    margin: '0 auto'
  }
};

export default RoleSelectionPage;
