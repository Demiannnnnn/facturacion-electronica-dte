import React, { useState, useEffect } from 'react';

function Reportes() {
  const [periodo, setPeriodo] = useState('mes');
  const [tipoReporte, setTipoReporte] = useState('ventas');
  const [reporteVentas, setReporteVentas] = useState(null);
  const [reporteProductos, setReporteProductos] = useState(null);
  const [reporteFacturas, setReporteFacturas] = useState(null);
  const [reporteClientes, setReporteClientes] = useState(null);
  const [reportePagos, setReportePagos] = useState(null);
  const [reporteTributario, setReporteTributario] = useState(null);
  const [isLoadingReporte, setIsLoadingReporte] = useState(false);
  const [showReporte, setShowReporte] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [mesTributario, setMesTributario] = useState(new Date().getMonth() + 1);
  const [anioTributario, setAnioTributario] = useState(new Date().getFullYear());

  // Stats reales (cargados desde BD)
  const [stats, setStats] = useState({
    ventasMes: 0,
    facturasMes: 0,
    clientesActivos: 0,
    productosMasVendidos: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);

      // Obtener ventas del mes actual
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      const hoyStr = hoy.toISOString().split('T')[0];

      const ventasResult = await window.api.facturas.getReporteVentas({
        fecha_desde: primerDiaMes,
        fecha_hasta: hoyStr
      });

      // Obtener reporte de clientes
      const clientesResult = await window.api.clientes.getReporte();

      // Obtener reporte de productos
      const productosResult = await window.api.productos.getReporte();

      if (ventasResult.success && clientesResult.success && productosResult.success) {
        setStats({
          ventasMes: ventasResult.data.totales.total || 0,
          facturasMes: ventasResult.data.totales.cantidad_facturas || 0,
          clientesActivos: clientesResult.data.totales.total_clientes || 0,
          productosMasVendidos: productosResult.data.productosMasVendidos?.length || 0
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
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

  // Calcular rango de fechas según período
  const calcularRangoFechas = (periodoSeleccionado) => {
    const hoy = new Date();
    let desde, hasta;

    switch (periodoSeleccionado) {
      case 'hoy':
        desde = hasta = hoy.toISOString().split('T')[0];
        break;

      case 'semana':
        const primerDiaSemana = new Date(hoy);
        primerDiaSemana.setDate(hoy.getDate() - hoy.getDay());
        desde = primerDiaSemana.toISOString().split('T')[0];
        hasta = hoy.toISOString().split('T')[0];
        break;

      case 'mes':
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        hasta = hoy.toISOString().split('T')[0];
        break;

      case 'trimestre':
        const mesInicio = Math.floor(hoy.getMonth() / 3) * 3;
        desde = new Date(hoy.getFullYear(), mesInicio, 1).toISOString().split('T')[0];
        hasta = hoy.toISOString().split('T')[0];
        break;

      case 'anio':
        desde = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
        hasta = hoy.toISOString().split('T')[0];
        break;

      case 'personalizado':
        desde = fechaDesde;
        hasta = fechaHasta;
        break;

      default:
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        hasta = hoy.toISOString().split('T')[0];
    }

    return { desde, hasta };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handleGenerarReporte = async (reporte) => {
    if (reporte.id === 1) {
      await generarReporteVentas();
    } else if (reporte.id === 2) {
      await generarReporteFacturas();
    } else if (reporte.id === 3) {
      await generarReporteClientes();
    } else if (reporte.id === 4) {
      await generarReporteProductos();
    } else if (reporte.id === 5) {
      await generarReportePagos();
    } else if (reporte.id === 6) {
      await generarReporteTributario();
    } else {
      alert(`Generando reporte: ${reporte.nombre}\n\nEsta funcionalidad se implementará próximamente`);
    }
  };

  const generarReporteVentas = async () => {
    try {
      setIsLoadingReporte(true);
      setTipoReporte('ventas');

      // Validar fechas si es período personalizado
      if (periodo === 'personalizado' && (!fechaDesde || !fechaHasta)) {
        alert('Por favor selecciona un rango de fechas');
        setIsLoadingReporte(false);
        return;
      }

      const { desde, hasta } = calcularRangoFechas(periodo);

      const result = await window.api.facturas.getReporteVentas({
        fecha_desde: desde,
        fecha_hasta: hasta
      });

      if (result.success) {
        setReporteVentas(result.data);
        setShowReporte(true);
      } else {
        alert('Error al generar el reporte: ' + result.error);
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      setIsLoadingReporte(false);
    }
  };

  const generarReporteProductos = async () => {
    try {
      setIsLoadingReporte(true);
      setTipoReporte('productos');

      const result = await window.api.productos.getReporte();

      if (result.success) {
        setReporteProductos(result.data);
        setShowReporte(true);
      } else {
        alert('Error al generar el reporte: ' + result.error);
      }
    } catch (error) {
      console.error('Error generando reporte productos:', error);
      alert('Error al generar el reporte de productos');
    } finally {
      setIsLoadingReporte(false);
    }
  };

  const generarReporteFacturas = async () => {
    try {
      setIsLoadingReporte(true);
      setTipoReporte('facturas');

      // Validar fechas si es período personalizado
      if (periodo === 'personalizado' && (!fechaDesde || !fechaHasta)) {
        alert('Por favor selecciona un rango de fechas');
        setIsLoadingReporte(false);
        return;
      }

      const { desde, hasta } = calcularRangoFechas(periodo);

      const result = await window.api.facturas.getReporteVentas({
        fecha_desde: desde,
        fecha_hasta: hasta
      });

      if (result.success) {
        setReporteFacturas(result.data);
        setShowReporte(true);
      } else {
        alert('Error al generar el reporte: ' + result.error);
      }
    } catch (error) {
      console.error('Error generando reporte facturas:', error);
      alert('Error al generar el reporte de facturas');
    } finally {
      setIsLoadingReporte(false);
    }
  };

  const generarReporteClientes = async () => {
    try {
      setIsLoadingReporte(true);
      setTipoReporte('clientes');

      const result = await window.api.clientes.getReporte();

      if (result.success) {
        setReporteClientes(result.data);
        setShowReporte(true);
      } else {
        alert('Error al generar el reporte: ' + result.error);
      }
    } catch (error) {
      console.error('Error generando reporte clientes:', error);
      alert('Error al generar el reporte de clientes');
    } finally {
      setIsLoadingReporte(false);
    }
  };

  const generarReportePagos = async () => {
    try {
      setIsLoadingReporte(true);
      setTipoReporte('pagos');

      const result = await window.api.facturas.getReportePagos();

      if (result.success) {
        setReportePagos(result.data);
        setShowReporte(true);
      } else {
        alert('Error al generar el reporte: ' + result.error);
      }
    } catch (error) {
      console.error('Error generando reporte pagos:', error);
      alert('Error al generar el reporte de pagos');
    } finally {
      setIsLoadingReporte(false);
    }
  };

  const generarReporteTributario = async () => {
    try {
      setIsLoadingReporte(true);
      setTipoReporte('tributario');

      const result = await window.api.facturas.getReporteTributario({
        mes: mesTributario,
        anio: anioTributario
      });

      if (result.success) {
        setReporteTributario(result.data);
        setShowReporte(true);
      } else {
        alert('Error al generar el reporte: ' + result.error);
      }
    } catch (error) {
      console.error('Error generando reporte tributario:', error);
      alert('Error al generar el reporte tributario');
    } finally {
      setIsLoadingReporte(false);
    }
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
            <div style={styles.quickStatValue}>
              {loadingStats ? 'Cargando...' : formatPrice(stats.ventasMes)}
            </div>
          </div>
        </div>
        <div style={styles.quickStatCard}>
          <div style={styles.quickStatIcon}>📄</div>
          <div>
            <div style={styles.quickStatLabel}>Facturas Emitidas</div>
            <div style={styles.quickStatValue}>
              {loadingStats ? 'Cargando...' : stats.facturasMes}
            </div>
          </div>
        </div>
        <div style={styles.quickStatCard}>
          <div style={styles.quickStatIcon}>👥</div>
          <div>
            <div style={styles.quickStatLabel}>Clientes Activos</div>
            <div style={styles.quickStatValue}>
              {loadingStats ? 'Cargando...' : stats.clientesActivos}
            </div>
          </div>
        </div>
        <div style={styles.quickStatCard}>
          <div style={styles.quickStatIcon}>📦</div>
          <div>
            <div style={styles.quickStatLabel}>Productos Top</div>
            <div style={styles.quickStatValue}>
              {loadingStats ? 'Cargando...' : stats.productosMasVendidos}
            </div>
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

        {periodo === 'personalizado' && (
          <>
            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>Desde:</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                style={styles.select}
              />
            </div>
            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>Hasta:</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                style={styles.select}
              />
            </div>
          </>
        )}
      </div>

      {/* Grid de reportes */}
      {!showReporte && (
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
                  disabled={isLoadingReporte}
                >
                  {isLoadingReporte && [1, 2, 3, 4, 5, 6].includes(reporte.id) ? 'Generando...' : 'Generar'}
                </button>
                <div style={styles.reportExportButtons}>
                  <button style={styles.exportBtn} title="Exportar a PDF">📑</button>
                  <button style={styles.exportBtn} title="Exportar a Excel">📊</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista de Reporte de Ventas */}
      {showReporte && reporteVentas && (
        <div style={styles.reporteView}>
          <div style={styles.reporteHeader}>
            <h2 style={styles.reporteTitle}>Reporte de Ventas por Período</h2>
            <button
              onClick={() => setShowReporte(false)}
              style={styles.backButton}
            >
              ← Volver a Reportes
            </button>
          </div>

          <div style={styles.reportePeriodo}>
            <strong>Período:</strong> {new Date(reporteVentas.fecha_desde).toLocaleDateString('es-CL')} - {new Date(reporteVentas.fecha_hasta).toLocaleDateString('es-CL')}
          </div>

          {/* Totales Principales */}
          <div style={styles.totalesGrid}>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Subtotal (Neto)</div>
              <div style={styles.totalValue}>{formatPrice(reporteVentas.totales.subtotal)}</div>
            </div>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>IVA (19%)</div>
              <div style={styles.totalValue}>{formatPrice(reporteVentas.totales.iva)}</div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #28a745' }}>
              <div style={styles.totalLabel}>Total</div>
              <div style={{ ...styles.totalValue, color: '#28a745', fontSize: '28px' }}>
                {formatPrice(reporteVentas.totales.total)}
              </div>
            </div>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Cantidad de Facturas</div>
              <div style={styles.totalValue}>{reporteVentas.totales.cantidad_facturas}</div>
            </div>
          </div>

          {/* Desglose por Estado */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Facturas por Estado</h3>
            <div style={styles.estadosGrid}>
              <div style={styles.estadoCard}>
                <div style={styles.estadoBadge}
                  className="pendiente">Pendientes</div>
                <div style={styles.estadoValue}>{reporteVentas.totales.por_estado.pendiente}</div>
              </div>
              <div style={styles.estadoCard}>
                <div style={styles.estadoBadge}
                  className="pagada">Pagadas</div>
                <div style={styles.estadoValue}>{reporteVentas.totales.por_estado.pagada}</div>
              </div>
              <div style={styles.estadoCard}>
                <div style={styles.estadoBadge}
                  className="vencida">Vencidas</div>
                <div style={styles.estadoValue}>{reporteVentas.totales.por_estado.vencida}</div>
              </div>
              <div style={styles.estadoCard}>
                <div style={styles.estadoBadge}
                  className="anulada">Anuladas</div>
                <div style={styles.estadoValue}>{reporteVentas.totales.por_estado.anulada}</div>
              </div>
            </div>
          </div>

          {/* Top Productos */}
          {reporteVentas.productosMasVendidos.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Productos Más Vendidos</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Producto</th>
                    <th style={styles.th}>Cantidad</th>
                    <th style={styles.th}>Monto Total</th>
                    <th style={styles.th}>Veces Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteVentas.productosMasVendidos.map((producto, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={styles.td}>{producto.descripcion}</td>
                      <td style={styles.td}>{producto.cantidad_total}</td>
                      <td style={styles.td}>{formatPrice(producto.monto_total)}</td>
                      <td style={styles.td}>{producto.veces_vendido}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Top Clientes */}
          {reporteVentas.topClientes.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Clientes con Más Compras</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>RUT</th>
                    <th style={styles.th}>Razón Social</th>
                    <th style={styles.th}>Facturas</th>
                    <th style={styles.th}>Total Comprado</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteVentas.topClientes.map((cliente, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={styles.td}>{cliente.rut}</td>
                      <td style={styles.td}>{cliente.razon_social}</td>
                      <td style={styles.td}>{cliente.cantidad_facturas}</td>
                      <td style={styles.td}><strong>{formatPrice(cliente.total_comprado)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detalle de Facturas */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Detalle de Facturas ({reporteVentas.facturas.length})</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Folio</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>Subtotal</th>
                  <th style={styles.th}>IVA</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reporteVentas.facturas.map((factura) => (
                  <tr key={factura.id} style={styles.tr}>
                    <td style={styles.td}>#{factura.folio}</td>
                    <td style={styles.td}>
                      {new Date(factura.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                    </td>
                    <td style={styles.td}>{factura.cliente_nombre}</td>
                    <td style={styles.td}>{formatPrice(factura.subtotal)}</td>
                    <td style={styles.td}>{formatPrice(factura.iva)}</td>
                    <td style={styles.td}><strong>{formatPrice(factura.total)}</strong></td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor:
                          factura.estado === 'pagada' ? '#d4edda' :
                            factura.estado === 'pendiente' ? '#fff3cd' :
                              factura.estado === 'vencida' ? '#f8d7da' : '#e2e3e5',
                        color:
                          factura.estado === 'pagada' ? '#28a745' :
                            factura.estado === 'pendiente' ? '#ffc107' :
                              factura.estado === 'vencida' ? '#dc3545' : '#6c757d'
                      }}>
                        {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista de Reporte de Productos */}
      {showReporte && reporteProductos && tipoReporte === 'productos' && (
        <div style={styles.reporteView}>
          <div style={styles.reporteHeader}>
            <h2 style={styles.reporteTitle}>Reporte de Productos e Inventario</h2>
            <button
              onClick={() => setShowReporte(false)}
              style={styles.backButton}
            >
              ← Volver a Reportes
            </button>
          </div>

          {/* Totales Principales */}
          <div style={styles.totalesGrid}>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Total Productos</div>
              <div style={styles.totalValue}>{reporteProductos.totales.total_productos}</div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #28a745' }}>
              <div style={styles.totalLabel}>Valor Inventario</div>
              <div style={{ ...styles.totalValue, color: '#28a745' }}>
                {formatPrice(reporteProductos.totales.valor_inventario)}
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #ffc107' }}>
              <div style={styles.totalLabel}>Productos Bajo Stock</div>
              <div style={{ ...styles.totalValue, color: '#ffc107' }}>
                {reporteProductos.totales.productos_bajo_stock}
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #dc3545' }}>
              <div style={styles.totalLabel}>Sin Stock</div>
              <div style={{ ...styles.totalValue, color: '#dc3545' }}>
                {reporteProductos.totales.productos_sin_stock}
              </div>
            </div>
          </div>

          {/* Productos Más Vendidos */}
          {reporteProductos.productosMasVendidos.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏆 Productos Más Vendidos</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Código</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Stock Actual</th>
                    <th style={styles.th}>Cantidad Vendida</th>
                    <th style={styles.th}>Monto Vendido</th>
                    <th style={styles.th}>Veces Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteProductos.productosMasVendidos.map((producto) => (
                    <tr key={producto.id} style={styles.tr}>
                      <td style={styles.td}>{producto.codigo || 'N/A'}</td>
                      <td style={styles.td}><strong>{producto.nombre}</strong></td>
                      <td style={styles.td}>{producto.stock}</td>
                      <td style={styles.td}>{producto.cantidad_vendida}</td>
                      <td style={styles.td}>{formatPrice(producto.monto_vendido)}</td>
                      <td style={styles.td}>{producto.veces_vendido}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Productos con Mayor Valor en Inventario */}
          {reporteProductos.productosPorValor.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💰 Productos con Mayor Valor en Inventario</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Código</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Precio Unitario</th>
                    <th style={styles.th}>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteProductos.productosPorValor.map((producto) => (
                    <tr key={producto.id} style={styles.tr}>
                      <td style={styles.td}>{producto.codigo || 'N/A'}</td>
                      <td style={styles.td}><strong>{producto.nombre}</strong></td>
                      <td style={styles.td}>{producto.stock}</td>
                      <td style={styles.td}>{formatPrice(producto.precio)}</td>
                      <td style={styles.td}>
                        <strong>{formatPrice(producto.precio * producto.stock)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Productos Bajo Stock - ALERTA */}
          {reporteProductos.productosBajoStock.length > 0 && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: '#ffc107' }}>
                ⚠️ Productos con Bajo Stock (menos de 10 unidades)
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Código</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Stock Actual</th>
                    <th style={styles.th}>Precio</th>
                    <th style={styles.th}>Cantidad Vendida</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteProductos.productosBajoStock.map((producto) => (
                    <tr key={producto.id} style={{ ...styles.tr, backgroundColor: '#fff3cd' }}>
                      <td style={styles.td}>{producto.codigo || 'N/A'}</td>
                      <td style={styles.td}><strong>{producto.nombre}</strong></td>
                      <td style={styles.td}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#ffc107',
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          {producto.stock}
                        </span>
                      </td>
                      <td style={styles.td}>{formatPrice(producto.precio)}</td>
                      <td style={styles.td}>{producto.cantidad_vendida}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Productos Sin Stock - CRÍTICO */}
          {reporteProductos.productosSinStock.length > 0 && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: '#dc3545' }}>
                🚨 Productos Sin Stock
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Código</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Precio</th>
                    <th style={styles.th}>Cantidad Vendida</th>
                    <th style={styles.th}>Demanda</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteProductos.productosSinStock.map((producto) => (
                    <tr key={producto.id} style={{ ...styles.tr, backgroundColor: '#f8d7da' }}>
                      <td style={styles.td}>{producto.codigo || 'N/A'}</td>
                      <td style={styles.td}><strong>{producto.nombre}</strong></td>
                      <td style={styles.td}>{formatPrice(producto.precio)}</td>
                      <td style={styles.td}>{producto.cantidad_vendida}</td>
                      <td style={styles.td}>
                        {producto.cantidad_vendida > 0 ? (
                          <span style={{ color: '#dc3545', fontWeight: '600' }}>Alta demanda</span>
                        ) : (
                          <span style={{ color: '#6c757d' }}>Sin movimiento</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Productos Sin Movimiento */}
          {reporteProductos.productosSinMovimiento.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📦 Productos Sin Movimiento</h3>
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
                Estos productos tienen stock pero nunca se han vendido. Considera promociones o descuentos.
              </p>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Código</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Precio</th>
                    <th style={styles.th}>Valor Inventario</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteProductos.productosSinMovimiento.slice(0, 20).map((producto) => (
                    <tr key={producto.id} style={styles.tr}>
                      <td style={styles.td}>{producto.codigo || 'N/A'}</td>
                      <td style={styles.td}>{producto.nombre}</td>
                      <td style={styles.td}>{producto.stock}</td>
                      <td style={styles.td}>{formatPrice(producto.precio)}</td>
                      <td style={styles.td}>{formatPrice(producto.precio * producto.stock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reporteProductos.productosSinMovimiento.length > 20 && (
                <p style={{ textAlign: 'center', marginTop: '10px', color: '#6c757d', fontSize: '13px' }}>
                  Mostrando 20 de {reporteProductos.productosSinMovimiento.length} productos sin movimiento
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Vista de Reporte de Facturas Emitidas */}
      {showReporte && reporteFacturas && tipoReporte === 'facturas' && (
        <div style={styles.reporteView}>
          <div style={styles.reporteHeader}>
            <h2 style={styles.reporteTitle}>Reporte de Facturas Emitidas</h2>
            <button
              onClick={() => setShowReporte(false)}
              style={styles.backButton}
            >
              ← Volver a Reportes
            </button>
          </div>

          <div style={styles.reportePeriodo}>
            <strong>Período:</strong> {new Date(reporteFacturas.fecha_desde).toLocaleDateString('es-CL')} - {new Date(reporteFacturas.fecha_hasta).toLocaleDateString('es-CL')}
          </div>

          {/* Totales Principales */}
          <div style={styles.totalesGrid}>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Total Facturas</div>
              <div style={styles.totalValue}>{reporteFacturas.totales.cantidad_facturas}</div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #28a745' }}>
              <div style={styles.totalLabel}>Total Facturado</div>
              <div style={{ ...styles.totalValue, color: '#28a745' }}>
                {formatPrice(reporteFacturas.totales.total)}
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #ffc107' }}>
              <div style={styles.totalLabel}>Pendiente de Pago</div>
              <div style={{ ...styles.totalValue, color: '#ffc107' }}>
                {formatPrice(reporteFacturas.facturas
                  .filter(f => f.estado === 'pendiente')
                  .reduce((sum, f) => sum + f.total, 0)
                )}
              </div>
            </div>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Subtotal (Neto)</div>
              <div style={styles.totalValue}>{formatPrice(reporteFacturas.totales.subtotal)}</div>
            </div>
          </div>

          {/* Facturas por Estado */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Distribución por Estado</h3>
            <div style={styles.estadosGrid}>
              <div style={styles.estadoCard}>
                <div style={{ ...styles.estadoBadge, backgroundColor: '#fff3cd', color: '#856404' }}>
                  Pendientes
                </div>
                <div style={styles.estadoValue}>{reporteFacturas.totales.por_estado.pendiente}</div>
              </div>
              <div style={styles.estadoCard}>
                <div style={{ ...styles.estadoBadge, backgroundColor: '#d4edda', color: '#155724' }}>
                  Pagadas
                </div>
                <div style={styles.estadoValue}>{reporteFacturas.totales.por_estado.pagada}</div>
              </div>
              <div style={styles.estadoCard}>
                <div style={{ ...styles.estadoBadge, backgroundColor: '#f8d7da', color: '#721c24' }}>
                  Vencidas
                </div>
                <div style={styles.estadoValue}>{reporteFacturas.totales.por_estado.vencida}</div>
              </div>
              <div style={styles.estadoCard}>
                <div style={{ ...styles.estadoBadge, backgroundColor: '#e2e3e5', color: '#383d41' }}>
                  Anuladas
                </div>
                <div style={styles.estadoValue}>{reporteFacturas.totales.por_estado.anulada}</div>
              </div>
            </div>
          </div>

          {/* Listado de Facturas */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Detalle de Facturas ({reporteFacturas.facturas.length})</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Folio</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Cliente</th>
                  <th style={styles.th}>RUT</th>
                  <th style={styles.th}>Subtotal</th>
                  <th style={styles.th}>IVA</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reporteFacturas.facturas.map((factura) => (
                  <tr key={factura.id} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>#{factura.folio}</strong>
                    </td>
                    <td style={styles.td}>
                      {new Date(factura.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                    </td>
                    <td style={styles.td}>{factura.cliente_nombre}</td>
                    <td style={styles.td}>{factura.cliente_rut}</td>
                    <td style={styles.td}>{formatPrice(factura.subtotal)}</td>
                    <td style={styles.td}>{formatPrice(factura.iva)}</td>
                    <td style={styles.td}><strong>{formatPrice(factura.total)}</strong></td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor:
                          factura.estado === 'pagada' ? '#d4edda' :
                            factura.estado === 'pendiente' ? '#fff3cd' :
                              factura.estado === 'vencida' ? '#f8d7da' : '#e2e3e5',
                        color:
                          factura.estado === 'pagada' ? '#28a745' :
                            factura.estado === 'pendiente' ? '#ffc107' :
                              factura.estado === 'vencida' ? '#dc3545' : '#6c757d'
                      }}>
                        {factura.estado.charAt(0).toUpperCase() + factura.estado.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista de Reporte de Clientes */}
      {showReporte && reporteClientes && tipoReporte === 'clientes' && (
        <div style={styles.reporteView}>
          <div style={styles.reporteHeader}>
            <h2 style={styles.reporteTitle}>Reporte de Clientes</h2>
            <button
              onClick={() => setShowReporte(false)}
              style={styles.backButton}
            >
              ← Volver a Reportes
            </button>
          </div>

          {/* Totales Principales */}
          <div style={styles.totalesGrid}>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Total Clientes</div>
              <div style={styles.totalValue}>{reporteClientes.totales.total_clientes}</div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #28a745' }}>
              <div style={styles.totalLabel}>Clientes Activos</div>
              <div style={{ ...styles.totalValue, color: '#28a745' }}>
                {reporteClientes.totales.clientes_activos}
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #007bff' }}>
              <div style={styles.totalLabel}>Total Facturado</div>
              <div style={{ ...styles.totalValue, color: '#007bff' }}>
                {formatPrice(reporteClientes.totales.total_facturado)}
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #ffc107' }}>
              <div style={styles.totalLabel}>Promedio por Cliente</div>
              <div style={{ ...styles.totalValue, color: '#ffc107' }}>
                {formatPrice(reporteClientes.totales.promedio_compra)}
              </div>
            </div>
          </div>

          {/* Top Clientes */}
          {reporteClientes.topClientes.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>🏆 Top 10 Clientes por Monto Comprado</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>RUT</th>
                    <th style={styles.th}>Razón Social</th>
                    <th style={styles.th}>Total Facturas</th>
                    <th style={styles.th}>Total Comprado</th>
                    <th style={styles.th}>Última Compra</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteClientes.topClientes.map((cliente, idx) => (
                    <tr key={cliente.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong style={{
                          color: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#333'
                        }}>
                          {idx + 1}
                        </strong>
                      </td>
                      <td style={styles.td}>{cliente.rut}</td>
                      <td style={styles.td}><strong>{cliente.razon_social}</strong></td>
                      <td style={styles.td}>{cliente.total_facturas}</td>
                      <td style={styles.td}>
                        <strong style={{ color: '#28a745' }}>{formatPrice(cliente.total_comprado)}</strong>
                      </td>
                      <td style={styles.td}>
                        {cliente.ultima_compra ? new Date(cliente.ultima_compra).toLocaleDateString('es-CL') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Clientes con Facturas Pendientes */}
          {reporteClientes.clientesPendientes.length > 0 && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: '#ffc107' }}>
                ⚠️ Clientes con Pagos Pendientes
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>RUT</th>
                    <th style={styles.th}>Razón Social</th>
                    <th style={styles.th}>Total Facturas</th>
                    <th style={styles.th}>Monto Pendiente</th>
                    <th style={styles.th}>Total Pagado</th>
                    <th style={styles.th}>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteClientes.clientesPendientes.map((cliente) => (
                    <tr key={cliente.id} style={{ ...styles.tr, backgroundColor: '#fff3cd' }}>
                      <td style={styles.td}>{cliente.rut}</td>
                      <td style={styles.td}><strong>{cliente.razon_social}</strong></td>
                      <td style={styles.td}>{cliente.total_facturas}</td>
                      <td style={styles.td}>
                        <strong style={{ color: '#ffc107' }}>{formatPrice(cliente.total_pendiente)}</strong>
                      </td>
                      <td style={styles.td}>{formatPrice(cliente.total_pagado)}</td>
                      <td style={styles.td}>
                        {cliente.telefono && <div>📞 {cliente.telefono}</div>}
                        {cliente.email && <div style={{ fontSize: '12px', color: '#666' }}>✉️ {cliente.email}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Clientes Sin Compras */}
          {reporteClientes.clientesSinCompras.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Clientes Sin Compras</h3>
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '15px' }}>
                Estos clientes están registrados pero nunca han realizado compras. Considera contactarlos.
              </p>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>RUT</th>
                    <th style={styles.th}>Razón Social</th>
                    <th style={styles.th}>Giro</th>
                    <th style={styles.th}>Comuna</th>
                    <th style={styles.th}>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteClientes.clientesSinCompras.slice(0, 20).map((cliente) => (
                    <tr key={cliente.id} style={styles.tr}>
                      <td style={styles.td}>{cliente.rut}</td>
                      <td style={styles.td}>{cliente.razon_social}</td>
                      <td style={styles.td}>{cliente.giro || '-'}</td>
                      <td style={styles.td}>{cliente.comuna || '-'}</td>
                      <td style={styles.td}>
                        {cliente.telefono && <div style={{ fontSize: '12px' }}>📞 {cliente.telefono}</div>}
                        {cliente.email && <div style={{ fontSize: '11px', color: '#666' }}>✉️ {cliente.email}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reporteClientes.clientesSinCompras.length > 20 && (
                <p style={{ textAlign: 'center', marginTop: '10px', color: '#6c757d', fontSize: '13px' }}>
                  Mostrando 20 de {reporteClientes.clientesSinCompras.length} clientes sin compras
                </p>
              )}
            </div>
          )}

          {/* Todos los Clientes */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Listado Completo de Clientes ({reporteClientes.clientes.length})</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>RUT</th>
                  <th style={styles.th}>Razón Social</th>
                  <th style={styles.th}>Facturas</th>
                  <th style={styles.th}>Total Comprado</th>
                  <th style={styles.th}>Pendiente</th>
                  <th style={styles.th}>Última Compra</th>
                </tr>
              </thead>
              <tbody>
                {reporteClientes.clientes.map((cliente) => (
                  <tr key={cliente.id} style={styles.tr}>
                    <td style={styles.td}>{cliente.rut}</td>
                    <td style={styles.td}><strong>{cliente.razon_social}</strong></td>
                    <td style={styles.td}>{cliente.total_facturas}</td>
                    <td style={styles.td}>
                      {cliente.total_comprado > 0 ? (
                        <strong>{formatPrice(cliente.total_comprado)}</strong>
                      ) : (
                        <span style={{ color: '#6c757d' }}>Sin compras</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {cliente.total_pendiente > 0 ? (
                        <span style={{ color: '#ffc107', fontWeight: '600' }}>
                          {formatPrice(cliente.total_pendiente)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td style={styles.td}>
                      {cliente.ultima_compra ? (
                        new Date(cliente.ultima_compra).toLocaleDateString('es-CL')
                      ) : (
                        <span style={{ color: '#6c757d' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista de Reporte de Pagos y Cobranzas */}
      {showReporte && reportePagos && tipoReporte === 'pagos' && (
        <div style={styles.reporteView}>
          <div style={styles.reporteHeader}>
            <h2 style={styles.reporteTitle}>Reporte de Pagos y Cobranzas</h2>
            <button
              onClick={() => setShowReporte(false)}
              style={styles.backButton}
            >
              ← Volver a Reportes
            </button>
          </div>

          {/* Resumen General */}
          <div style={styles.totalesGrid}>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #28a745' }}>
              <div style={styles.totalLabel}>Total Cobrado</div>
              <div style={{ ...styles.totalValue, color: '#28a745' }}>
                {formatPrice(reportePagos.totales.total_cobrado)}
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                {reportePagos.totales.cantidad_pagadas} facturas
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #ffc107' }}>
              <div style={styles.totalLabel}>Por Cobrar</div>
              <div style={{ ...styles.totalValue, color: '#ffc107' }}>
                {formatPrice(reportePagos.totales.total_por_cobrar)}
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                {reportePagos.totales.cantidad_pendientes} facturas
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #dc3545' }}>
              <div style={styles.totalLabel}>Facturas Vencidas</div>
              <div style={{ ...styles.totalValue, color: '#dc3545' }}>
                {formatPrice(reportePagos.totales.total_vencido)}
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                {reportePagos.totales.cantidad_vencidas} facturas
              </div>
            </div>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Total General</div>
              <div style={styles.totalValue}>
                {formatPrice(reportePagos.totales.total_cobrado + reportePagos.totales.total_por_cobrar)}
              </div>
            </div>
          </div>

          {/* Alertas de Vencimiento */}
          {(reportePagos.proximos7Dias.length > 0 || reportePagos.facturasVencidas.length > 0) && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: '#dc3545' }}>🚨 Alertas de Cobranza</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px', border: '1px solid #dc3545' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#721c24', marginBottom: '5px' }}>
                    Vencidas
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc3545' }}>
                    {reportePagos.facturasVencidas.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#721c24' }}>
                    {formatPrice(reportePagos.facturasVencidas.reduce((sum, f) => sum + f.total, 0))}
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#856404', marginBottom: '5px' }}>
                    Vencen en 7 días
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffc107' }}>
                    {reportePagos.proximos7Dias.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#856404' }}>
                    {formatPrice(reportePagos.proximos7Dias.reduce((sum, f) => sum + f.total, 0))}
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', border: '1px solid #17a2b8' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c5460', marginBottom: '5px' }}>
                    Vencen en 15 días
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#17a2b8' }}>
                    {reportePagos.proximos15Dias.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#0c5460' }}>
                    {formatPrice(reportePagos.proximos15Dias.reduce((sum, f) => sum + f.total, 0))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Deudores */}
          {reportePagos.topDeudores.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>💼 Clientes con Mayor Deuda</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>RUT</th>
                    <th style={styles.th}>Facturas Pendientes</th>
                    <th style={styles.th}>Facturas Vencidas</th>
                    <th style={styles.th}>Total Deuda</th>
                    <th style={styles.th}>Contacto</th>
                  </tr>
                </thead>
                <tbody>
                  {reportePagos.topDeudores.map((deudor) => (
                    <tr key={deudor.cliente_id} style={styles.tr}>
                      <td style={styles.td}><strong>{deudor.cliente_nombre}</strong></td>
                      <td style={styles.td}>{deudor.cliente_rut}</td>
                      <td style={styles.td}>{deudor.cantidad_facturas}</td>
                      <td style={styles.td}>
                        {deudor.facturas_vencidas > 0 && (
                          <span style={{ color: '#dc3545', fontWeight: '600' }}>
                            {deudor.facturas_vencidas}
                          </span>
                        )}
                        {deudor.facturas_vencidas === 0 && '-'}
                      </td>
                      <td style={styles.td}>
                        <strong style={{ color: '#dc3545' }}>{formatPrice(deudor.total_deuda)}</strong>
                      </td>
                      <td style={styles.td}>
                        {deudor.cliente_telefono && <div style={{ fontSize: '12px' }}>📞 {deudor.cliente_telefono}</div>}
                        {deudor.cliente_email && <div style={{ fontSize: '11px', color: '#666' }}>✉️ {deudor.cliente_email}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Facturas Vencidas */}
          {reportePagos.facturasVencidas.length > 0 && (
            <div style={styles.section}>
              <h3 style={{ ...styles.sectionTitle, color: '#dc3545' }}>
                ⏰ Facturas Vencidas ({reportePagos.facturasVencidas.length})
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Folio</th>
                    <th style={styles.th}>Fecha Emisión</th>
                    <th style={styles.th}>Vencimiento</th>
                    <th style={styles.th}>Días Vencido</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {reportePagos.facturasVencidas.map((factura) => {
                    const diasVencido = Math.floor((new Date() - new Date(factura.fecha_vencimiento)) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={factura.id} style={{ ...styles.tr, backgroundColor: '#f8d7da' }}>
                        <td style={styles.td}><strong>#{factura.folio}</strong></td>
                        <td style={styles.td}>
                          {new Date(factura.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                        </td>
                        <td style={styles.td}>
                          {factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-CL') : '-'}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}>
                            {diasVencido} días
                          </span>
                        </td>
                        <td style={styles.td}>{factura.cliente_nombre}</td>
                        <td style={styles.td}>
                          <strong style={{ color: '#dc3545' }}>{formatPrice(factura.total)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Facturas Pendientes */}
          {reportePagos.facturasPendientes.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                📋 Facturas Pendientes ({reportePagos.facturasPendientes.length})
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Folio</th>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>Vencimiento</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Monto</th>
                    <th style={styles.th}>Días Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {reportePagos.facturasPendientes.map((factura) => {
                    const diasRestantes = factura.fecha_vencimiento ?
                      Math.ceil((new Date(factura.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    return (
                      <tr key={factura.id} style={styles.tr}>
                        <td style={styles.td}><strong>#{factura.folio}</strong></td>
                        <td style={styles.td}>
                          {new Date(factura.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                        </td>
                        <td style={styles.td}>
                          {factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-CL') : '-'}
                        </td>
                        <td style={styles.td}>{factura.cliente_nombre}</td>
                        <td style={styles.td}><strong>{formatPrice(factura.total)}</strong></td>
                        <td style={styles.td}>
                          {diasRestantes !== null && (
                            <span style={{
                              color: diasRestantes <= 7 ? '#dc3545' : diasRestantes <= 15 ? '#ffc107' : '#28a745'
                            }}>
                              {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencida'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Proyección de Cobros */}
          {reportePagos.proyeccion.filter(p => p.monto_esperado > 0).length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📊 Proyección de Cobros (Próximos 90 días)</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Período</th>
                    <th style={styles.th}>Facturas a Vencer</th>
                    <th style={styles.th}>Monto Esperado</th>
                  </tr>
                </thead>
                <tbody>
                  {reportePagos.proyeccion
                    .filter(p => p.monto_esperado > 0)
                    .map((periodo, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>{periodo.periodo}</td>
                        <td style={styles.td}>{periodo.cantidad_facturas}</td>
                        <td style={styles.td}>
                          <strong style={{ color: '#007bff' }}>{formatPrice(periodo.monto_esperado)}</strong>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Vista de Reporte Tributario */}
      {showReporte && reporteTributario && tipoReporte === 'tributario' && (
        <div style={styles.reporteView}>
          <div style={styles.reporteHeader}>
            <h2 style={styles.reporteTitle}>Resumen Tributario</h2>
            <button
              onClick={() => setShowReporte(false)}
              style={styles.backButton}
            >
              ← Volver a Reportes
            </button>
          </div>

          <div style={styles.reportePeriodo}>
            <strong>Período:</strong> {reporteTributario.mes}/{reporteTributario.anio}
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <select
                value={mesTributario}
                onChange={(e) => setMesTributario(parseInt(e.target.value))}
                style={styles.select}
              >
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
              <input
                type="number"
                value={anioTributario}
                onChange={(e) => setAnioTributario(parseInt(e.target.value))}
                style={{ ...styles.select, width: '100px' }}
                min="2020"
                max="2030"
              />
              <button
                onClick={generarReporteTributario}
                style={{ ...styles.reportButton, padding: '8px 16px' }}
              >
                Actualizar
              </button>
            </div>
          </div>

          {/* Totales del Mes */}
          <div style={styles.totalesGrid}>
            <div style={styles.totalCard}>
              <div style={styles.totalLabel}>Documentos Emitidos</div>
              <div style={styles.totalValue}>{reporteTributario.totales.cantidad_documentos}</div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #007bff' }}>
              <div style={styles.totalLabel}>Ventas Netas (Código 100)</div>
              <div style={{ ...styles.totalValue, color: '#007bff' }}>
                {formatPrice(reporteTributario.totales.ventas_netas)}
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #28a745' }}>
              <div style={styles.totalLabel}>IVA Débito (Código 105)</div>
              <div style={{ ...styles.totalValue, color: '#28a745' }}>
                {formatPrice(reporteTributario.totales.total_iva)}
              </div>
            </div>
            <div style={{ ...styles.totalCard, borderLeft: '4px solid #ffc107' }}>
              <div style={styles.totalLabel}>Total Facturado</div>
              <div style={{ ...styles.totalValue, color: '#ffc107' }}>
                {formatPrice(reporteTributario.totales.total_facturado)}
              </div>
            </div>
          </div>

          {/* Información para F29 */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>📝 Información para Formulario 29 (SII)</h3>
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '5px' }}>
                    Código 100 - Ventas Netas
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>
                    {formatPrice(reporteTributario.formulario29.codigo_100)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '5px' }}>
                    Código 105 - IVA Débito Fiscal
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>
                    {formatPrice(reporteTributario.formulario29.codigo_105)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '5px' }}>
                    Código 110 - Ventas Exentas
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>
                    {formatPrice(reporteTributario.formulario29.codigo_110)}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#0c5460' }}>
                  💡 <strong>Nota:</strong> Estos valores corresponden únicamente a las ventas. Para completar el F29,
                  debes agregar manualmente la información de compras y créditos fiscales.
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Anual */}
          {reporteTributario.ventasPorMes.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📊 Resumen Anual {reporteTributario.anio}</h3>
              <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Total Documentos</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{reporteTributario.totalesAnuales.cantidad_documentos}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Ventas Netas</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{formatPrice(reporteTributario.totalesAnuales.ventas_netas)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>IVA Total</div>
                    <div style={{ fontSize: '18px', fontWeight: '600' }}>{formatPrice(reporteTributario.totalesAnuales.total_iva)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Total Facturado</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#28a745' }}>
                      {formatPrice(reporteTributario.totalesAnuales.total_facturado)}
                    </div>
                  </div>
                </div>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Mes</th>
                    <th style={styles.th}>Documentos</th>
                    <th style={styles.th}>Ventas Netas</th>
                    <th style={styles.th}>IVA</th>
                    <th style={styles.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteTributario.ventasPorMes.map((mes) => (
                    <tr key={mes.mes_num} style={{
                      ...styles.tr,
                      backgroundColor: parseInt(mes.mes_num) === reporteTributario.mes ? '#e7f3ff' : 'white'
                    }}>
                      <td style={styles.td}>
                        <strong>{mes.mes}</strong>
                        {parseInt(mes.mes_num) === reporteTributario.mes && (
                          <span style={{ marginLeft: '8px', fontSize: '11px', color: '#007bff' }}>← Actual</span>
                        )}
                      </td>
                      <td style={styles.td}>{mes.cantidad}</td>
                      <td style={styles.td}>{formatPrice(mes.neto)}</td>
                      <td style={styles.td}>{formatPrice(mes.iva)}</td>
                      <td style={styles.td}><strong>{formatPrice(mes.total)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Detalle Diario */}
          {reporteTributario.ventasPorDia.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📅 Detalle Diario del Mes</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Fecha</th>
                    <th style={styles.th}>Documentos</th>
                    <th style={styles.th}>Neto</th>
                    <th style={styles.th}>IVA</th>
                    <th style={styles.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteTributario.ventasPorDia.map((dia) => (
                    <tr key={dia.fecha} style={styles.tr}>
                      <td style={styles.td}>
                        {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short'
                        })}
                      </td>
                      <td style={styles.td}>{dia.cantidad}</td>
                      <td style={styles.td}>{formatPrice(dia.neto)}</td>
                      <td style={styles.td}>{formatPrice(dia.iva)}</td>
                      <td style={styles.td}><strong>{formatPrice(dia.total)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Gráfico placeholder */}
      <div style={styles.chartSection}>
        <h2 style={styles.chartTitle}>Ventas por Mes (2025)</h2>
        <div style={styles.chartPlaceholder}>
          <div style={styles.chartBars}>
            <div style={{ ...styles.bar, height: '60%' }}>
              <span style={styles.barLabel}>Ene</span>
            </div>
            <div style={{ ...styles.bar, height: '75%' }}>
              <span style={styles.barLabel}>Feb</span>
            </div>
            <div style={{ ...styles.bar, height: '85%' }}>
              <span style={styles.barLabel}>Mar</span>
            </div>
            <div style={{ ...styles.bar, height: '70%' }}>
              <span style={styles.barLabel}>Abr</span>
            </div>
            <div style={{ ...styles.bar, height: '90%' }}>
              <span style={styles.barLabel}>May</span>
            </div>
            <div style={{ ...styles.bar, height: '95%' }}>
              <span style={styles.barLabel}>Jun</span>
            </div>
            <div style={{ ...styles.bar, height: '80%' }}>
              <span style={styles.barLabel}>Jul</span>
            </div>
            <div style={{ ...styles.bar, height: '88%' }}>
              <span style={styles.barLabel}>Ago</span>
            </div>
            <div style={{ ...styles.bar, height: '78%' }}>
              <span style={styles.barLabel}>Sep</span>
            </div>
            <div style={{ ...styles.bar, height: '92%' }}>
              <span style={styles.barLabel}>Oct</span>
            </div>
            <div style={{ ...styles.bar, height: '87%' }}>
              <span style={styles.barLabel}>Nov</span>
            </div>
            <div style={{ ...styles.bar, height: '100%', backgroundColor: '#007bff' }}>
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
  },
  // Estilos para vista de reporte
  reporteView: {
    marginBottom: '40px'
  },
  reporteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #dee2e6'
  },
  reporteTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#212529'
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  reportePeriodo: {
    fontSize: '15px',
    color: '#495057',
    marginBottom: '25px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '4px solid #007bff'
  },
  totalesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  totalCard: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderLeft: '4px solid #007bff',
    borderRadius: '8px',
    padding: '20px'
  },
  totalLabel: {
    fontSize: '13px',
    color: '#6c757d',
    marginBottom: '8px'
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#212529'
  },
  section: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#212529'
  },
  estadosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px'
  },
  estadoCard: {
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    padding: '15px',
    textAlign: 'center'
  },
  estadoBadge: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '10px'
  },
  estadoValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#007bff'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontSize: '13px',
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
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  }
};

export default Reportes;
