import React, { useState, useEffect } from 'react';
import FormularioGuia from '../../components/guias/FormularioGuia';
import { generarPDFGuia } from '../../utils/generarPDFGuia';
import { formatearRut } from '../../utils/validaciones';

function Guias() {
  const [view, setView] = useState('list');
  const [guias, setGuias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emisor, setEmisor] = useState(null);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterCliente, setFilterCliente] = useState('');
  const [filterFechaDesde, setFilterFechaDesde] = useState('');
  const [filterFechaHasta, setFilterFechaHasta] = useState('');

  useEffect(() => {
    cargarGuias();
    cargarClientes();
    cargarEmisor();
  }, []);

  const cargarGuias = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.guias.getAll();
      if (result.success) {
        setGuias(result.data);
      }
    } catch (error) {
      console.error('Error cargando guías:', error);
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

  const handleGuiaCreada = async (data) => {
    try {
      await cargarGuias();
      const result = await window.api.guias.getById(data.id);
      if (result.success) {
        const pdf = await generarPDFGuia(result.data, emisor);
        const { guardarPDFEnDisco } = await import('../../utils/generarPDFGuia');
        const pdfPath = await guardarPDFEnDisco(pdf, result.data.folio);
        await window.api.guias.updatePDFPath({
          id: data.id,
          pdfPath: pdfPath
        });
        const { abrirPDFGuardado } = await import('../../utils/generarPDFGuia');
        await abrirPDFGuardado(pdfPath);
      }
      setView('list');
    } catch (error) {
      console.error('Error en handleGuiaCreada:', error);
      alert('Error al procesar la guía. Por favor intente nuevamente.');
    }
  };

  const handleVerPDF = async (guiaId) => {
    try {
      const result = await window.api.guias.getById(guiaId);
      if (result.success) {
        const guia = result.data;
        if (guia.pdf_path) {
          const { abrirPDFGuardado } = await import('../../utils/generarPDFGuia');
          await abrirPDFGuardado(guia.pdf_path);
        } else {
          const pdf = await generarPDFGuia(guia, emisor);
          const { guardarPDFEnDisco, abrirPDFGuardado } = await import('../../utils/generarPDFGuia');
          const pdfPath = await guardarPDFEnDisco(pdf, guia.folio);
          await window.api.guias.updatePDFPath({
            id: guiaId,
            pdfPath: pdfPath
          });
          await abrirPDFGuardado(pdfPath);
        }
      }
    } catch (error) {
      console.error('Error al ver PDF:', error);
      alert('Error al abrir el PDF');
    }
  };

  const handleEliminar = async (guiaId) => {
    if (!confirm('¿Está seguro de eliminar esta guía de despacho?')) return;

    try {
      const result = await window.api.guias.delete(guiaId);
      if (result.success) {
        alert('Guía eliminada correctamente');
        cargarGuias();
      } else {
        alert('Error al eliminar guía: ' + result.message);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar guía');
    }
  };

  // Filtrar guías (asegura que guias sea array)
  const guiasFiltradas = (Array.isArray(guias) ? guias : []).filter(guia => {
    let cumpleFiltros = true;

    // Búsqueda por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      cumpleFiltros = cumpleFiltros && (
        guia.folio?.toString().includes(search) ||
        guia.cliente_nombre?.toLowerCase().includes(search) ||
        guia.cliente_rut?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (filterEstado !== 'todos') {
      cumpleFiltros = cumpleFiltros && guia.estado === filterEstado;
    }

    // Filtro por cliente
    if (filterCliente) {
      cumpleFiltros = cumpleFiltros && guia.cliente_id?.toString() === filterCliente;
    }

    // Filtro por fecha desde
    if (filterFechaDesde) {
      cumpleFiltros = cumpleFiltros && guia.fecha >= filterFechaDesde;
    }

    // Filtro por fecha hasta
    if (filterFechaHasta) {
      cumpleFiltros = cumpleFiltros && guia.fecha <= filterFechaHasta;
    }

    return cumpleFiltros;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value || 0);
  };

  if (view === 'create') {
    return (
      <FormularioGuia
        onGuardar={handleGuiaCreada}
        onCancelar={() => setView('list')}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📦 Guías de Despacho</h1>
          <p style={styles.subtitle}>Gestiona tus guías de despacho tipo 52</p>
        </div>
        <button
          onClick={() => setView('create')}
          style={styles.createButton}
        >
          + Nueva Guía
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Buscar por folio, cliente o RUT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          style={styles.select}
        >
          <option value="todos">Todos los estados</option>
          <option value="emitida">Emitida</option>
          <option value="entregada">Entregada</option>
          <option value="anulada">Anulada</option>
        </select>

        <select
          value={filterCliente}
          onChange={(e) => setFilterCliente(e.target.value)}
          style={styles.select}
        >
          <option value="">Todos los clientes</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filterFechaDesde}
          onChange={(e) => setFilterFechaDesde(e.target.value)}
          placeholder="Desde"
          style={styles.dateInput}
        />

        <input
          type="date"
          value={filterFechaHasta}
          onChange={(e) => setFilterFechaHasta(e.target.value)}
          placeholder="Hasta"
          style={styles.dateInput}
        />

        <button
          onClick={() => {
            setSearchTerm('');
            setFilterEstado('todos');
            setFilterCliente('');
            setFilterFechaDesde('');
            setFilterFechaHasta('');
          }}
          style={styles.clearButton}
        >
          Limpiar
        </button>
      </div>

      {/* Resultados */}
      <div style={styles.results}>
        <span style={styles.resultCount}>
          {guiasFiltradas.length} guía{guiasFiltradas.length !== 1 ? 's' : ''} encontrada{guiasFiltradas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div style={styles.loading}>Cargando guías...</div>
      ) : guiasFiltradas.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📦</div>
          <h3>No hay guías de despacho</h3>
          <p>Crea tu primera guía de despacho</p>
          <button onClick={() => setView('create')} style={styles.emptyButton}>
            + Nueva Guía
          </button>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Folio</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>RUT</th>
                <th style={styles.th}>Dirección Despacho</th>
                <th style={styles.th}>Fecha Despacho</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {guiasFiltradas.map(guia => (
                <tr key={guia.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.folio}>#{guia.folio}</span>
                  </td>
                  <td style={styles.td}>
                    {new Date(guia.fecha).toLocaleDateString('es-CL')}
                  </td>
                  <td style={styles.td}>{guia.cliente_nombre}</td>
                  <td style={styles.td}>{formatearRut(guia.cliente_rut)}</td>
                  <td style={styles.td}>
                    <div style={styles.direccion}>{guia.direccion_despacho}</div>
                  </td>
                  <td style={styles.td}>
                    {guia.fecha_despacho ? new Date(guia.fecha_despacho).toLocaleDateString('es-CL') : '-'}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...styles[`badge${guia.estado.charAt(0).toUpperCase() + guia.estado.slice(1)}`]
                    }}>
                      {guia.estado === 'emitida' ? '📝 Emitida' :
                        guia.estado === 'entregada' ? '✅ Entregada' :
                          guia.estado === 'anulada' ? '❌ Anulada' : guia.estado}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleVerPDF(guia.id)}
                        style={styles.actionButton}
                        title="Ver PDF"
                      >
                        📄
                      </button>
                      <button
                        onClick={() => handleEliminar(guia.id)}
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px'
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
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: '1',
    minWidth: '250px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px'
  },
  select: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  dateInput: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px'
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  results: {
    marginBottom: '16px',
    fontSize: '14px',
    color: '#6b7280'
  },
  resultCount: {
    fontWeight: '600'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280',
    fontSize: '16px'
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '16px',
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
    padding: '16px',
    fontSize: '14px',
    color: '#1f2937'
  },
  folio: {
    fontWeight: '700',
    color: '#0f766e'
  },
  direccion: {
    maxWidth: '200px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeEmitida: {
    backgroundColor: '#dbeafe',
    color: '#1e40af'
  },
  badgeEntregada: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  badgeAnulada: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5'
  }
};

export default Guias;
