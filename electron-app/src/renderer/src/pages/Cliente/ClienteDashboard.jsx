import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ClienteDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalFacturas: 0,
    facturasPendientes: 0,
    productosStock: 0,
    ventasHoy: 0,
    clientesActivos: 0
  });
  const [loading, setLoading] = useState(true);
  const [ventasSemanales, setVentasSemanales] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [facturasRecientes, setFacturasRecientes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas generales
      const facturasResult = await window.api.facturas.getAll();
      const productosResult = await window.api.productos.getAll();
      const clientesResult = await window.api.clientes.getAll();

      if (facturasResult.success && productosResult.success && clientesResult.success) {
        const facturas = facturasResult.data;
        const productos = productosResult.data;
        const clientes = clientesResult.data;

        // Calcular estadísticas
        const totalVentas = facturas.reduce((sum, f) => sum + (f.total || 0), 0);
        const facturasPendientes = facturas.filter(f => f.estado === 'pendiente').length;
        const productosStock = productos.reduce((sum, p) => sum + (p.stock || 0), 0);

        // Ventas de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const ventasHoy = facturas
          .filter(f => f.fecha === hoy)
          .reduce((sum, f) => sum + (f.total || 0), 0);

        setStats({
          totalVentas,
          totalFacturas: facturas.length,
          facturasPendientes,
          productosStock,
          ventasHoy,
          clientesActivos: clientes.length
        });

        // Calcular ventas de los últimos 7 días
        calcularVentasSemanales(facturas);

        // Top 5 productos más vendidos
        await calcularTopProductos(facturas);

        // Últimas 5 facturas
        setFacturasRecientes(facturas.slice(0, 5));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      setLoading(false);
    }
  };

  const calcularVentasSemanales = (facturas) => {
    const hoy = new Date();
    const ultimos7Dias = [];

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const ventasDia = facturas
        .filter(f => f.fecha === fechaStr)
        .reduce((sum, f) => sum + (f.total || 0), 0);

      ultimos7Dias.push({
        fecha: fechaStr,
        dia: fecha.toLocaleDateString('es-CL', { weekday: 'short' }),
        ventas: ventasDia
      });
    }

    setVentasSemanales(ultimos7Dias);
  };

  const calcularTopProductos = async (facturas) => {
    try {
      const productosVendidos = {};

      for (const factura of facturas) {
        if (factura.detalles && Array.isArray(factura.detalles)) {
          for (const detalle of factura.detalles) {
            if (!productosVendidos[detalle.producto_id]) {
              productosVendidos[detalle.producto_id] = {
                cantidad: 0,
                total: 0,
                nombre: detalle.nombre || 'Producto'
              };
            }
            productosVendidos[detalle.producto_id].cantidad += detalle.cantidad || 0;
            productosVendidos[detalle.producto_id].total += detalle.subtotal || 0;
          }
        }
      }

      const topProductosArray = Object.entries(productosVendidos)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      setTopProductos(topProductosArray);
    } catch (error) {
      console.error('Error calculando top productos:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(value);
  };

  // Datos para gráfico de ventas semanales
  const ventasSemanalesChart = {
    labels: ventasSemanales.map(v => v.dia),
    datasets: [{
      label: 'Ventas',
      data: ventasSemanales.map(v => v.ventas),
      borderColor: '#0f766e',
      backgroundColor: 'rgba(15, 118, 110, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  // Datos para gráfico de productos
  const topProductosChart = {
    labels: topProductos.map(p => p.nombre),
    datasets: [{
      label: 'Cantidad Vendida',
      data: topProductos.map(p => p.cantidad),
      backgroundColor: [
        '#0f766e',
        '#14b8a6',
        '#2dd4bf',
        '#5eead4',
        '#99f6e4'
      ]
    }]
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Bienvenido, {user?.username}</p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderTop: '4px solid #0f766e' }}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Total Ventas</div>
            <div style={styles.statValue}>{formatCurrency(stats.totalVentas)}</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderTop: '4px solid #14b8a6' }}>
          <div style={styles.statIcon}>📄</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Total Facturas</div>
            <div style={styles.statValue}>{stats.totalFacturas}</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderTop: '4px solid #f59e0b' }}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Pendientes</div>
            <div style={styles.statValue}>{stats.facturasPendientes}</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderTop: '4px solid #8b5cf6' }}>
          <div style={styles.statIcon}>📦</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Stock Total</div>
            <div style={styles.statValue}>{stats.productosStock}</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderTop: '4px solid #10b981' }}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Ventas Hoy</div>
            <div style={styles.statValue}>{formatCurrency(stats.ventasHoy)}</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderTop: '4px solid #3b82f6' }}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>Clientes Activos</div>
            <div style={styles.statValue}>{stats.clientesActivos}</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Ventas de los Últimos 7 Días</h3>
          <div style={styles.chartContainer}>
            {ventasSemanales.length > 0 ? (
              <Line 
                data={ventasSemanalesChart} 
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            ) : (
              <div style={styles.emptyChart}>No hay datos de ventas</div>
            )}
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Top 5 Productos Más Vendidos</h3>
          <div style={styles.chartContainer}>
            {topProductos.length > 0 ? (
              <Bar 
                data={topProductosChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            ) : (
              <div style={styles.emptyChart}>No hay productos vendidos</div>
            )}
          </div>
        </div>
      </div>

      {/* Facturas recientes */}
      <div style={styles.recentSection}>
        <h3 style={styles.sectionTitle}>Facturas Recientes</h3>
        {facturasRecientes.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Número</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {facturasRecientes.map((factura) => (
                  <tr key={factura.id} style={styles.tr}>
                    <td style={styles.td}>#{factura.numero || factura.id}</td>
                    <td style={styles.td}>{factura.cliente_nombre || 'N/A'}</td>
                    <td style={styles.td}>{factura.fecha}</td>
                    <td style={styles.td}>{formatCurrency(factura.total)}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: factura.estado === 'pagada' ? '#d1fae5' : '#fef3c7',
                        color: factura.estado === 'pagada' ? '#065f46' : '#92400e'
                      }}>
                        {factura.estado || 'pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📄</div>
            <p>No hay facturas registradas aún</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '0',
    maxWidth: '100%'
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
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #0f766e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  statIcon: {
    fontSize: '32px'
  },
  statContent: {
    flex: 1
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
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '20px'
  },
  chartContainer: {
    position: 'relative',
    height: '250px'
  },
  emptyChart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9ca3af',
    fontSize: '14px'
  },
  recentSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '16px'
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
    color: '#6b7280'
  },
  tr: {
    borderBottom: '1px solid #f3f4f6'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#374151'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9ca3af'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  }
};

export default ClienteDashboard;
