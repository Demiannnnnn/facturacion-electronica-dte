import React, { useState, useEffect } from 'react';
import FormularioFactura from '../../components/facturas/FormularioFactura';
import { generarPDFFactura, abrirPDF } from '../../utils/generarPDF';
import { formatearRut } from '../../utils/validaciones';

function Facturas() {
  const [view, setView] = useState('list');
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emisor, setEmisor] = useState(null);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterFormaPago, setFilterFormaPago] = useState('todos');
  const [filterCliente, setFilterCliente] = useState('');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');

  useEffect(() => {
    cargarFacturas();
    cargarClientes();
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

  const cargarClientes = async () => {
    try {
      const result = await window.api.clientes.getAll();
      if (result.success) {
        setClientes(result.data);
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
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
      await cargarFacturas();
      const result = await window.api.facturas.getById(data.id);
      if (result.success) {
        const pdf = await generarPDFFactura(result.data, emisor);
        const { guardarPDFEnDisco } = await import('../../utils/generarPDF');
        const pdfPath = await guardarPDFEnDisco(pdf, result.data.folio);
        await window.api.facturas.updatePDFPath({
          id: data.id,
          pdfPath: pdfPath
        });
        const { abrirPDFGuardado } = await import('../../utils/generarPDF');
        await abrirPDFGuardado(pdfPath);
      }
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
        if (factura.pdf_path) {
          const { abrirPDFGuardado } = await import('../../utils/generarPDF');
          await abrirPDFGuardado(factura.pdf_path);
        } else {
          const pdf = await generarPDFFactura(factura, emisor);
          const { guardarPDFEnDisco, abrirPDFGuardado } = await import('../../utils/generarPDF');
          const pdfPath = await guardarPDFEnDisco(pdf, factura.folio);
          await window.api.facturas.updatePDFPath({
            id: facturaId,
            pdfPath: pdfPath
          });
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

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFilterEstado('todos');
    setFilterFormaPago('todos');
    setFilterCliente('');
    setFilterFechaDesde('');
    setFilterFechaHasta('');
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
      vencida: { color: '#dc3545', bg: '#f8d7da', text: 'Vencida' },
      parcial: { color: '#17a2b8', bg: '#d1ecf1', text: 'Pago Parcial' }
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

  // Filtrado avanzado
  const filteredFacturas = facturas.filter(f => {
    // Filtro por término de búsqueda (folio o cliente)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchFolio = f.folio.toString().includes(term);
      const matchCliente = f.cliente_nombre?.toLowerCase().includes(term);
      const matchRut = f.cliente_rut?.toLowerCase().includes(term);
      if (!matchFolio && !matchCliente && !matchRut) return false;
    }

    // Filtro por estado
    if (filterEstado !== 'todos' && f.estado !== filterEstado) return false;

    // Filtro por forma de pago
    if (filterFormaPago !== 'todos' && f.forma_pago !== filterFormaPago) return false;

    // Filtro por cliente
    if (filterCliente && f.cliente_id.toString() !== filterCliente) return false;

    // Filtro por fecha desde
    if (filterFechaDesde && f.fecha < filterFechaDesde) return false;

    // Filtro por fecha hasta
    if (filterFechaHasta && f.fecha > filterFechaHasta) return false;

    return true;
  });

  // Estadísticas
  const stats = {
    total: filteredFacturas.length,
    pendiente: filteredFacturas.filter(f => f.estado === 'pendiente').length,
    pagada: filteredFacturas.filter(f => f.estado === 'pagada').length,
    parcial: filteredFacturas.filter(f => f.estado === 'parcial').length,
    vencida: filteredFacturas.filter(f => f.estado === 'vencida').length,
    montoTotal: filteredFacturas.reduce((sum, f) => sum + f.total, 0),
    contado: filteredFacturas.filter(f => f.forma_pago === 'contado').length,
    credito: filteredFacturas.filter(f => f.forma_pago === 'credito').length
  };

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
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>📄 Gestión de Facturas</h1>
              <p style={styles.subtitle}>Administra y analiza tus documentos tributarios electrónicos</p>
            </div>
            <button
              onClick={() => setView('form')}
              style={styles.newButton}
            >
              + Nueva Factura
            </button>
          </div>

          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📊</div>
              <div>
                <div style={styles.statLabel}>Total Facturas</div>
                <div style={styles.statValue}>{stats.total}</div>
                <div style={styles.statSubtext}>{formatPrice(stats.montoTotal)}</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #ffc107' }}>
              <div style={styles.statIcon}>⏳</div>
              <div>
                <div style={styles.statLabel}>Pendientes</div>
                <div style={styles.statValue}>{stats.pendiente}</div>
                <div style={styles.statSubtext}>Por cobrar</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #17a2b8' }}>
              <div style={styles.statIcon}>💰</div>
              <div>
                <div style={styles.statLabel}>Pago Parcial</div>
                <div style={styles.statValue}>{stats.parcial}</div>
                <div style={styles.statSubtext}>En proceso</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #28a745' }}>
              <div style={styles.statIcon}>✅</div>
              <div>
                <div style={styles.statLabel}>Pagadas</div>
                <div style={styles.statValue}>{stats.pagada}</div>
                <div style={styles.statSubtext}>Completadas</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderLeft: '4px solid #dc3545' }}>
              <div style={styles.statIcon}>⚠️</div>
              <div>
                <div style={styles.statLabel}>Vencidas</div>
                <div style={styles.statValue}>{stats.vencida}</div>
                <div style={styles.statSubtext}>Requieren atención</div>
              </div>
            </div>
          </div>

          {/* Búsqueda y Filtros Avanzados */}
          <div style={styles.filterSection}>
            <div style={styles.searchBar}>
              <input
                type="text"
                placeholder="🔍 Buscar por folio, cliente o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <button onClick={limpiarFiltros} style={styles.clearButton}>
                Limpiar Filtros
              </button>
            </div>

            <div style={styles.filtersGrid}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Estado:</label>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="parcial">Pago Parcial</option>
                  <option value="pagada">Pagada</option>
                  <option value="vencida">Vencida</option>
                  <option value="anulada">Anulada</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Forma de Pago:</label>
                <select
                  value={filterFormaPago}
                  onChange={(e) => setFilterFormaPago(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="todos">Todos</option>
                  <option value="contado">Contado</option>
                  <option value="credito">Crédito</option>
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Cliente:</label>
                <select
                  value={filterCliente}
                  onChange={(e) => setFilterCliente(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="">Todos los clientes</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.razon_social}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Desde:</label>
                <input
                  type="date"
                  value={filterFechaDesde}
                  onChange={(e) => setFilterFechaDesde(e.target.value)}
                  style={styles.filterSelect}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Hasta:</label>
                <input
                  type="date"
                  value={filterFechaHasta}
                  onChange={(e) => setFilterFechaHasta(e.target.value)}
                  style={styles.filterSelect}
                />
              </div>
            </div>

            <div style={styles.filterSummary}>
              Mostrando <strong>{filteredFacturas.length}</strong> de <strong>{facturas.length}</strong> facturas
              {stats.contado > 0 && ` • ${stats.contado} al contado`}
              {stats.credito > 0 && ` • ${stats.credito} a crédito`}
            </div>
          </div>

          {/* Tabla de facturas */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Folio</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Fecha Emisión</th>
                  <th style={styles.th}>Vencimiento</th>
                  <th style={styles.th}>Forma Pago</th>
                  <th style={styles.th}>Monto</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacturas.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={styles.emptyMessage}>
                      {isLoading ? 'Cargando facturas...' : 'No hay facturas que coincidan con los filtros seleccionados.'}
                    </td>
                  </tr>
                ) : (
                  filteredFacturas.map((factura) => (
                    <tr key={factura.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.folio}>#{factura.folio}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.clienteCell}>
                          <div style={styles.clienteNombre}>{factura.cliente_nombre}</div>
                          <div style={styles.clienteRut}>{formatearRut(factura.cliente_rut)}</div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        {new Date(factura.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                      </td>
                      <td style={styles.td}>
                        {factura.fecha_vencimiento ? (
                          <span style={factura.fecha_vencimiento < new Date().toISOString().split('T')[0] && factura.estado !== 'pagada' ? styles.vencido : {}}>
                            {new Date(factura.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-CL')}
                          </span>
                        ) : (
                          <span style={styles.textMuted}>-</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={factura.forma_pago === 'credito' ? styles.creditoBadge : styles.contadoBadge}>
                          {factura.forma_pago === 'credito' ? '💳 Crédito' : '💵 Contado'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <strong>{formatPrice(factura.total)}</strong>
                      </td>
                      <td style={styles.td}>
                        {getEstadoBadge(factura.estado)}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
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
                            <option value="parcial">Pago Parcial</option>
                            <option value="pagada">Pagada</option>
                            <option value="vencida">Vencida</option>
                            <option value="anulada">Anulada</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.totalBar}>
            <strong>Total filtrado: {formatPrice(stats.montoTotal)}</strong>
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
    boxShadow: '0 2px 4px rgba(0,123,255,0.3)',
    transition: 'all 0.2s'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
  statSubtext: {
    fontSize: '11px',
    color: '#6c757d',
    marginTop: '2px'
  },
  filterSection: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  searchBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #dee2e6',
    borderRadius: '6px',
    outline: 'none'
  },
  clearButton: {
    padding: '12px 20px',
    fontSize: '14px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#495057'
  },
  filterSelect: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    backgroundColor: 'white'
  },
  filterSummary: {
    fontSize: '13px',
    color: '#6c757d',
    paddingTop: '10px',
    borderTop: '1px solid #dee2e6'
  },
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '15px',
    border: '1px solid #dee2e6',
    borderRadius: '6px'
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
    fontSize: '13px',
    fontWeight: '600',
    color: '#495057',
    whiteSpace: 'nowrap'
  },
  tr: {
    borderBottom: '1px solid #dee2e6',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#212529'
  },
  folio: {
    fontWeight: '600',
    color: '#007bff',
    fontSize: '15px'
  },
  clienteCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  clienteNombre: {
    fontWeight: '500'
  },
  clienteRut: {
    fontSize: '12px',
    color: '#6c757d'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  creditoBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    backgroundColor: '#fff3cd',
    color: '#856404'
  },
  contadoBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  vencido: {
    color: '#dc3545',
    fontWeight: '600'
  },
  textMuted: {
    color: '#6c757d'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  actionBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  },
  estadoSelect: {
    padding: '6px 10px',
    fontSize: '12px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#495057'
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
