import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { formatearRut } from '@/utils/validaciones';

function FormularioGuia({ onGuardar, onCancelar }) {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextFolio, setNextFolio] = useState(null);

  const [formData, setFormData] = useState({
    cliente_id: null,
    fecha: new Date().toISOString().split('T')[0],
    direccion_despacho: '',
    fecha_despacho: '',
    transportista: '',
    patente: '',
    observaciones: ''
  });

  const [items, setItems] = useState([{
    producto_id: null,
    descripcion: '',
    cantidad: 1,
    unidad: 'UN'
  }]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar clientes
      const resClientes = await window.api.clientes.getAll();
      if (resClientes.success) {
        setClientes(resClientes.data);
      }

      // Cargar productos
      const resProductos = await window.api.productos.getAll();
      if (resProductos.success) {
        setProductos(resProductos.data);
      }

      // Obtener siguiente folio
      const resFolio = await window.api.guias.getNextFolio();
      if (resFolio.success) {
        setNextFolio(resFolio.folio);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos iniciales');
    }
  };

  const handleClienteChange = (selectedOption) => {
    if (selectedOption) {
      setFormData({
        ...formData,
        cliente_id: selectedOption.value
      });

      const cliente = clientes.find(c => c.id === selectedOption.value);
      setClienteSeleccionado(cliente);
      
      // Pre-llenar dirección de despacho con dirección del cliente
      if (cliente && cliente.direccion) {
        setFormData(prev => ({
          ...prev,
          cliente_id: selectedOption.value,
          direccion_despacho: cliente.direccion
        }));
      }
    } else {
      setFormData({
        ...formData,
        cliente_id: null,
        direccion_despacho: ''
      });
      setClienteSeleccionado(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleProductoChange = (index, selectedOption) => {
    if (selectedOption) {
      const producto = productos.find(p => p.id === selectedOption.value);
      const newItems = [...items];
      
      newItems[index] = {
        ...newItems[index],
        producto_id: producto.id,
        descripcion: producto.nombre,
        unidad: producto.unidad || 'UN'
      };
      
      setItems(newItems);
    } else {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        producto_id: null,
        descripcion: '',
        unidad: 'UN'
      };
      setItems(newItems);
    }
  };

  const agregarItem = () => {
    setItems([...items, {
      producto_id: null,
      descripcion: '',
      cantidad: 1,
      unidad: 'UN'
    }]);
  };

  const eliminarItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const validarFormulario = () => {
    if (!formData.cliente_id) {
      setError('Debe seleccionar un cliente');
      return false;
    }

    if (!formData.direccion_despacho) {
      setError('Debe ingresar una dirección de despacho');
      return false;
    }

    if (items.some(item => !item.descripcion || item.cantidad <= 0)) {
      setError('Todos los items deben tener descripción y cantidad válida');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const guiaData = {
        ...formData,
        items: items.map(item => ({
          producto_id: item.producto_id,
          descripcion: item.descripcion,
          cantidad: parseFloat(item.cantidad),
          unidad: item.unidad
        }))
      };

      const result = await window.api.guias.create(guiaData);

      if (result.success) {
        onGuardar(result.data);
      } else {
        setError(result.message || 'Error al crear la guía');
      }
    } catch (error) {
      console.error('Error al crear guía:', error);
      setError('Error al crear la guía de despacho');
    } finally {
      setLoading(false);
    }
  };

  const clientesOptions = clientes.map(cliente => ({
    value: cliente.id,
    label: `${cliente.nombre} - ${formatearRut(cliente.rut)}`
  }));

  const productosOptions = productos.map(producto => ({
    value: producto.id,
    label: `${producto.codigo || ''} - ${producto.nombre}`.trim()
  }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📦 Nueva Guía de Despacho</h1>
          <p style={styles.subtitle}>
            Folio: <strong>#{nextFolio || '...'}</strong>
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={onCancelar}
            style={styles.cancelButton}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? 'Generando...' : '✓ Generar Guía'}
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Sección Cliente */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Cliente</h3>
          
          <div style={styles.row}>
            <div style={styles.fullWidth}>
              <label style={styles.label}>
                Cliente *
              </label>
              <Select
                options={clientesOptions}
                onChange={handleClienteChange}
                placeholder="Seleccionar cliente..."
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '42px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#0f766e' }
                  })
                }}
              />
            </div>
          </div>

          {clienteSeleccionado && (
            <div style={styles.clienteInfo}>
              <div>
                <strong>RUT:</strong> {formatearRut(clienteSeleccionado.rut)}
              </div>
              <div>
                <strong>Dirección:</strong> {clienteSeleccionado.direccion || 'Sin dirección'}
              </div>
              {clienteSeleccionado.email && (
                <div>
                  <strong>Email:</strong> {clienteSeleccionado.email}
                </div>
              )}
              {clienteSeleccionado.telefono && (
                <div>
                  <strong>Teléfono:</strong> {clienteSeleccionado.telefono}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección Despacho */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Información de Despacho</h3>
          
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                Fecha Emisión *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleFormChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Fecha Despacho
              </label>
              <input
                type="date"
                name="fecha_despacho"
                value={formData.fecha_despacho}
                onChange={handleFormChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.fullWidth}>
              <label style={styles.label}>
                Dirección de Despacho *
              </label>
              <input
                type="text"
                name="direccion_despacho"
                value={formData.direccion_despacho}
                onChange={handleFormChange}
                style={styles.input}
                placeholder="Calle, número, comuna, ciudad"
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>
                Transportista
              </label>
              <input
                type="text"
                name="transportista"
                value={formData.transportista}
                onChange={handleFormChange}
                style={styles.input}
                placeholder="Nombre o empresa de transporte"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Patente Vehículo
              </label>
              <input
                type="text"
                name="patente"
                value={formData.patente}
                onChange={handleFormChange}
                style={styles.input}
                placeholder="XXXX-00"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.fullWidth}>
              <label style={styles.label}>
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleFormChange}
                style={styles.textarea}
                rows="3"
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
        </div>

        {/* Sección Items */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Items a Despachar</h3>
            <button
              type="button"
              onClick={agregarItem}
              style={styles.addItemButton}
            >
              + Agregar Item
            </button>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Descripción *</th>
                  <th style={styles.th}>Cantidad *</th>
                  <th style={styles.th}>Unidad</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td style={styles.td}>
                      <Select
                        options={productosOptions}
                        onChange={(option) => handleProductoChange(index, option)}
                        placeholder="Opcional"
                        isClearable
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: '38px',
                            minWidth: '200px'
                          })
                        }}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                        style={styles.tableInput}
                        placeholder="Descripción del item"
                        required
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                        style={styles.tableInput}
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </td>
                    <td style={styles.td}>
                      <select
                        value={item.unidad}
                        onChange={(e) => handleItemChange(index, 'unidad', e.target.value)}
                        style={styles.tableSelect}
                      >
                        <option value="UN">Unidad</option>
                        <option value="KG">Kilogramo</option>
                        <option value="MT">Metro</option>
                        <option value="LT">Litro</option>
                        <option value="CJ">Caja</option>
                        <option value="GL">Galon</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() => eliminarItem(index)}
                        style={styles.deleteButton}
                        disabled={items.length === 1}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto'
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
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '10px 24px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    color: '#991b1b',
    marginBottom: '20px'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '16px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '16px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column'
  },
  fullWidth: {
    gridColumn: '1 / -1'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px'
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  clienteInfo: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    fontSize: '14px',
    color: '#4b5563'
  },
  addItemButton: {
    padding: '8px 16px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    borderBottom: '2px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  tableInput: {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px'
  },
  tableSelect: {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: 'white'
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  }
};

export default FormularioGuia;
