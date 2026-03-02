import React, { useState, useEffect } from 'react';

function Documentos() {
  const [tipoDocumento, setTipoDocumento] = useState('todos'); // todos, 33, 39, 52, 56, 61
  const [documentos, setDocumentos] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: 'todos',
    busqueda: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const tiposDocumento = {
    33: { nombre: 'Factura Electrónica', icon: '📄', color: '#3b82f6' },
    39: { nombre: 'Boleta Electrónica', icon: '🧾', color: '#10b981' },
    52: { nombre: 'Guía de Despacho', icon: '📦', color: '#f59e0b' },
    56: { nombre: 'Nota de Débito', icon: '📈', color: '#8b5cf6' },
    61: { nombre: 'Nota de Crédito', icon: '📉', color: '#ef4444' }
  };

  useEffect(() => {
    cargarDocumentos();
  }, [tipoDocumento]);

  const cargarDocumentos = async () => {
    setIsLoading(true);
    try {
      // Aquí se integraría con el backend para cargar todos los documentos
      // Simulación de datos
      const docsSimulados = [
        {
          id: 1,
          tipo: 33,
          folio: 12345,
          fecha: '2026-02-28',
          cliente: 'Empresa ABC S.A.',
          rut: '76.123.456-7',
          total: 1250000,
          estado: 'emitida'
        },
        {
          id: 2,
          tipo: 39,
          folio: 678,
          fecha: '2026-02-28',
          cliente: 'Sin RUT',
          rut: '-',
          total: 25000,
          estado: 'emitida'
        },
        {
          id: 3,
          tipo: 52,
          folio: 9012,
          fecha: '2026-02-27',
          cliente: 'Comercial del Sur',
          rut: '88.987.654-3',
          total: 0,
          estado: 'emitida'
        },
        {
          id: 4,
          tipo: 61,
          folio: 101,
          fecha: '2026-02-26',
          cliente: 'Empresa XYZ Ltda.',
          rut: '77.555.888-9',
          total: -150000,
          estado: 'emitida'
        },
        {
          id: 5,
          tipo: 56,
          folio: 202,
          fecha: '2026-02-25',
          cliente: 'Distribuidora Norte',
          rut: '79.333.222-1',
          total: 50000,
          estado: 'emitida'
        }
      ];

      setDocumentos(docsSimulados);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    }
    setIsLoading(false);
  };

  const documentosFiltrados = documentos.filter(doc => {
    let cumple = true;

    // Filtrar por tipo
    if (tipoDocumento !== 'todos') {
      cumple = cumple && doc.tipo === parseInt(tipoDocumento);
    }

    // Filtro por fecha desde
    if (filtros.fechaDesde) {
      cumple = cumple && doc.fecha >= filtros.fechaDesde;
    }

    // Filtro por fecha hasta
    if (filtros.fechaHasta) {
      cumple = cumple && doc.fecha <= filtros.fechaHasta;
    }

    // Filtro por estado
    if (filtros.estado !== 'todos') {
      cumple = cumple && doc.estado === filtros.estado;
    }

    // Búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      cumple = cumple && (
        doc.folio.toString().includes(busqueda) ||
        doc.cliente.toLowerCase().includes(busqueda) ||
        doc.rut.toLowerCase().includes(busqueda)
      );
    }

    return cumple;
  });

  // Calcular estadísticas
  const stats = {
    total: documentosFiltrados.length,
    facturas: documentosFiltrados.filter(d => d.tipo === 33).length,
    boletas: documentosFiltrados.filter(d => d.tipo === 39).length,
    guias: documentosFiltrados.filter(d => d.tipo === 52).length,
    notasCredito: documentosFiltrados.filter(d => d.tipo === 61).length,
    notasDebito: documentosFiltrados.filter(d => d.tipo === 56).length,
    montoTotal: documentosFiltrados.reduce((sum, d) => sum + d.total, 0)
  };

  const getTipoDocumentoInfo = (tipo) => {
    return tiposDocumento[tipo] || { nombre: 'Desconocido', icon: '📄', color: '#6b7280' };
  };

  const handleVerDetalle = (doc) => {
    alert(`Ver detalle de ${getTipoDocumentoInfo(doc.tipo).nombre} #${doc.folio}`);
  };

  const handleDescargarPDF = (doc) => {
    alert(`Descargar PDF de ${getTipoDocumentoInfo(doc.tipo).nombre} #${doc.folio}`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Documentos Tributarios</h1>
          <p style={styles.subtitle}>Vista consolidada de todos tus documentos electrónicos</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.exportButton}>
            📥 Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <div style={styles.statLabel}>Total Documentos</div>
            <div style={styles.statValue}>{stats.total}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📄</div>
          <div>
            <div style={styles.statLabel}>Facturas</div>
            <div style={styles.statValue}>{stats.facturas}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🧾</div>
          <div>
            <div style={styles.statLabel}>Boletas</div>
            <div style={styles.statValue}>{stats.boletas}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <div style={styles.statLabel}>Monto Total</div>
            <div style={styles.statValue}>
              ${stats.montoTotal.toLocaleString('es-CL')}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros por tipo */}
      <div style={styles.tipoFilters}>
        <button
          onClick={() => setTipoDocumento('todos')}
          style={{
            ...styles.tipoFilter,
            ...(tipoDocumento === 'todos' ? styles.tipoFilterActive : {})
          }}
        >
          Todos ({stats.total})
        </button>
        {Object.entries(tiposDocumento).map(([tipo, info]) => {
          const count = documentosFiltrados.filter(d => d.tipo === parseInt(tipo)).length;
          return (
            <button
              key={tipo}
              onClick={() => setTipoDocumento(tipo)}
              style={{
                ...styles.tipoFilter,
                ...(tipoDocumento === tipo ? styles.tipoFilterActive : {}),
                borderColor: info.color
              }}
            >
              {info.icon} {info.nombre} ({count})
            </button>
          );
        })}
      </div>

      {/* Filtros adicionales */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Buscar por folio, cliente o RUT..."
          value={filtros.busqueda}
          onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
          style={styles.searchInput}
        />

        <input
          type="date"
          value={filtros.fechaDesde}
          onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
          style={styles.dateInput}
          placeholder="Desde"
        />

        <input
          type="date"
          value={filtros.fechaHasta}
          onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
          style={styles.dateInput}
          placeholder="Hasta"
        />

        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          style={styles.select}
        >
          <option value="todos">Todos los estados</option>
          <option value="emitida">Emitida</option>
          <option value="anulada">Anulada</option>
          <option value="rechazada">Rechazada</option>
        </select>

        <button
          onClick={() => setFiltros({
            fechaDesde: '',
            fechaHasta: '',
            estado: 'todos',
            busqueda: ''
          })}
          style={styles.clearButton}
        >
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div style={styles.loading}>Cargando documentos...</div>
      ) : documentosFiltrados.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📄</div>
          <h3>No hay documentos</h3>
          <p>Ajusta los filtros para ver más resultados</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Folio</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Cliente/Receptor</th>
                <th style={styles.th}>RUT</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documentosFiltrados.map(doc => {
                const tipoInfo = getTipoDocumentoInfo(doc.tipo);
                return (
                  <tr key={doc.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.tipoBadge}>
                        <span style={styles.tipoIcon}>{tipoInfo.icon}</span>
                        <div style={styles.tipoInfo}>
                          <div style={styles.tipoNombre}>{tipoInfo.nombre}</div>
                          <div style={styles.tipoNumero}>DTE {doc.tipo}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.folio, color: tipoInfo.color }}>
                        #{doc.folio}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(doc.fecha).toLocaleDateString('es-CL')}
                    </td>
                    <td style={styles.td}>{doc.cliente}</td>
                    <td style={styles.td}>{doc.rut}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.total,
                        color: doc.total < 0 ? '#dc2626' : '#059669'
                      }}>
                        {doc.total !== 0 ? `$${Math.abs(doc.total).toLocaleString('es-CL')}` : '-'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        ...(doc.estado === 'emitida' ? styles.badgeEmitida : styles.badgeAnulada)
                      }}>
                        {doc.estado === 'emitida' ? '✅ Emitida' : '❌ Anulada'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleVerDetalle(doc)}
                          style={styles.actionButton}
                          title="Ver detalle"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleDescargarPDF(doc)}
                          style={styles.actionButton}
                          title="Descargar PDF"
                        >
                          📄
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  exportButton: {
    padding: '12px 24px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statIcon: {
    fontSize: '36px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937'
  },
  tipoFilters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  tipoFilter: {
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tipoFilterActive: {
    backgroundColor: '#f0fdfa',
    borderColor: '#0f766e',
    color: '#0f766e'
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
  dateInput: {
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
  tipoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tipoIcon: {
    fontSize: '24px'
  },
  tipoInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  tipoNombre: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1f2937'
  },
  tipoNumero: {
    fontSize: '11px',
    color: '#9ca3af'
  },
  folio: {
    fontWeight: '700',
    fontSize: '15px'
  },
  total: {
    fontWeight: '700',
    fontSize: '15px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeEmitida: {
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
  }
};

export default Documentos;
