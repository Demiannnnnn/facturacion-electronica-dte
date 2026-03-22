import React, { useState, useEffect, useRef } from 'react';
import ScannerInput from './components/ScannerInput';
import CarritoVenta from './components/CarritoVenta';
import TecladoNumerico from './components/TecladoNumerico';
import MetodosPago from './components/MetodosPago';
import ResumenVenta from './components/ResumenVenta';
import { useAuth } from '../../context/AuthContext';

function PuntoVenta() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [resumenVentasDia, setResumenVentasDia] = useState({ cantidad: 0, total: 0 });

  useEffect(() => {
    cargarProductos();
    cargarEstadoCaja();
    cargarVentasDelDia();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo_barra?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProductosFiltrados(filtrados.slice(0, 20));
    } else {
      setProductosFiltrados(productos.slice(0, 20));
    }
  }, [searchTerm, productos]);

  const cargarProductos = async () => {
    try {
      const result = await window.api.productos.getAll();
      if (result.success) {
        setProductos(result.data || []);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const cargarEstadoCaja = async () => {
    try {
      const result = await window.api.caja.getEstadoActual();
      if (result.success) {
        setCajaAbierta(Boolean(result.data?.abierta));
      }
    } catch (error) {
      console.error('Error verificando caja:', error);
    }
  };

  const cargarVentasDelDia = async () => {
    try {
      const result = await window.api.pos.getVentasDelDia();
      if (result.success) {
        setResumenVentasDia({
          cantidad: result.data?.cantidad || 0,
          total: result.data?.total || 0
        });
      }
    } catch (error) {
      console.error('Error cargando ventas del día:', error);
    }
  };

  const handleEscanear = (codigo) => {
    const producto = productos.find(p => 
      p.codigo_barra === codigo || 
      p.codigo === codigo
    );
    
    if (producto) {
      agregarAlCarrito(producto);
      setSearchTerm('');
    } else {
      alert('Producto no encontrado');
    }
  };

  const agregarAlCarrito = (producto) => {
    // Validar que el producto tenga precio
    if (!producto.precio || producto.precio <= 0) {
      alert('⚠️ Este producto no tiene un precio válido');
      return;
    }

    if ((producto.stock || 0) <= 0) {
      alert('⚠️ Este producto no tiene stock disponible');
      return;
    }

    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
      const stockDisponible = Number(producto.stock || 0);
      if (itemExistente.cantidad + 1 > stockDisponible) {
        alert('⚠️ No hay stock suficiente para agregar más unidades');
        return;
      }

      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio) || 0,
        cantidad: 1,
        codigo: producto.codigo,
        stockDisponible: Number(producto.stock || 0)
      }]);
    }
  };

  const modificarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
    } else {
      const item = carrito.find(i => i.id === productoId);
      if (item && cantidad > Number(item.stockDisponible || 0)) {
        alert('⚠️ La cantidad supera el stock disponible');
        return;
      }

      setCarrito(carrito.map(item =>
        item.id === productoId ? { ...item, cantidad } : item
      ));
    }
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
  };

  const calcularTotales = () => {
    const subtotal = carrito.reduce((sum, item) => {
      const precio = parseFloat(item.precio) || 0;
      const cantidad = parseInt(item.cantidad) || 0;
      return sum + (precio * cantidad);
    }, 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    return { 
      subtotal: Math.round(subtotal), 
      iva: Math.round(iva), 
      total: Math.round(total) 
    };
  };

  const handleProcederPago = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!cajaAbierta) {
      alert('Debes abrir la caja antes de cobrar una venta');
      window.location.hash = '/cliente/caja';
      return;
    }

    setMostrarPago(true);
  };

  const handleConfirmarVenta = async (datosPago) => {
    try {
      const result = await window.api.pos.createVenta({
        items: carrito,
        pago: datosPago,
        userId: user?.id || null
      });

      if (!result.success) {
        throw new Error(result.error || 'No se pudo registrar la venta');
      }

      const ventaPersistida = result.data?.venta;
      const ventaData = {
        id: ventaPersistida?.id,
        folio: ventaPersistida?.folio,
        items: carrito,
        totales: {
          subtotal: Number(ventaPersistida?.subtotal || 0),
          iva: Number(ventaPersistida?.iva || 0),
          total: Number(ventaPersistida?.total || 0)
        },
        pago: datosPago,
        fecha: ventaPersistida?.fecha || new Date().toISOString()
      };
      
      setVentaCompletada(ventaData);
      setMostrarPago(false);
      setMostrarResumen(true);
      await Promise.all([cargarProductos(), cargarVentasDelDia()]);
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert(error.message || 'Error al procesar la venta');
    }
  };

  const handleNuevaVenta = () => {
    setCarrito([]);
    setMostrarResumen(false);
    setVentaCompletada(null);
    setSearchTerm('');
  };

  const totales = calcularTotales();

  if (mostrarResumen && ventaCompletada) {
    return (
      <ResumenVenta 
        venta={ventaCompletada}
        onNuevaVenta={handleNuevaVenta}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🛒 Punto de Venta</h1>
        <div style={styles.headerActions}>
          <button
            style={{
              ...styles.headerButton,
              ...(cajaAbierta ? styles.headerButtonSuccess : styles.headerButtonWarning)
            }}
            onClick={() => {
              window.location.hash = '/cliente/caja';
            }}
          >
            {cajaAbierta ? '✅ Caja Abierta' : '💰 Abrir Caja'}
          </button>
          <button style={styles.headerButton}>
            📊 {resumenVentasDia.cantidad} ventas | ${Math.round(resumenVentasDia.total).toLocaleString('es-CL')}
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Columna Izquierda - Productos */}
        <div style={styles.leftColumn}>
          <ScannerInput 
            value={searchTerm}
            onChange={setSearchTerm}
            onScan={handleEscanear}
          />

          <div style={styles.productGrid}>
            {productosFiltrados.length === 0 ? (
              <div style={styles.noProducts}>
                <div style={styles.noProductsIcon}>📦</div>
                <p style={styles.noProductsText}>
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </p>
              </div>
            ) : (
              productosFiltrados.map(producto => (
                <div
                  key={producto.id}
                  style={{
                    ...styles.productCard,
                    ...(hoveredProduct === producto.id ? styles.productCardHover : {})
                  }}
                  onClick={() => agregarAlCarrito(producto)}
                  onMouseEnter={() => setHoveredProduct(producto.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div style={styles.productImage}>
                    {producto.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.productInfo}>
                    <div style={styles.productName}>{producto.nombre}</div>
                    <div style={styles.productCode}>{producto.codigo || 'S/C'}</div>
                    <div style={styles.productPrice}>
                      ${(parseFloat(producto.precio) || 0).toLocaleString('es-CL')}
                    </div>
                    <div style={styles.productStock}>
                      Stock: {producto.stock || 0}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha - Carrito */}
        <div style={styles.rightColumn}>
          <div style={styles.carritoHeader}>
            <h2 style={styles.carritoTitle}>Carrito de Compra</h2>
            {carrito.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
                    setCarrito([]);
                  }
                }}
                onMouseEnter={() => setHoveredButton('limpiar')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.limpiarButton,
                  ...(hoveredButton === 'limpiar' ? styles.limpiarButtonHover : {})
                }}
              >
                🗑️ Limpiar
              </button>
            )}
          </div>

          <CarritoVenta
            items={carrito}
            onModificarCantidad={modificarCantidad}
            onEliminar={eliminarDelCarrito}
          />

          <div style={styles.totalesContainer}>
            <div style={styles.totalRow}>
              <span>Subtotal:</span>
              <span>${totales.subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div style={styles.totalRow}>
              <span>IVA (19%):</span>
              <span>${totales.iva.toLocaleString('es-CL')}</span>
            </div>
            <div style={styles.totalRowFinal}>
              <span>TOTAL:</span>
              <span style={styles.totalAmount}>
                ${totales.total.toLocaleString('es-CL')}
              </span>
            </div>
          </div>

          {!mostrarPago ? (
            <button
              onClick={handleProcederPago}
              disabled={carrito.length === 0}
              onMouseEnter={() => setHoveredButton('pagar')}
              onMouseLeave={() => setHoveredButton(null)}
              style={{
                ...styles.pagarButton,
                opacity: carrito.length === 0 ? 0.5 : 1,
                cursor: carrito.length === 0 ? 'not-allowed' : 'pointer',
                ...(hoveredButton === 'pagar' && carrito.length > 0 ? styles.pagarButtonHover : {})
              }}
            >
              💳 PROCEDER AL PAGO
            </button>
          ) : (
            <MetodosPago
              total={totales.total}
              onConfirmar={handleConfirmarVenta}
              onCancelar={() => setMostrarPago(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden'
  },
  header: {
    backgroundColor: '#0f766e',
    color: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  headerButton: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    minHeight: 0
  },
  leftColumn: {
    flex: '1',
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#ffffff'
  },
  rightColumn: {
    width: '420px',
    maxWidth: '100%',
    backgroundColor: '#f9fafb',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    minHeight: 0,
    borderLeft: '2px solid #e5e7eb',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.05)'
  },
  headerButtonSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
    borderColor: 'rgba(16, 185, 129, 0.55)'
  },
  headerButtonWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
    borderColor: 'rgba(245, 158, 11, 0.55)'
  },
  carritoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  carritoTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937'
  },
  limpiarButton: {
    padding: '6px 12px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#991b1b',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  limpiarButtonHover: {
    backgroundColor: '#fecaca',
    borderColor: '#f87171',
    transform: 'translateY(-1px)'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },
  noProducts: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#9ca3af'
  },
  noProductsIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5
  },
  noProductsText: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0
  },
  productCard: {
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none'
  },
  productCardHover: {
    borderColor: '#0f766e',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)'
  },
  productImage: {
    width: '100%',
    aspectRatio: '1',
    backgroundColor: '#0f766e',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '12px'
  },
  productInfo: {
    textAlign: 'center'
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
    height: '40px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  productCode: {
    fontSize: '11px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  productPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: '4px'
  },
  productStock: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: '600'
  },
  totalesContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '2px solid #e5e7eb'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    color: '#4b5563',
    marginBottom: '12px'
  },
  totalRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    paddingTop: '12px',
    borderTop: '2px solid #e5e7eb',
    marginTop: '8px'
  },
  totalAmount: {
    color: '#0f766e'
  },
  pagarButton: {
    padding: '18px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  pagarButtonHover: {
    backgroundColor: '#115e59',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)'
  }
};

export default PuntoVenta;
