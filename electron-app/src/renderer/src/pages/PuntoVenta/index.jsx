import React, { useState, useEffect, useRef } from 'react';
import ScannerInput from './components/ScannerInput';
import CarritoVenta from './components/CarritoVenta';
import TecladoNumerico from './components/TecladoNumerico';
import MetodosPago from './components/MetodosPago';
import ResumenVenta from './components/ResumenVenta';

function PuntoVenta() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState(null);

  useEffect(() => {
    cargarProductos();
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
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio_venta,
        cantidad: 1,
        codigo: producto.codigo
      }]);
    }
  };

  const modificarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
    } else {
      setCarrito(carrito.map(item =>
        item.id === productoId ? { ...item, cantidad } : item
      ));
    }
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
  };

  const calcularTotales = () => {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleProcederPago = () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    setMostrarPago(true);
  };

  const handleConfirmarVenta = async (datosPago) => {
    try {
      // Aquí se integraría con el backend
      const ventaData = {
        items: carrito,
        totales: calcularTotales(),
        pago: datosPago,
        fecha: new Date().toISOString()
      };

      // Simular guardado
      console.log('Venta confirmada:', ventaData);
      
      setVentaCompletada(ventaData);
      setMostrarPago(false);
      setMostrarResumen(true);
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar la venta');
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
          <button style={styles.headerButton}>
            💰 Abrir Caja
          </button>
          <button style={styles.headerButton}>
            📊 Ventas del Día
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
            {productosFiltrados.map(producto => (
              <div
                key={producto.id}
                style={styles.productCard}
                onClick={() => agregarAlCarrito(producto)}
              >
                <div style={styles.productImage}>
                  {producto.nombre.charAt(0)}
                </div>
                <div style={styles.productInfo}>
                  <div style={styles.productName}>{producto.nombre}</div>
                  <div style={styles.productCode}>{producto.codigo || 'S/C'}</div>
                  <div style={styles.productPrice}>
                    ${producto.precio_venta?.toLocaleString('es-CL') || '0'}
                  </div>
                  <div style={styles.productStock}>
                    Stock: {producto.stock || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha - Carrito */}
        <div style={styles.rightColumn}>
          <div style={styles.carritoHeader}>
            <h2 style={styles.carritoTitle}>Carrito de Compra</h2>
            {carrito.length > 0 && (
              <button
                onClick={() => setCarrito([])}
                style={styles.limpiarButton}
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
              style={{
                ...styles.pagarButton,
                opacity: carrito.length === 0 ? 0.5 : 1
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
    height: '100vh',
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
    overflow: 'hidden'
  },
  leftColumn: {
    flex: '1',
    padding: '20px',
    overflowY: 'auto',
    backgroundColor: '#ffffff'
  },
  rightColumn: {
    width: '420px',
    backgroundColor: '#f9fafb',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '2px solid #e5e7eb',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.05)'
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
    fontWeight: '600'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },
  productCard: {
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#0f766e',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(15, 118, 110, 0.1)'
    }
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
    marginTop: '16px',
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
    marginTop: '20px',
    padding: '18px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default PuntoVenta;
