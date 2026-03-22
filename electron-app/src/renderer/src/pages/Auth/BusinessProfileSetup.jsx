import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_MODULES = [
  'dashboard',
  'pos',
  'caja',
  'clientes',
  'productos',
  'trabajadores',
  'compras',
  'documentos',
  'facturas',
  'boletas',
  'guias',
  'nota-credito',
  'nota-debito',
  'cuentas-por-cobrar',
  'reportes',
  'folios',
  'mi-contador',
  'configuracion'
];

function BusinessProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [baseModules, setBaseModules] = useState(DEFAULT_MODULES);
  const [form, setForm] = useState({
    documentPreference: 'ambas',
    businessType: 'local',
    salesChannel: 'mostrador',
    complexity: 'simple'
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const modulesConfig = await window.api.config.get('enabled_modules');
        if (modulesConfig?.value) {
          const parsed = JSON.parse(modulesConfig.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBaseModules(parsed);
          }
        }
      } catch (error) {
        console.warn('No se pudo cargar enabled_modules para perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const previewModules = useMemo(() => {
    const finalModules = new Set(baseModules);

    finalModules.add('dashboard');
    finalModules.add('configuracion');

    if (form.documentPreference === 'boleta') {
      finalModules.delete('facturas');
      finalModules.delete('cuentas-por-cobrar');
      finalModules.delete('nota-credito');
      finalModules.delete('nota-debito');
      finalModules.delete('guias');
      finalModules.delete('folios');
      finalModules.delete('documentos');
    }

    if (form.documentPreference === 'factura') {
      finalModules.delete('boletas');
      finalModules.delete('pos');
      finalModules.delete('caja');
    }

    if (form.businessType === 'servicios') {
      finalModules.delete('productos');
      finalModules.delete('compras');
      finalModules.delete('pos');
      finalModules.delete('caja');
    }

    if (form.complexity === 'simple') {
      finalModules.delete('nota-credito');
      finalModules.delete('nota-debito');
      finalModules.delete('folios');
      finalModules.delete('documentos');
      finalModules.delete('trabajadores');
      finalModules.delete('mi-contador');
    }

    if (form.salesChannel === 'delivery') {
      finalModules.add('clientes');
    }

    return Array.from(finalModules);
  }, [baseModules, form]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinish = async () => {
    try {
      await window.api.config.set('business_document_preference', form.documentPreference);
      await window.api.config.set('business_type', form.businessType);
      await window.api.config.set('business_sales_channel', form.salesChannel);
      await window.api.config.set('business_ui_complexity', form.complexity);
      await window.api.config.set('business_profile_completed', 'true');
      await window.api.config.set('enabled_modules', JSON.stringify(previewModules));
      await window.api.config.set('onboarding_completed', 'false');

      navigate('/module-selector');
    } catch (error) {
      console.error('Error guardando perfil de negocio:', error);
      alert('No se pudo guardar el perfil. Intenta nuevamente.');
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Configura tu perfil de negocio</h1>
        <p style={styles.subtitle}>
          Esta configuración ordena la interfaz para mostrar primero lo que más usas.
        </p>

        <div style={styles.group}>
          <label style={styles.label}>¿Qué documentos emitirás principalmente?</label>
          <div style={styles.row}>
            <button style={form.documentPreference === 'boleta' ? styles.optionActive : styles.option} onClick={() => handleChange('documentPreference', 'boleta')}>Solo boletas</button>
            <button style={form.documentPreference === 'factura' ? styles.optionActive : styles.option} onClick={() => handleChange('documentPreference', 'factura')}>Solo facturas</button>
            <button style={form.documentPreference === 'ambas' ? styles.optionActive : styles.option} onClick={() => handleChange('documentPreference', 'ambas')}>Ambas</button>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>¿Qué tipo de negocio tienes?</label>
          <div style={styles.rowWrap}>
            {[
              { id: 'minimarket', text: 'Minimarket' },
              { id: 'local', text: 'Local comercial' },
              { id: 'restaurante', text: 'Restaurante' },
              { id: 'servicios', text: 'Servicios' },
              { id: 'otro', text: 'Otro' }
            ].map((item) => (
              <button key={item.id} style={form.businessType === item.id ? styles.optionActive : styles.option} onClick={() => handleChange('businessType', item.id)}>
                {item.text}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Canal principal de venta</label>
          <div style={styles.row}>
            <button style={form.salesChannel === 'mostrador' ? styles.optionActive : styles.option} onClick={() => handleChange('salesChannel', 'mostrador')}>Mostrador</button>
            <button style={form.salesChannel === 'delivery' ? styles.optionActive : styles.option} onClick={() => handleChange('salesChannel', 'delivery')}>Delivery</button>
            <button style={form.salesChannel === 'mixto' ? styles.optionActive : styles.option} onClick={() => handleChange('salesChannel', 'mixto')}>Mixto</button>
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Nivel de interfaz</label>
          <div style={styles.row}>
            <button style={form.complexity === 'simple' ? styles.optionActive : styles.option} onClick={() => handleChange('complexity', 'simple')}>Simple</button>
            <button style={form.complexity === 'completa' ? styles.optionActive : styles.option} onClick={() => handleChange('complexity', 'completa')}>Completa</button>
          </div>
        </div>

        <div style={styles.preview}>
          <strong>Módulos visibles al iniciar:</strong>
          <div style={styles.previewText}>{previewModules.join(' • ')}</div>
        </div>

        <div style={styles.actions}>
          <button style={styles.backButton} onClick={() => navigate('/login')}>Volver</button>
          <button style={styles.finishButton} onClick={handleFinish}>Continuar a selección de módulos</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    padding: '28px'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    color: '#111827'
  },
  subtitle: {
    marginTop: '8px',
    marginBottom: '20px',
    color: '#4b5563'
  },
  group: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 700,
    color: '#1f2937'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px'
  },
  rowWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '10px'
  },
  option: {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '10px 12px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontWeight: 600
  },
  optionActive: {
    border: '1px solid #0f766e',
    borderRadius: '8px',
    padding: '10px 12px',
    backgroundColor: '#ccfbf1',
    color: '#115e59',
    cursor: 'pointer',
    fontWeight: 700
  },
  preview: {
    marginTop: '20px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '14px'
  },
  previewText: {
    marginTop: '8px',
    color: '#374151',
    lineHeight: 1.5
  },
  actions: {
    marginTop: '22px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  backButton: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 600
  },
  finishButton: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0f766e',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 700
  }
};

export default BusinessProfileSetup;
