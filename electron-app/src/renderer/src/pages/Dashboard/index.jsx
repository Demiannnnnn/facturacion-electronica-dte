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

function Dashboard() {
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
    const ultimos7Dias = [];
    const ventasPorDia = {};

    // Generar últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      ultimos7Dias.push(fechaStr);
      ventasPorDia[fechaStr] = 0;
    }

    // Sumar ventas por día
    facturas.forEach(f => {
      if (ventasPorDia.hasOwnProperty(f.fecha)) {
        ventasPorDia[f.fecha] += f.total || 0;
      }
    });

    const datos = ultimos7Dias.map(fecha => ({
      fecha: new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }),
      ventas: ventasPorDia[fecha]
    }));

    setVentasSemanales(datos);
  };

  const calcularTopProductos = async (facturas) => {
    const productoVentas = {};

    // Obtener items de cada factura
    for (const factura of facturas) {
      try {
        const result = await window.api.facturas.getById(factura.id);
        if (result.success && result.data.items) {
          result.data.items.forEach(item => {
            const nombre = item.descripcion;
            if (!productoVentas[nombre]) {
              productoVentas[nombre] = 0;
            }
            productoVentas[nombre] += item.cantidad || 0;
          });
        }
      } catch (error) {
        console.error('Error loading items for factura:', factura.id, error);
      }
    }

    const top = Object.entries(productoVentas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    setTopProductos(top);
  };

  // Configuración del gráfico de ventas semanales
  const ventasChartData = {
    labels: ventasSemanales.map(d => d.fecha),
    datasets: [
      {
        label: 'Ventas (CLP)',
        data: ventasSemanales.map(d => d.ventas),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const ventasChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context) => `Ventas: $${context.parsed.y.toLocaleString('es-CL')}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => `$${value.toLocaleString('es-CL')}`
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Configuración del gráfico de top productos
  const productosChartData = {
    labels: topProductos.map(p => p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: topProductos.map(p => p.cantidad),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(251, 146, 60)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 2
      }
    ]
  };

  const productosChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: (context) => `Vendidos: ${context.parsed.y} unidades`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Configuración del gráfico de estado de facturas
  const facturasEstadoData = {
    labels: ['Pendientes', 'Pagadas', 'Vencidas', 'Anuladas'],
    datasets: [
      {
        data: [
          stats.facturasPendientes,
          facturasRecientes.filter(f => f.estado === 'pagada').length,
          facturasRecientes.filter(f => f.estado === 'vencida').length,
          facturasRecientes.filter(f => f.estado === 'anulada').length
        ],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)'
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(107, 114, 128)'
        ],
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    }
  };

  const formatearMoneda = (valor) => {
    return `$${valor.toLocaleString('es-CL')}`;
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: { bg: '#fef3c7', color: '#92400e', text: 'Pendiente' },
      pagada: { bg: '#d1fae5', color: '#065f46', text: 'Pagada' },
      vencida: { bg: '#fee2e2', color: '#991b1b', text: 'Vencida' },
      anulada: { bg: '#f3f4f6', color: '#374151', text: 'Anulada' }
    };

    const estilo = estilos[estado] || estilos.pendiente;

    return (
      <span style={{
        backgroundColor: estilo.bg,
        color: estilo.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {estilo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          ¡Bienvenido, {user?.username}! 👋
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Aquí está el resumen de tu negocio
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Ventas */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>💰 Total Ventas</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{formatearMoneda(stats.totalVentas)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            {stats.totalFacturas} facturas emitidas
          </div>
        </div>

        {/* Ventas Hoy */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          boxShadow: '0 10px 25px rgba(240, 147, 251, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>📈 Ventas Hoy</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{formatearMoneda(stats.ventasHoy)}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            Actualizado en tiempo real
          </div>
        </div>

        {/* Facturas Pendientes */}
        <div style={{
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#7c2d12',
          boxShadow: '0 10px 25px rgba(252, 182, 159, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>⏳ Pendientes</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.facturasPendientes}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            Facturas por cobrar
          </div>
        </div>

        {/* Productos en Stock */}
        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: '#065f46',
          boxShadow: '0 10px 25px rgba(168, 237, 234, 0.3)',
          transition: 'transform 0.3s ease',
          cursor: 'pointer'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>📦 Stock Total</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.productosStock}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
            Unidades disponibles
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Ventas Semanales */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
            📊 Ventas Últimos 7 Días
          </h3>
          <div style={{ height: '300px' }}>
            <Line data={ventasChartData} options={ventasChartOptions} />
          </div>
        </div>

        {/* Top Productos */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
            🏆 Top 5 Productos Más Vendidos
          </h3>
          <div style={{ height: '300px' }}>
            {topProductos.length > 0 ? (
              <Bar data={productosChartData} options={productosChartOptions} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                No hay datos de productos vendidos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila inferior */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '20px'
      }}>
        {/* Estado de Facturas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
            📋 Estado de Facturas
          </h3>
          <div style={{ height: '300px' }}>
            <Doughnut data={facturasEstadoData} options={doughnutOptions} />
          </div>
        </div>

        {/* Facturas Recientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>
            🕒 Facturas Recientes
          </h3>
          <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
            {facturasRecientes.length > 0 ? (
              facturasRecientes.map((factura) => (
                <div key={factura.id} style={{
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      Folio #{factura.folio}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {factura.cliente_razon_social}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      {new Date(factura.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                      {formatearMoneda(factura.total)}
                    </div>
                    {getEstadoBadge(factura.estado)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                No hay facturas recientes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
