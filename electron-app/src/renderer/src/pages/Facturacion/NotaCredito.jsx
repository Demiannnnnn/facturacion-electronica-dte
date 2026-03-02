import React, { useState, useEffect } from 'react';
import Select from 'react-select';

function NotaCredito({ onGuardar, onCancelar }) {
  const [facturas, setFacturas] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [tipo, setTipo] = useState('anula'); // anula, corrige
  const [motivo, setMotivo] = useState('');
  const [itemsAfectados, setItemsAfectados] = useState([]);
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

  const handleFacturaChange = async (option) => {
    if (option) {
      setFacturaSeleccionada(option.value);
      // Cargar items de la factura
      try {
        const result = await window.api.facturas.getById(option.value);
        if (result.success && result.data.items) {
          setItemsAfectados(result.data.items.map(item => ({
            ...item,
            cantidadNC: tipo === 'anula' ? item.cantidad : 0
          })));
        }
      } catch (error) {
        console.error('Error cargando factura:', error);
      }
    } else {
      setFacturaSeleccionada(null);
      setItemsAfectados([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!facturaSeleccionada || !motivo) {
      alert('Complete todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const data = {
        tipo_documento: 61, // Nota de Crédito
        factura_referencia_id: facturaSeleccionada,
        tipo_nc: tipo,
        motivo,
        items: itemsAfectados.filter(item => item.cantidadNC > 0)
      };

      // Aquí se integraría con el backend
      console.log('Nota de Crédito:', data);
      
      alert('✅ Nota de Crédito generada exitosamente');
      onGuardar(data);
    } catch (error) {
      console.error('Error al generar nota de crédito:', error);
      alert('Error al generar nota de crédito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📝 Nueva Nota de Crédito</h1>
          <p style={styles.subtitle}>Tipo DTE: 61</p>
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
        {/* Selección de Factura */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Factura a Referenciar</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Seleccionar Factura *</label>
            <Select
              options={facturasOptions}
              onChange={handleFacturaChange}
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

        {/* Tipo de Nota */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Tipo de Nota de Crédito</h3>
          
          <div style={styles.tipoButtons}>
            <button
              type="button"
              onClick={() => setTipo('anula')}
              style={{
                ...styles.tipoButton,
                ...(tipo === 'anula' ? styles.tipoButtonActive : {})
              }}
            >
              <div style={styles.tipoIcon}>❌</div>
              <div style={styles.tipoTitle}>Anula Documento</div>
              <div style={styles.tipoDesc}>Anula completamente la factura</div>
            </button>

            <button
              type="button"
              onClick={() => setTipo('corrige')}
              style={{
                ...styles.tipoButton,
                ...(tipo === 'corrige' ? styles.tipoButtonActive : {})
              }}
            >
              <div style={styles.tipoIcon}>✏️</div>
              <div style={styles.tipoTitle}>Corrige Monto</div>
              <div style={styles.tipoDesc}>Corrige montos o items específicos</div>
            </button>
          </div>
        </div>

        {/* Motivo */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Motivo</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción del Motivo *</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Producto devuelto por el cliente, Error en precio, etc."
              style={styles.textarea}
              rows="4"
              required
            />
          </div>
        </div>

        {/* Items Afectados */}
        {itemsAfectados.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Items Afectados</h3>
            
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Producto</th>
                    <th style={styles.th}>Cant. Original</th>
                    <th style={styles.th}>Precio Unit.</th>
                    <th style={styles.th}>Cant. a Acreditar</th>
                    <th style={styles.th}>Total NC</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsAfectados.map((item, index) => (
                    <tr key={index} style={styles.tr}>
                      <td style={styles.td}>{item.descripcion}</td>
                      <td style={styles.td}>{item.cantidad}</td>
                      <td style={styles.td}>
                        ${item.precio_unitario?.toLocaleString('es-CL')}
                      </td>
                      <td style={styles.td}>
                        <input
                          type="number"
                          value={item.cantidadNC}
                          onChange={(e) => {
                            const newItems = [...itemsAfectados];
                            newItems[index].cantidadNC = Math.min(
                              parseInt(e.target.value) || 0,
                              item.cantidad
                            );
                            setItemsAfectados(newItems);
                          }}
                          style={styles.inputSmall}
                          min="0"
                          max={item.cantidad}
                          disabled={tipo === 'anula'}
                        />
                      </td>
                      <td style={styles.td}>
                        <span style={styles.totalNC}>
                          ${((item.cantidadNC || 0) * item.precio_unitario).toLocaleString('es-CL')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={styles.totales}>
              <div style={styles.totalRow}>
                <span>Total a Acreditar:</span>
                <span style={styles.totalAmount}>
                  ${itemsAfectados
                    .reduce((sum, item) => sum + ((item.cantidadNC || 0) * item.precio_unitario), 0)
                    .toLocaleString('es-CL')}
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
    maxWidth: '1200px',
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
    backgroundColor: '#dc2626',
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
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
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
  tipoButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  tipoButton: {
    padding: '20px',
    border: '3px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  },
  tipoButtonActive: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2'
  },
  tipoIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  tipoTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px'
  },
  tipoDesc: {
    fontSize: '13px',
    color: '#6b7280'
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '16px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    borderBottom: '2px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#1f2937'
  },
  inputSmall: {
    width: '80px',
    padding: '6px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600'
  },
  totalNC: {
    fontWeight: '700',
    color: '#dc2626'
  },
  totales: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937'
  },
  totalAmount: {
    color: '#dc2626'
  }
};

export default NotaCredito;
