import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { formatearRut } from '@/utils/validaciones';

function FormularioFactura({ onCancel, onSuccess }) {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nextFolio, setNextFolio] = useState(null);

  const [formData, setFormData] = useState({
    cliente_id: null,
    fecha: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    forma_pago: 'contado',
    forma_pago_detalle: '',
    condiciones_pago: '',
    orden_compra: '',
    observaciones: ''
  });

  const [items, setItems] = useState([{
    producto_id: null,
    codigo_item: '',
    descripcion: '',
    cantidad: 1,
    unidad: 'UN',
    precio_unitario: 0,
    descuento: 0,
    descuento_monto: 0,
    monto_item: 0
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
      const resFolio = await window.api.facturas.getNextFolio();
      if (resFolio.success) {
        setNextFolio(resFolio.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos iniciales');
    }
  };

  // Calcular monto de un item
  const calcularMontoItem = (cantidad, precioUnitario, descuento) => {
    const subtotal = cantidad * precioUnitario;
    const montoDescuento = subtotal * (descuento / 100);
    return subtotal - montoDescuento;
  };

  // Calcular totales de la factura
  const calcularTotales = () => {
    let netoAfecto = 0;
    let montoExento = 0;

    items.forEach(item => {
      if (item.exento) {
        montoExento += item.monto_item;
      } else {
        netoAfecto += item.monto_item;
      }
    });

    const iva = netoAfecto * 0.19;
    const total = netoAfecto + montoExento + iva;

    return {
      subtotal: Math.round(netoAfecto),
      monto_exento: Math.round(montoExento),
      iva: Math.round(iva),
      total: Math.round(total)
    };
  };

  const handleClienteChange = (selectedOption) => {
    if (selectedOption) {
      setFormData({
        ...formData,
        cliente_id: selectedOption.value
      });

      const cliente = clientes.find(c => c.id === selectedOption.value);
      setClienteSeleccionado(cliente);
    } else {
      setFormData({
        ...formData,
        cliente_id: null
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

    // Si cambia a contado, limpiar fecha de vencimiento
    if (name === 'forma_pago' && value === 'contado') {
      setFormData({
        ...formData,
        forma_pago: value,
        fecha_vencimiento: '',
        condiciones_pago: ''
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Recalcular monto si cambian cantidad, precio o descuento
    if (['cantidad', 'precio_unitario', 'descuento'].includes(field)) {
      const item = newItems[index];
      newItems[index].monto_item = calcularMontoItem(
        parseFloat(item.cantidad) || 0,
        parseFloat(item.precio_unitario) || 0,
        parseFloat(item.descuento) || 0
      );
    }

    setItems(newItems);
  };

  const handleProductoChange = (index, selectedOption) => {
    if (selectedOption) {
      const producto = productos.find(p => p.id === selectedOption.value);
      if (producto) {
        handleItemChange(index, 'producto_id', producto.id);
        handleItemChange(index, 'codigo_item', producto.codigo || '');
        handleItemChange(index, 'descripcion', producto.nombre);
        handleItemChange(index, 'precio_unitario', producto.precio);

        // Recalcular monto
        const newItems = [...items];
        newItems[index].producto_id = producto.id;
        newItems[index].codigo_item = producto.codigo || '';
        newItems[index].descripcion = producto.nombre;
        newItems[index].precio_unitario = producto.precio;
        newItems[index].exento = producto.exento === 1; // Copiar estado de exento
        newItems[index].monto_item = calcularMontoItem(
          parseFloat(newItems[index].cantidad) || 1,
          producto.precio,
          parseFloat(newItems[index].descuento) || 0
        );
        setItems(newItems);
      }
    }
  };

  const agregarItem = () => {
    setItems([...items, {
      producto_id: null,
      codigo_item: '',
      descripcion: '',
      cantidad: 1,
      unidad: 'UN',
      precio_unitario: 0,
      descuento: 0,
      monto_item: 0
    }]);
  };

  const eliminarItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.cliente_id) {
      setError('Debe seleccionar un cliente');
      return;
    }

    if (items.length === 0 || items.every(item => !item.descripcion)) {
      setError('Debe agregar al menos un item a la factura');
      return;
    }

    if (formData.forma_pago === 'credito' && !formData.fecha_vencimiento) {
      setError('Debe indicar la fecha de vencimiento para pago a crédito');
      return;
    }

    // Validar que los items tengan datos válidos
    const itemsValidos = items.filter(item => item.descripcion && item.cantidad > 0);
    if (itemsValidos.length === 0) {
      setError('Debe tener al menos un item válido');
      return;
    }

    setLoading(true);

    try {
      const totales = calcularTotales();

      const facturaData = {
        factura: {
          ...formData,
          subtotal: totales.subtotal,
          monto_exento: totales.monto_exento,
          iva: totales.iva,
          total: totales.total
        },
        items: itemsValidos
      };

      const result = await window.api.facturas.create(facturaData);

      if (result.success) {
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setError(result.error || 'Error al crear la factura');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al guardar la factura');
    } finally {
      setLoading(false);
    }
  };

  const totales = calcularTotales();

  const clientesOptions = clientes.map(c => ({
    value: c.id,
    label: `${formatearRut(c.rut)} - ${c.razon_social}`
  }));

  const productosOptions = productos.map(p => ({
    value: p.id,
    label: `${p.codigo || 'S/C'} - ${p.nombre} - $${p.precio.toLocaleString('es-CL')}`
  }));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Nueva Factura Electrónica</h2>
        {nextFolio && (
          <div style={styles.folioBox}>
            <span style={styles.folioLabel}>Folio:</span>
            <span style={styles.folioNumber}>#{nextFolio}</span>
          </div>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Sección Cliente */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Datos del Cliente</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Cliente *</label>
            <Select
              options={clientesOptions}
              onChange={handleClienteChange}
              placeholder="Buscar cliente por RUT o razón social..."
              isClearable
              isSearchable
              styles={customSelectStyles}
            />
          </div>

          {clienteSeleccionado && (
            <div style={styles.clienteInfo}>
              <div style={styles.infoRow}>
                <strong>RUT:</strong> {formatearRut(clienteSeleccionado.rut)}
              </div>
              <div style={styles.infoRow}>
                <strong>Razón Social:</strong> {clienteSeleccionado.razon_social}
              </div>
              {clienteSeleccionado.giro && (
                <div style={styles.infoRow}>
                  <strong>Giro:</strong> {clienteSeleccionado.giro}
                </div>
              )}
              {clienteSeleccionado.direccion && (
                <div style={styles.infoRow}>
                  <strong>Dirección:</strong> {clienteSeleccionado.direccion}
                  {clienteSeleccionado.comuna && `, ${clienteSeleccionado.comuna}`}
                  {clienteSeleccionado.ciudad && `, ${clienteSeleccionado.ciudad}`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección Datos de la Factura */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Datos de la Factura</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha Emisión *</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleFormChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Forma de Pago *</label>
              <select
                name="forma_pago"
                value={formData.forma_pago}
                onChange={handleFormChange}
                style={styles.input}
                required
              >
                <option value="contado">Contado</option>
                <option value="credito">Crédito</option>
              </select>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Forma de Pago Detalle</label>
            <select
              name="forma_pago_detalle"
              value={formData.forma_pago_detalle}
              onChange={handleFormChange}
              style={styles.input}
            >
              <option value="">Seleccionar...</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="cheque">Cheque</option>
              <option value="tarjeta_debito">Tarjeta de Débito</option>
              <option value="tarjeta_credito">Tarjeta de Crédito</option>
            </select>
          </div>

          {formData.forma_pago === 'credito' && (
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Fecha Vencimiento *</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={formData.fecha_vencimiento}
                  onChange={handleFormChange}
                  style={styles.input}
                  min={formData.fecha}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Condiciones de Pago</label>
                <input
                  type="text"
                  name="condiciones_pago"
                  value={formData.condiciones_pago}
                  onChange={handleFormChange}
                  style={styles.input}
                  placeholder="Ej: 30 días, 60 días, etc."
                />
              </div>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Orden de Compra (Referencia Cliente)</label>
            <input
              type="text"
              name="orden_compra"
              value={formData.orden_compra}
              onChange={handleFormChange}
              style={styles.input}
              placeholder="Número o referencia de orden de compra del cliente"
            />
          </div>
        </div>

        {/* Sección Items */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Detalle de Items</h3>
            <button
              type="button"
              onClick={agregarItem}
              style={styles.addItemButton}
            >
              + Agregar Item
            </button>
          </div>

          <div style={styles.itemsContainer}>
            {items.map((item, index) => (
              <div key={index} style={styles.itemCard}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemNumber}>Item {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      style={styles.deleteItemButton}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Producto</label>
                  <Select
                    options={productosOptions}
                    onChange={(opt) => handleProductoChange(index, opt)}
                    placeholder="Buscar producto..."
                    isClearable
                    isSearchable
                    styles={customSelectStyles}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Descripción *</label>
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                    style={styles.input}
                    placeholder="Descripción del producto o servicio"
                    required
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Cantidad *</label>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                      style={styles.input}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Unidad</label>
                    <select
                      value={item.unidad}
                      onChange={(e) => handleItemChange(index, 'unidad', e.target.value)}
                      style={styles.input}
                    >
                      <option value="UN">Unidad (UN)</option>
                      <option value="KG">Kilogramo (KG)</option>
                      <option value="LT">Litro (LT)</option>
                      <option value="MT">Metro (MT)</option>
                      <option value="M2">Metro² (M2)</option>
                      <option value="M3">Metro³ (M3)</option>
                      <option value="HR">Hora (HR)</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Precio Unit. *</label>
                    <input
                      type="number"
                      value={item.precio_unitario}
                      onChange={(e) => handleItemChange(index, 'precio_unitario', e.target.value)}
                      style={styles.input}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Desc. %</label>
                    <input
                      type="number"
                      value={item.descuento}
                      onChange={(e) => handleItemChange(index, 'descuento', e.target.value)}
                      style={styles.input}
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>

                <div style={styles.itemTotal}>
                  <strong>Subtotal Item:</strong> ${item.monto_item.toLocaleString('es-CL')}
                  {item.exento && (
                    <span style={styles.exentoBadge}> ✓ Exento IVA</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección Observaciones */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Observaciones</h3>
          <div style={styles.formGroup}>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleFormChange}
              style={styles.textarea}
              placeholder="Observaciones o notas adicionales (opcional)"
              rows="3"
            />
          </div>
        </div>

        {/* Totales */}
        <div style={styles.totalesBox}>
          <div style={styles.totalRow}>
            <span>Neto Afecto:</span>
            <span style={styles.totalValue}>${totales.subtotal.toLocaleString('es-CL')}</span>
          </div>
          {totales.monto_exento > 0 && (
            <div style={styles.totalRow}>
              <span>Monto Exento:</span>
              <span style={styles.totalValue}>${totales.monto_exento.toLocaleString('es-CL')}</span>
            </div>
          )}
          <div style={styles.totalRow}>
            <span>IVA (19%):</span>
            <span style={styles.totalValue}>${totales.iva.toLocaleString('es-CL')}</span>
          </div>
          <div style={styles.totalRowFinal}>
            <span style={styles.totalLabel}>TOTAL:</span>
            <span style={styles.totalFinal}>${totales.total.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* Botones */}
        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={onCancel}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar y Ver PDF'}
          </button>
        </div>
      </form>
    </div>
  );
}

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    padding: '2px',
    fontSize: '14px',
    border: state.isFocused ? '1px solid #007bff' : '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: 'none',
    '&:hover': {
      border: '1px solid #007bff'
    }
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '14px',
    backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f0f0f0' : 'white',
    color: state.isSelected ? 'white' : '#333'
  })
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e0e0e0'
  },
  title: {
    fontSize: '24px',
    color: '#333',
    margin: 0
  },
  folioBox: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  folioLabel: {
    fontSize: '14px',
    fontWeight: '500'
  },
  folioNumber: {
    fontSize: '20px',
    fontWeight: 'bold'
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '15px',
    fontWeight: '600'
  },
  formGroup: {
    marginBottom: '15px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  clienteInfo: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginTop: '15px'
  },
  infoRow: {
    padding: '5px 0',
    fontSize: '14px',
    color: '#555'
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  itemCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '6px',
    border: '1px solid #ddd'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e0e0e0'
  },
  itemNumber: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#007bff'
  },
  deleteItemButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addItemButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  itemTotal: {
    textAlign: 'right',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    marginTop: '10px',
    fontSize: '16px'
  },
  exentoBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#856404',
    backgroundColor: '#fff3cd',
    padding: '3px 8px',
    borderRadius: '10px',
    marginLeft: '10px'
  },
  totalesBox: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '6px',
    marginBottom: '20px',
    maxWidth: '400px',
    marginLeft: 'auto'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px',
    color: '#555'
  },
  totalRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0 0 0',
    borderTop: '2px solid #007bff',
    marginTop: '10px'
  },
  totalValue: {
    fontWeight: '500'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  totalFinal: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#007bff'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  cancelButton: {
    padding: '12px 30px',
    fontSize: '16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  submitButton: {
    padding: '12px 30px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  error: {
    padding: '15px',
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '4px',
    color: '#c33',
    fontSize: '14px',
    marginBottom: '20px'
  }
};

export default FormularioFactura;
