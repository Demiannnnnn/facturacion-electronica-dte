import React, { useState, useEffect } from 'react';

function Productos() {
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState([]);
  const [editingProducto, setEditingProducto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    exento: false
  });

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.productos.getAll();
      if (result.success) {
        setProductos(result.data);
      } else {
        setError(result.error || 'Error al cargar productos');
      }
    } catch (error) {
      console.error('Error loading productos:', error);
      setError('Error al cargar productos');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (editingProducto) {
        // Actualizar
        result = await window.api.productos.update({
          id: editingProducto.id,
          producto: {
            ...formData,
            precio: parseFloat(formData.precio),
            stock: parseInt(formData.stock),
            exento: formData.exento ? 1 : 0
          }
        });
      } else {
        // Crear
        result = await window.api.productos.create({
          ...formData,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock),
          exento: formData.exento ? 1 : 0
        });
      }

      if (result.success) {
        await loadProductos();
        handleCancel();
      } else {
        setError(result.error || 'Error al guardar producto');
      }
    } catch (error) {
      console.error('Error saving producto:', error);
      setError('Error al guardar producto');
    }

    setIsLoading(false);
  };

  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setFormData({
      codigo: producto.codigo || '',
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      exento: producto.exento === 1
    });
    setView('form');
  };

  const handleDelete = async (producto) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.api.productos.delete(producto.id);
      if (result.success) {
        await loadProductos();
      } else {
        alert(result.error || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error deleting producto:', error);
      alert('Error al eliminar producto');
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setView('list');
    setEditingProducto(null);
    setError('');
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      exento: false
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const filteredProductos = searchTerm
    ? productos.filter(p =>
      (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : productos;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📦 Gestión de Productos</h1>
        <p style={styles.subtitle}>Administra tu catálogo de productos</p>
      </div>

      {view === 'list' ? (
        <>
          <div style={styles.toolbar}>
            <input
              type="text"
              placeholder="Buscar producto por código o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button
              onClick={() => setView('form')}
              style={styles.addButton}
            >
              + Nuevo Producto
            </button>
          </div>

          {isLoading && <div style={styles.loading}>Cargando...</div>}

          <div style={styles.gridContainer}>
            {filteredProductos.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyMessage}>
                  {isLoading ? 'Cargando...' : 'No hay productos registrados. Haz clic en "Nuevo Producto" para comenzar.'}
                </p>
              </div>
            ) : (
              filteredProductos.map((producto) => (
                <div key={producto.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.codigo}>{producto.codigo || 'SIN CÓDIGO'}</span>
                    <div>
                      <button
                        onClick={() => handleEdit(producto)}
                        style={styles.cardActionBtn}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(producto)}
                        style={{ ...styles.cardActionBtn, color: '#dc3545' }}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h3 style={styles.cardTitle}>{producto.nombre}</h3>
                  {producto.exento === 1 && (
                    <div style={styles.exentoBadge}>
                      ✓ Exento de IVA
                    </div>
                  )}
                  <p style={styles.cardDescription}>{producto.descripcion || 'Sin descripción'}</p>
                  <div style={styles.cardFooter}>
                    <div style={styles.priceContainer}>
                      <span style={styles.priceLabel}>Precio</span>
                      <span style={styles.price}>{formatPrice(producto.precio)}</span>
                    </div>
                    <div style={styles.stockContainer}>
                      <span style={styles.stockLabel}>Stock</span>
                      <span style={styles.stock}>{producto.stock} unidades</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>
            {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Código</label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="PROD-001"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Nombre del producto"
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                placeholder="Descripción detallada del producto"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Precio (CLP) *</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="15000"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="50"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="exento"
                  checked={formData.exento}
                  onChange={handleInputChange}
                  style={styles.checkbox}
                />
                <span>Producto Exento de IVA</span>
              </label>
              <small style={styles.helpText}>
                Los productos exentos no llevan IVA en las facturas (ej: libros, medicamentos, etc.)
              </small>
            </div>

            <div style={styles.formButtons}>
              <button
                type="button"
                onClick={handleCancel}
                style={styles.cancelButton}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : (editingProducto ? 'Actualizar Producto' : 'Guardar Producto')}
              </button>
            </div>
          </form>
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
  toolbar: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px'
  },
  searchInput: {
    flex: 1,
    padding: '10px 15px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '20px',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  codigo: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  cardActionBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    marginLeft: '5px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#212529'
  },
  exentoBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#856404',
    backgroundColor: '#fff3cd',
    padding: '4px 10px',
    borderRadius: '12px',
    marginBottom: '8px'
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '15px',
    minHeight: '40px'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '15px',
    borderTop: '1px solid #dee2e6'
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  priceLabel: {
    fontSize: '12px',
    color: '#6c757d'
  },
  price: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#28a745'
  },
  stockContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'right'
  },
  stockLabel: {
    fontSize: '12px',
    color: '#6c757d'
  },
  stock: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#007bff'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyMessage: {
    fontSize: '14px',
    color: '#666'
  },
  formContainer: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  formTitle: {
    fontSize: '22px',
    marginBottom: '25px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '10px'
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  helpText: {
    fontSize: '12px',
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: '5px',
    display: 'block'
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c33',
    fontSize: '14px',
    marginBottom: '20px'
  }
};

export default Productos;
