import React, { useState, useEffect } from 'react';
import Select from 'react-select';

function NotaDebito({ onGuardar, onCancelar }) {
  const [facturas, setFacturas] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarFacturas();
  }, []);

  const cargarFacturas = async () => {
    try {
      const result = await window.api.facturas.getAll();
      if (result.success) {
        setFacturas(result.data.filter(f => f.estado === 'emitida'));
      }
    } catch (error) {
      console.error('Error cargando facturas:', error);
    }
  };

  const facturasOptions = facturas.map(f => ({
    value: f.id,
    label: `Factura #${f.folio} - ${f.cliente_nombre} - $${f.total?.toLocaleString('es-CL')}`
  }));

  const motivosComunes = [
    'Intereses por mora',
    'Gastos de cobranza',
    'Recargo por servicios adicionales',
    'Ajuste de precios',
    'Gastos de envío adicionales',
    'Otro'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!facturaSeleccionada || !motivo || !monto || !descripcion) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    if (parseFloat(monto) <= 0) {
      alert('El monto debe ser mayor a cero');
      return;
    }

    setLoading(true);

    try {
      const data = {
        tipo_documento: 56, // Nota de Débito
        factura_referencia_id: facturaSeleccionada,
        motivo,
        monto: parseFloat(monto),
        descripcion
      };

      // Aquí se integraría con el backend
      console.log('Nota de Débito:', data);
      
      alert('✅ Nota de Débito generada exitosamente');
      onGuardar(data);
    } catch (error) {
      console.error('Error al generar nota de débito:', error);
      alert('Error al generar nota de débito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📝 Nueva Nota de Débito</h1>
          <p style={styles.subtitle}>Tipo DTE: 56</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={onCancelar} style={styles.cancelButton}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? 'Generando...' : '✓ Generar Nota'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Información de la Nota */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Información de la Nota de Débito</h3>
          <p style={styles.sectionDesc}>
            Las Notas de Débito se utilizan para aumentar el valor de una factura ya emitida
          </p>
        </div>

        {/* Selección de Factura */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Factura a Referenciar</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Seleccionar Factura *</label>
            <Select
              options={facturasOptions}
              onChange={(option) => setFacturaSeleccionada(option?.value)}
              placeholder="Buscar factura..."
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '42px',
                  borderColor: '#d1d5db'
                })
              }}
            />
          </div>
        </div>

        {/* Detalle del Ajuste */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Detalle del Ajuste</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Motivo *</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              style={styles.select}
              required
            >
              <option value="">Seleccione un motivo...</option>
              {motivosComunes.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Monto a Aumentar *</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              style={styles.input}
              min="1"
              step="1"
              required
            />
            <div style={styles.hint}>
              Ingrese el monto sin IVA. El IVA se calculará automáticamente.
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción Detallada *</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa el motivo del ajuste..."
              style={styles.textarea}
              rows="4"
              required
            />
          </div>
        </div>

        {/* Resumen */}
        {monto && parseFloat(monto) > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Resumen</h3>
            
            <div style={styles.resumen}>
              <div style={styles.resumenRow}>
                <span>Monto Neto:</span>
                <span style={styles.resumenValue}>
                  ${parseFloat(monto).toLocaleString('es-CL')}
                </span>
              </div>
              <div style={styles.resumenRow}>
                <span>IVA (19%):</span>
                <span style={styles.resumenValue}>
                  ${(parseFloat(monto) * 0.19).toLocaleString('es-CL')}
                </span>
              </div>
              <div style={styles.resumenRowTotal}>
                <span>Total a Aumentar:</span>
                <span style={styles.resumenTotal}>
                  ${(parseFloat(monto) * 1.19).toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 4px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#4b5563',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '10px 24px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '16px'
  },
  sectionDesc: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    backgroundColor: '#f0f9ff',
    padding: '12px',
    borderRadius: '8px',
    borderLeft: '4px solid #3b82f6'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  hint: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '6px',
    fontStyle: 'italic'
  },
  resumen: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px'
  },
  resumenRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '15px',
    color: '#4b5563'
  },
  resumenValue: {
    fontWeight: '600'
  },
  resumenRowTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '2px solid #e5e7eb',
    marginTop: '8px',
    fontSize: '18px',
    fontWeight: '700'
  },
  resumenTotal: {
    color: '#0f766e',
    fontSize: '24px'
  }
};

export default NotaDebito;
