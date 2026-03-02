import React, { useState, useEffect } from 'react';

function Boletas() {
  const [boletas, setBoletas] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: 'todas',
    busqueda: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    cargarBoletas();
  }, []);

  const cargarBoletas = async () => {
    setIsLoading(true);
    try {
      // Aquí se integraría con el backend
      // const result = await window.api.boletas.getAll();
      
      // Datos simulados
      setBoletas([
        {
          id: 1,
          folio: 12345,
          fecha: '2026-02-28',
          total: 25000,
          estado: 'emitida',
          conRut: true,
          rutCliente: '12345678-9',
          nombreCliente: 'Juan Pérez'
        },
        {
          id: 2,
          folio: 12346,
          fecha: '2026-02-28',
          total: 15000,
          estado: 'emitida',
          conRut: false
        },
        {
          id: 3,
          folio: 12347,
          fecha: '2026-02-27',
          total: 48000,
          estado: 'anulada',
          conRut: true,
          rutCliente: '98765432-1',
          nombreCliente: 'María González'
        }
      ]);
    } catch (error) {
      console.error('Error cargando boletas:', error);
    }
    setIsLoading(false);
  };

  const boletasFiltradas = boletas.filter(boleta => {
    let cumple = true;

    if (filtros.fechaDesde) {
      cumple = cumple && boleta.fecha >= filtros.fechaDesde;
    }

    if (filtros.fechaHasta) {
      cumple = cumple && boleta.fecha <= filtros.fechaHasta;
    }

    if (filtros.estado !== 'todas') {
      cumple = cumple && boleta.estado === filtros.estado;
    }

    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      cumple = cumple && (
        boleta.folio.toString().includes(busqueda) ||
        boleta.rutCliente?.toLowerCase().includes(busqueda) ||
        boleta.nombreCliente?.toLowerCase().includes(busqueda)
      );
    }

    return cumple;
  });

  const handleVerDetalle = (boletaId) => {
    alert(`Ver detalle de boleta #${boletaId}`);
  };

  const handleAnular = (boletaId) => {
    if (confirm('¿Está seguro de anular esta boleta?')) {
      alert(`Anular boleta #${boletaId}`);
    }
  };

  const handleEnviarEmail = (boletaId) => {
    alert(`Enviar boleta #${boletaId} por email`);
  };

  const totalBoletas = boletasFiltradas.length;
  const totalMonto = boletasFiltradas
    .filter(b => b.estado === 'emitida')
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🧾 Boletas Electrónicas</h1>
          <p style={styles.subtitle}>Gestiona tus boletas electrónicas tipo 39</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.reportButton}>
            📊 Libro de Boletas
          </button>
          <button
            onClick={() => window.location.href = '#/pos'}
            style={styles.newButton}
          >
            + Nueva Boleta (POS)
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📝</div>
          <div>
            <div style={styles.statLabel}>Total Boletas</div>
            <div style={styles.statValue}>{totalBoletas}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <div style={styles.statLabel}>Monto Total</div>
            <div style={styles.statValue}>
              ${totalMonto.toLocaleString('es-CL')}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <div style={styles.statLabel}>Emitidas</div>
            <div style={styles.statValueGreen}>
              {boletasFiltradas.filter(b => b.estado === 'emitida').length}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>❌</div>
          <div>
            <div style={styles.statLabel}>Anuladas</div>
            <div style={styles.statValueRed}>
              {boletasFiltradas.filter(b => b.estado === 'anulada').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Buscar por folio, RUT o cliente..."
          value={filtros.busqueda}
          onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
          style={styles.searchInput}
        />

        <input
          type="date"
          value={filtros.fechaDesde}
          onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
          style={styles.dateInput}
        />

        <input
          type="date"
          value={filtros.fechaHasta}
          onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
          style={styles.dateInput}
        />

        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          style={styles.select}
        >
          <option value="todas">Todos los estados</option>
          <option value="emitida">Emitida</option>
          <option value="anulada">Anulada</option>
        </select>

        <button
          onClick={() => setFiltros({
            fechaDesde: '',
            fechaHasta: '',
            estado: 'todas',
            busqueda: ''
          })}
          style={styles.clearButton}
        >
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div style={styles.loading}>Cargando boletas...</div>
      ) : boletasFiltradas.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🧾</div>
          <h3>No hay boletas</h3>
          <p>Emite boletas desde el Punto de Venta</p>
          <button
            onClick={() => window.location.href = '#/pos'}
            style={styles.emptyButton}
          >
            Ir a POS
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
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {boletasFiltradas.map(boleta => (
                <tr key={boleta.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.folio}>#{boleta.folio}</span>
                  </td>
                  <td style={styles.td}>
                    {new Date(boleta.fecha).toLocaleDateString('es-CL')}
                  </td>
                  <td style={styles.td}>
                    {boleta.conRut ? (
                      <span style={styles.clienteNombre}>
                        {boleta.nombreCliente || 'Cliente'}
                      </span>
                    ) : (
                      <span style={styles.clienteAnonimo}>Sin RUT</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {boleta.rutCliente || '-'}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.total}>
                      ${boleta.total.toLocaleString('es-CL')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(boleta.estado === 'emitida' ? styles.badgeEmitida : styles.badgeAnulada)
                    }}>
                      {boleta.estado === 'emitida' ? '✅ Emitida' : '❌ Anulada'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleVerDetalle(boleta.id)}
                        style={styles.actionButton}
                        title="Ver detalle"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEnviarEmail(boleta.id)}
                        style={styles.actionButton}
                        title="Enviar por email"
                      >
                        📧
                      </button>
                      {boleta.estado === 'emitida' && (
                        <button
                          onClick={() => handleAnular(boleta.id)}
                          style={{ ...styles.actionButton, ...styles.deleteButton }}
                          title="Anular"
                        >
                          ❌
                        </button>
                      )}
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
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  reportButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#4b5563',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  newButton: {
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
  statValueGreen: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#10b981'
  },
  statValueRed: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ef4444'
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
  clienteNombre: {
    fontWeight: '600'
  },
  clienteAnonimo: {
    fontStyle: 'italic',
    color: '#9ca3af'
  },
  total: {
    fontWeight: '700',
    color: '#059669'
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
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5'
  }
};

export default Boletas;
