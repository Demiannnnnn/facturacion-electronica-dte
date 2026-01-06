import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ContadorDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    empresasActivas: 0,
    documentosEmitidos: 0,
    ingresosMes: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // TODO: Implementar llamadas al backend del contador
      // Por ahora, datos de ejemplo
      setStats({
        totalEmpresas: 12,
        empresasActivas: 10,
        documentosEmitidos: 156,
        ingresosMes: 2500000
      });

      setRecentActivity([
        { id: 1, empresa: 'Empresa ABC S.A.', tipo: 'Factura', numero: 123, fecha: '2026-01-06', monto: 150000 },
        { id: 2, empresa: 'Comercial XYZ Ltda.', tipo: 'Boleta', numero: 456, fecha: '2026-01-05', monto: 75000 },
        { id: 3, empresa: 'Servicios DEF', tipo: 'Factura', numero: 124, fecha: '2026-01-04', monto: 200000 }
      ]);

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando dashboard del contador...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard del Contador</h1>
        <p style={styles.subtitle}>Resumen general de empresas y documentos</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statCardBlue }}>
          <div style={styles.statIcon}>🏢</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Total Empresas</div>
            <div style={styles.statValue}>{stats.totalEmpresas}</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardGreen }}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Empresas Activas</div>
            <div style={styles.statValue}>{stats.empresasActivas}</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardPurple }}>
          <div style={styles.statIcon}>📄</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Documentos Este Mes</div>
            <div style={styles.statValue}>{stats.documentosEmitidos}</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardOrange }}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Ingresos del Mes</div>
            <div style={styles.statValue}>{formatCurrency(stats.ingresosMes)}</div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Acciones Rápidas</h2>
        <div style={styles.actionsGrid}>
          <button 
            style={styles.actionButton}
            onClick={() => navigate('/contador/empresas')}
          >
            <span style={styles.actionIcon}>➕</span>
            <span>Nueva Empresa</span>
          </button>
          <button 
            style={styles.actionButton}
            onClick={() => navigate('/contador/documentos')}
          >
            <span style={styles.actionIcon}>📄</span>
            <span>Ver Documentos</span>
          </button>
          <button 
            style={styles.actionButton}
            onClick={() => navigate('/contador/reportes')}
          >
            <span style={styles.actionIcon}>📊</span>
            <span>Generar Reporte</span>
          </button>
          <button 
            style={styles.actionButton}
            onClick={() => navigate('/contador/configuracion')}
          >
            <span style={styles.actionIcon}>⚙️</span>
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Actividad Reciente</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Empresa</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Número</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>{item.empresa}</td>
                    <td style={styles.td}>
                      <span style={styles.badge}>{item.tipo}</span>
                    </td>
                    <td style={styles.td}>#{item.numero}</td>
                    <td style={styles.td}>{item.fecha}</td>
                    <td style={styles.td}>{formatCurrency(item.monto)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.emptyState}>
                    No hay actividad reciente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nota informativa */}
      <div style={styles.infoBox}>
        <div style={styles.infoIcon}>ℹ️</div>
        <div>
          <strong>Dashboard del Contador</strong>
          <p style={styles.infoText}>
            Este dashboard está diseñado específicamente para contadores que gestionan múltiples empresas.
            Aquí puedes ver un resumen consolidado de todas tus empresas clientes y su actividad.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #1e3a8a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default'
  },
  statCardBlue: {
    borderLeft: '4px solid #1e3a8a'
  },
  statCardGreen: {
    borderLeft: '4px solid #10b981'
  },
  statCardPurple: {
    borderLeft: '4px solid #8b5cf6'
  },
  statCardOrange: {
    borderLeft: '4px solid #f59e0b'
  },
  statIcon: {
    fontSize: '36px'
  },
  statContent: {
    flex: 1
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '20px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s'
  },
  actionIcon: {
    fontSize: '20px'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#374151'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#e0e7ff',
    color: '#1e3a8a',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#9ca3af',
    fontSize: '14px'
  },
  infoBox: {
    display: 'flex',
    gap: '16px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px'
  },
  infoIcon: {
    fontSize: '24px'
  },
  infoText: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#1e40af',
    lineHeight: '1.5'
  }
};

export default ContadorDashboard;
