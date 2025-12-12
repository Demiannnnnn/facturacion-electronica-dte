import React, { useState } from 'react';

function Reportes() {
  const [periodo, setPeriodo] = useState('mes');
  const [tipoReporte, setTipoReporte] = useState('ventas');

  // Mock data
  const stats = {
    ventasMes: 2450000,
    facturasMes: 18,
    clientesActivos: 12,
    productosMasVendidos: 5
  };

  const reportes = [
    {
      id: 1,
      nombre: 'Ventas por Período',
      descripcion: 'Reporte de ventas totales, IVA y neto',
      icon: '💰'
    },
    {
      id: 2,
      nombre: 'Facturas Emitidas',
      descripcion: 'Listado de facturas con estados',
      icon: '📄'
    },
    {
      id: 3,
      nombre: 'Clientes',
      descripcion: 'Análisis de clientes y compras',
      icon: '👥'
    },
    {
      id: 4,
      nombre: 'Productos',
      descripcion: 'Inventario y productos más vendidos',
      icon: '📦'
    },
    {
      id: 5,
      nombre: 'Pagos y Cobranzas',
      descripcion: 'Estado de pagos pendientes y realizados',
      icon: '💵'
    },
    {
      id: 6,
      nombre: 'Resumen Tributario',
      descripcion: 'Información para declaración de impuestos',
      icon: '📊'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handleGenerarReporte = (reporte) => {
    alert(`Generando reporte: ${reporte.nombre}\n\nEsta funcionalidad se implementará con:\n- Exportación a PDF\n- Exportación a Excel\n- Visualización de gráficos`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📈 Reportes e Informes</h1>
        <p style={styles.subtitle}>Analiza tus datos de negocio</p>
      </div>

      {/* Resumen rápido */}
      <div style={styles.quickStats}>
        <div style={styles.quickStatCard}>
          <div style={styles.quickStatIcon}>💰</div>
          <div>
            <div style={styles.quickStatLabel}>Ventas del Mes</div>
            <div style={styles.quickStatValue}>{formatPrice(stats.ventasMes)}</div>
          </div>
        </div>
        <div style={styles.quickStatCard}>
          <div style={styles.quickStatIcon}>📄</div>
          <div>
            <div style={styles.quickStatLabel}>Facturas Emitidas</div>
            <div style={styles.quickStatValue}>{stats.facturasMes}</div>
          </div>
        </div>
        <div style={styles.quickStatCard}>
          <div style={styles.quickStatIcon}>👥</div>
          <div>
            <div style={styles.quickStatLabel}>Clientes Activos</div>
            <div style={styles.quickStatValue}>{stats.clientesActivos}</div>
          </div>
        </div>
        <div style={styles.quickStatCard}>
          <div style={styles.quickStatIcon}>📦</div>
          <div>
            <div style={styles.quickStatLabel}>Productos Top</div>
            <div style={styles.quickStatValue}>{stats.productosMasVendidos}</div>
          </div>
        </div>
      </div>

      {/* Selector de período */}
      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Período:</label>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            style={styles.select}
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
            <option value="trimestre">Este Trimestre</option>
            <option value="anio">Este Año</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>
      </div>

      {/* Grid de reportes */}
      <div style={styles.reportesGrid}>
        {reportes.map((reporte) => (
          <div key={reporte.id} style={styles.reportCard}>
            <div style={styles.reportIcon}>{reporte.icon}</div>
            <h3 style={styles.reportTitle}>{reporte.nombre}</h3>
            <p style={styles.reportDescription}>{reporte.descripcion}</p>
            <div style={styles.reportActions}>
              <button
                onClick={() => handleGenerarReporte(reporte)}
                style={styles.reportButton}
              >
                Generar
              </button>
              <div style={styles.reportExportButtons}>
                <button style={styles.exportBtn} title="Exportar a PDF">📑</button>
                <button style={styles.exportBtn} title="Exportar a Excel">📊</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico placeholder */}
      <div style={styles.chartSection}>
        <h2 style={styles.chartTitle}>Ventas por Mes (2025)</h2>
        <div style={styles.chartPlaceholder}>
          <div style={styles.chartBars}>
            <div style={{...styles.bar, height: '60%'}}>
              <span style={styles.barLabel}>Ene</span>
            </div>
            <div style={{...styles.bar, height: '75%'}}>
              <span style={styles.barLabel}>Feb</span>
            </div>
            <div style={{...styles.bar, height: '85%'}}>
              <span style={styles.barLabel}>Mar</span>
            </div>
            <div style={{...styles.bar, height: '70%'}}>
              <span style={styles.barLabel}>Abr</span>
            </div>
            <div style={{...styles.bar, height: '90%'}}>
              <span style={styles.barLabel}>May</span>
            </div>
            <div style={{...styles.bar, height: '95%'}}>
              <span style={styles.barLabel}>Jun</span>
            </div>
            <div style={{...styles.bar, height: '80%'}}>
              <span style={styles.barLabel}>Jul</span>
            </div>
            <div style={{...styles.bar, height: '88%'}}>
              <span style={styles.barLabel}>Ago</span>
            </div>
            <div style={{...styles.bar, height: '78%'}}>
              <span style={styles.barLabel}>Sep</span>
            </div>
            <div style={{...styles.bar, height: '92%'}}>
              <span style={styles.barLabel}>Oct</span>
            </div>
            <div style={{...styles.bar, height: '87%'}}>
              <span style={styles.barLabel}>Nov</span>
            </div>
            <div style={{...styles.bar, height: '100%', backgroundColor: '#007bff'}}>
              <span style={styles.barLabel}>Dic</span>
            </div>
          </div>
          <p style={styles.chartNote}>
            Gráfico de ejemplo - Se implementará con biblioteca de gráficos (Chart.js o similar)
          </p>
        </div>
      </div>
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
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  quickStatCard: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  quickStatIcon: {
    fontSize: '36px'
  },
  quickStatLabel: {
    fontSize: '12px',
    color: '#6c757d',
    marginBottom: '5px'
  },
  quickStatValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#212529'
  },
  controls: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  controlLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#495057'
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    backgroundColor: 'white'
  },
  reportesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  reportCard: {
    backgroundColor: 'white',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    padding: '25px',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  reportIcon: {
    fontSize: '48px',
    marginBottom: '15px'
  },
  reportTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#212529'
  },
  reportDescription: {
    fontSize: '13px',
    color: '#6c757d',
    marginBottom: '20px',
    minHeight: '40px'
  },
  reportActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  reportButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  reportExportButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  exportBtn: {
    padding: '8px 12px',
    fontSize: '18px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  chartSection: {
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  chartTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '25px',
    color: '#212529'
  },
  chartPlaceholder: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    border: '1px solid #dee2e6'
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '300px',
    gap: '10px',
    marginBottom: '20px'
  },
  bar: {
    flex: 1,
    backgroundColor: '#28a745',
    borderRadius: '4px 4px 0 0',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: '30px',
    transition: 'all 0.3s'
  },
  barLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
    paddingBottom: '8px'
  },
  chartNote: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#6c757d',
    fontStyle: 'italic'
  }
};

export default Reportes;
