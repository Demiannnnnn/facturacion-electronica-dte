import React, { useState, useEffect } from 'react';
import FormularioFactura from '../../components/facturas/FormularioFactura';
import { generarPDFFactura, abrirPDF } from '../../utils/generarPDF';
import { formatearRut } from '../../utils/validaciones';

function Facturas() {
  const [view, setView] = useState('list');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [facturas, setFacturas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emisor, setEmisor] = useState(null);

  useEffect(() => {
    cargarFacturas();
    cargarEmisor();
  }, []);

  const cargarFacturas = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.facturas.getAll();
      if (result.success) {
        setFacturas(result.data);
      }
    } catch (error) {
      console.error('Error cargando facturas:', error);
    }
    setIsLoading(false);
  };

  const cargarEmisor = async () => {
    try {
      const result = await window.api.emisor.get();
      if (result.success && result.data) {
        setEmisor(result.data);
      }
    } catch (error) {
      console.error('Error cargando emisor:', error);
    }
  };

  const handleFacturaCreada = async (data) => {
    try {
      // Recargar facturas
      await cargarFacturas();

      // Obtener la factura completa para generar PDF
      const result = await window.api.facturas.getById(data.id);
      if (result.success) {
        // Generar PDF
        const pdf = await generarPDFFactura(result.data, emisor);

        // Guardar PDF en disco
        const { guardarPDFEnDisco } = await import('../../utils/generarPDF');
        const pdfPath = await guardarPDFEnDisco(pdf, result.data.folio);

        // Actualizar la factura con la ruta del PDF
        await window.api.facturas.updatePDFPath({
          id: data.id,
          pdfPath: pdfPath
        });

        // Abrir PDF guardado
        const { abrirPDFGuardado } = await import('../../utils/generarPDF');
        await abrirPDFGuardado(pdfPath);
      }

      // Volver a la lista
      setView('list');
    } catch (error) {
      console.error('Error en handleFacturaCreada:', error);
      alert('Error al procesar la factura. Por favor intente nuevamente.');
    }
  };

  const handleVerPDF = async (facturaId) => {
    try {
      const result = await window.api.facturas.getById(facturaId);
      if (result.success) {
        const factura = result.data;

        // Si la factura ya tiene PDF guardado, abrirlo
        if (factura.pdf_path) {
          const { abrirPDFGuardado } = await import('../../utils/generarPDF');
          await abrirPDFGuardado(factura.pdf_path);
        } else {
          // Si no tiene PDF guardado, generarlo y guardarlo
          const pdf = await generarPDFFactura(factura, emisor);

          const { guardarPDFEnDisco, abrirPDFGuardado } = await import('../../utils/generarPDF');
          const pdfPath = await guardarPDFEnDisco(pdf, factura.folio);

          // Actualizar la factura con la ruta del PDF
          await window.api.facturas.updatePDFPath({
            id: facturaId,
            pdfPath: pdfPath
          });

          // Abrir PDF guardado
          await abrirPDFGuardado(pdfPath);
        }
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const handleCambiarEstado = async (facturaId, nuevoEstado) => {
    try {
      const result = await window.api.facturas.updateEstado({
        id: facturaId,
        estado: nuevoEstado
      });

      if (result.success) {
        await cargarFacturas();
      } else {
        alert('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el estado');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pagada: { color: '#28a745', bg: '#d4edda', text: 'Pagada' },
      pendiente: { color: '#ffc107', bg: '#fff3cd', text: 'Pendiente' },
      vencida: { color: '#dc3545', bg: '#f8d7da', text: 'Vencida' }
    };
    const badge = badges[estado] || badges.pendiente;
    return (
      <span style={{
        ...styles.badge,
        backgroundColor: badge.bg,
        color: badge.color
      }}>
        {badge.text}
      </span>
    );
  };

  const filteredFacturas = filterEstado === 'todos'
    ? facturas
    : facturas.filter(f => f.estado === filterEstado);

  const totales = {
    todos: facturas.length,
    pendiente: facturas.filter(f => f.estado === 'pendiente').length,
    pagada: facturas.filter(f => f.estado === 'pagada').length,
    vencida: facturas.filter(f => f.estado === 'vencida').length,
    monto: facturas.reduce((sum, f) => sum + f.total, 0)
  };

  // Si no hay emisor configurado, mostrar mensaje
  if (!emisor && view === 'form') {
    return (
      <div style={styles.container}>
        <div style={styles.warningBox}>
          <h2>⚠️ Configuración Requerida</h2>
          <p>Antes de crear facturas, debes configurar los datos de tu empresa en la sección de Configuración.</p>
          <button onClick={() => setView('list')} style={styles.button}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {view === 'form' ? (
        <FormularioFactura
          onCancel={() => setView('list')}
          onSuccess={handleFacturaCreada}
        />
      ) : (
        <>
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>📄 Gestión de Facturas</h1>
              <p style={styles.subtitle}>Administra tus documentos tributarios electrónicos</p>
            </div>
            <button
              onClick={() => setView('form')}
              style={styles.newButton}
            >
              + Nueva Factura
            </button>
          </div>

          {/* Cards de resumen */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📊</div>
              <div>
                <div style={styles.statLabel}>Total Facturas</div>
                <div style={styles.statValue}>{totales.todos}</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #ffc107' }}>
              <div style={styles.statIcon}>⏳</div>
              <div>
                <div style={styles.statLabel}>Pendientes</div>
                <div style={styles.statValue}>{totales.pendiente}</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #28a745' }}>
              <div style={styles.statIcon}>✅</div>
              <div>
                <div style={styles.statLabel}>Pagadas</div>
                <div style={styles.statValue}>{totales.pagada}</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #dc3545' }}>
              <div style={styles.statIcon}>⚠️</div>
              <div>
                <div style={styles.statLabel}>Vencidas</div>
                <div style={styles.statValue}>{totales.vencida}</div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div style={styles.filterBar}>
            <div style={styles.filterButtons}>
              {['todos', 'pendiente', 'pagada', 'vencida'].map(estado => (
                <button
                  key={estado}
                  onClick={() => setFilterEstado(estado)}
                  style={{
                    ...styles.filterButton,
                    ...(filterEstado === estado ? styles.filterButtonActive : {})
                  }}
                >
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla de facturas */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Folio</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Monto</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacturas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyMessage}>
                      No hay facturas con el filtro seleccionado.
                    </td>
                  </tr>
                ) : (
                  filteredFacturas.map((factura) => (
                    <tr key={factura.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.folio}>#{factura.folio}</span>
                      </td>
                      <td style={styles.td}>{factura.cliente_nombre}</td>
                      <td style={styles.td}>
                        {new Date(factura.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                      </td>
                      <td style={styles.td}>
                        <strong>{formatPrice(factura.total)}</strong>
                      </td>
                      <td style={styles.td}>
                        {getEstadoBadge(factura.estado)}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.actionBtn}
                          title="Ver PDF"
                          onClick={() => handleVerPDF(factura.id)}
                        >
                          📄
                        </button>
                        <select
                          value={factura.estado}
                          onChange={(e) => handleCambiarEstado(factura.id, e.target.value)}
                          style={styles.estadoSelect}
                          title="Cambiar estado"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="pagada">Pagada</option>
                          <option value="vencida">Vencida</option>
                          <option value="anulada">Anulada</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.totalBar}>
            <strong>Total visualizado: {formatPrice(filteredFacturas.reduce((sum, f) => sum + parseFloat(f.total || 0), 0))}</strong>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px'
  },
  title: {
    fontSize: '28px',
    marginBottom: '5px',
    color: '#333'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666'
  },
  newButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,123,255,0.3)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderLeft: '4px solid #007bff',
    borderRadius: '6px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  statIcon: {
    fontSize: '32px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#212529'
  },
  filterBar: {
    marginBottom: '20px'
  },
  filterButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    color: '#495057',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
    color: 'white',
    border: '1px solid #007bff'
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '15px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px',
    fontWeight: '600',
    color: '#495057'
  },
  tr: {
    borderBottom: '1px solid #dee2e6'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#212529'
  },
  folio: {
    fontWeight: '600',
    color: '#007bff'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  actionBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    marginRight: '5px'
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '14px'
  },
  totalBar: {
    textAlign: 'right',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '16px'
  },
  formContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    padding: '40px'
  },
  formTitle: {
    fontSize: '22px',
    marginBottom: '15px',
    color: '#333'
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.6'
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  estadoSelect: {
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#495057'
  },
  warningBox: {
    maxWidth: '600px',
    margin: '60px auto',
    padding: '40px',
    backgroundColor: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '8px',
    textAlign: 'center'
  },
  button: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export default Facturas;
