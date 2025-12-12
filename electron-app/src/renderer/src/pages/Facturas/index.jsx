import React, { useState } from 'react';

function Facturas() {
  const [view, setView] = useState('list');
  const [filterEstado, setFilterEstado] = useState('todos');

  // Mock data
  const facturas = [
    {
      id: 1,
      folio: 1001,
      cliente: 'Empresa Ejemplo SpA',
      fecha: '2025-12-10',
      total: 250000,
      estado: 'pagada'
    },
    {
      id: 2,
      folio: 1002,
      cliente: 'Comercial ABC Ltda',
      fecha: '2025-12-11',
      total: 180000,
      estado: 'pendiente'
    },
    {
      id: 3,
      folio: 1003,
      cliente: 'Distribuidora XYZ',
      fecha: '2025-12-12',
      total: 420000,
      estado: 'vencida'
    }
  ];

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

  return (
    <div style={styles.container}>
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

      {view === 'list' ? (
        <>
          {/* Cards de resumen */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📊</div>
              <div>
                <div style={styles.statLabel}>Total Facturas</div>
                <div style={styles.statValue}>{totales.todos}</div>
              </div>
            </div>
            <div style={{...styles.statCard, borderLeft: '4px solid #ffc107'}}>
              <div style={styles.statIcon}>⏳</div>
              <div>
                <div style={styles.statLabel}>Pendientes</div>
                <div style={styles.statValue}>{totales.pendiente}</div>
              </div>
            </div>
            <div style={{...styles.statCard, borderLeft: '4px solid #28a745'}}>
              <div style={styles.statIcon}>✅</div>
              <div>
                <div style={styles.statLabel}>Pagadas</div>
                <div style={styles.statValue}>{totales.pagada}</div>
              </div>
            </div>
            <div style={{...styles.statCard, borderLeft: '4px solid #dc3545'}}>
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
                        <span style={styles.folio}>{factura.folio}</span>
                      </td>
                      <td style={styles.td}>{factura.cliente}</td>
                      <td style={styles.td}>
                        {new Date(factura.fecha).toLocaleDateString('es-CL')}
                      </td>
                      <td style={styles.td}>
                        <strong>{formatPrice(factura.total)}</strong>
                      </td>
                      <td style={styles.td}>
                        {getEstadoBadge(factura.estado)}
                      </td>
                      <td style={styles.td}>
                        <button style={styles.actionBtn} title="Ver">👁️</button>
                        <button style={styles.actionBtn} title="Descargar PDF">📥</button>
                        <button style={styles.actionBtn} title="Enviar Email">📧</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.totalBar}>
            <strong>Total visualizado: {formatPrice(filteredFacturas.reduce((sum, f) => sum + f.total, 0))}</strong>
          </div>
        </>
      ) : (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Nueva Factura</h2>
          <p style={styles.formSubtitle}>
            El formulario de facturación se implementará con selección de cliente,
            productos, cálculo automático de IVA y generación de XML DTE.
          </p>
          <button
            onClick={() => setView('list')}
            style={styles.backButton}
          >
            ← Volver al listado
          </button>
        </div>
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
    borderColor: '#007bff'
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
  }
};

export default Facturas;
