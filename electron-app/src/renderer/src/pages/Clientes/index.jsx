import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
  formatearRut,
  validarFormularioCliente,
  limpiarRut
} from '@/utils/validaciones';
import { regiones, getComunasByRegion } from '@/data/regionesComunas';

function Clientes() {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState([]);
  const [editingCliente, setEditingCliente] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [comunasDisponibles, setComunasDisponibles] = useState([]);
  const [formData, setFormData] = useState({
    tipoDocumento: 'rut_empresa',
    rut: '',
    razonSocial: '',
    nombreFantasia: '',
    giro: '',
    direccion: '',
    region: '',
    comuna: '',
    ciudad: '',
    telefono: '',
    email: '',
    contactoNombre: '',
    contactoCargo: '',
    contactoEmail: '',
    contactoTelefono: '',
    condicionPago: 'contado',
    diasCredito: 0,
    limiteCredito: 0,
    descuentoAutomatico: 0
  });

  useEffect(() => {
    loadClientes();
  }, []);

  // Fix: Auto-focus en el primer campo cuando se abre el formulario
  useEffect(() => {
    if (view === 'form') {
      const timer = setTimeout(() => {
        const firstInput = document.querySelector('input[name="rut"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.clientes.getAll();
      if (result.success) {
        setClientes(result.data);
      } else {
        setError(result.error || 'Error al cargar clientes');
      }
    } catch (error) {
      console.error('Error loading clientes:', error);
      setError('Error al cargar clientes');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Formatear RUT automáticamente mientras se escribe
    if (name === 'rut') {
      processedValue = formatearRut(value);
    }

    setFormData({
      ...formData,
      [name]: processedValue
    });

    // Limpiar error de validación del campo cuando el usuario empieza a escribir
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  // Manejar cambio de región
  const handleRegionChange = (selectedOption) => {
    const regionValue = selectedOption ? selectedOption.value : '';

    setFormData({
      ...formData,
      region: regionValue,
      comuna: '' // Limpiar comuna al cambiar región
    });

    // Actualizar comunas disponibles
    if (regionValue) {
      setComunasDisponibles(getComunasByRegion(regionValue));
    } else {
      setComunasDisponibles([]);
    }
  };

  // Manejar cambio de comuna
  const handleComunaChange = (selectedOption) => {
    setFormData({
      ...formData,
      comuna: selectedOption ? selectedOption.value : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validar el formulario antes de enviar
    const { valido, errores } = validarFormularioCliente(formData);

    if (!valido) {
      setValidationErrors(errores);
      setError('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      // Preparar datos para enviar (limpiar RUT de formato)
      const dataToSend = {
        ...formData,
        rut: limpiarRut(formData.rut)
      };

      let result;
      if (editingCliente) {
        // Actualizar
        result = await window.api.clientes.update({
          id: editingCliente.id,
          cliente: dataToSend
        });
      } else {
        // Crear
        result = await window.api.clientes.create(dataToSend);
      }

      if (result.success) {
        await loadClientes();
        handleCancel();
      } else {
        setError(result.error || 'Error al guardar cliente');
      }
    } catch (error) {
      console.error('Error saving cliente:', error);
      setError('Error al guardar cliente');
    }

    setIsLoading(false);
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);

    // Si el cliente tiene región, cargar las comunas disponibles
    if (cliente.region) {
      setComunasDisponibles(getComunasByRegion(cliente.region));
    }

    setFormData({
      tipoDocumento: cliente.tipo_documento || 'rut_empresa',
      rut: formatearRut(cliente.rut),
      razonSocial: cliente.razon_social,
      nombreFantasia: cliente.nombre_fantasia || '',
      giro: cliente.giro || '',
      direccion: cliente.direccion || '',
      region: cliente.region || '',
      comuna: cliente.comuna || '',
      ciudad: cliente.ciudad || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      contactoNombre: cliente.contacto_nombre || '',
      contactoCargo: cliente.contacto_cargo || '',
      contactoEmail: cliente.contacto_email || '',
      contactoTelefono: cliente.contacto_telefono || '',
      condicionPago: cliente.condicion_pago || 'contado',
      diasCredito: cliente.dias_credito || 0,
      limiteCredito: cliente.limite_credito || 0,
      descuentoAutomatico: cliente.descuento_automatico || 0
    });
    setValidationErrors({});
    setView('form');
  };

  const handleDelete = async (cliente) => {
    if (!confirm(`¿Estás seguro de eliminar el cliente "${cliente.razon_social}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.api.clientes.delete(cliente.id);
      if (result.success) {
        await loadClientes();
      } else {
        alert(result.error || 'Error al eliminar cliente');
      }
    } catch (error) {
      console.error('Error deleting cliente:', error);
      alert('Error al eliminar cliente');
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setView('list');
    setEditingCliente(null);
    setError('');
    setValidationErrors({});
    setComunasDisponibles([]);
    setFormData({
      tipoDocumento: 'rut_empresa',
      rut: '',
      razonSocial: '',
      nombreFantasia: '',
      giro: '',
      direccion: '',
      region: '',
      comuna: '',
      ciudad: '',
      telefono: '',
      email: '',
      contactoNombre: '',
      contactoCargo: '',
      contactoEmail: '',
      contactoTelefono: '',
      condicionPago: 'contado',
      diasCredito: 0,
      limiteCredito: 0,
      descuentoAutomatico: 0
    });
  };

  const filteredClientes = searchTerm
    ? clientes.filter(c =>
        c.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : clientes;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Gestión de Clientes</h1>
        <p style={styles.subtitle}>Administra tu base de clientes</p>
      </div>

      {view === 'list' ? (
        <>
          <div style={styles.toolbar}>
            <input
              type="text"
              placeholder="Buscar cliente por RUT, razón social o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button
              onClick={() => setView('form')}
              style={styles.addButton}
            >
              + Nuevo Cliente
            </button>
          </div>

          {isLoading && <div style={styles.loading}>Cargando...</div>}

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>RUT</th>
                  <th style={styles.th}>Razón Social</th>
                  <th style={styles.th}>Región</th>
                  <th style={styles.th}>Comuna</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyMessage}>
                      {isLoading ? 'Cargando...' : 'No hay clientes registrados. Haz clic en "Nuevo Cliente" para comenzar.'}
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                    <tr key={cliente.id} style={styles.tr}>
                      <td style={styles.td}>{formatearRut(cliente.rut)}</td>
                      <td style={styles.td}>{cliente.razon_social}</td>
                      <td style={styles.td}>{cliente.region || '-'}</td>
                      <td style={styles.td}>{cliente.comuna || '-'}</td>
                      <td style={styles.td}>{cliente.telefono || '-'}</td>
                      <td style={styles.td}>{cliente.email || '-'}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleEdit(cliente)}
                          style={styles.actionBtn}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(cliente)}
                          style={{...styles.actionBtn, ...styles.deleteBtn}}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>
            {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Documento *</label>
                <select
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                >
                  <option value="rut_empresa">RUT Empresa (76.xxx.xxx-x)</option>
                  <option value="rut_persona">RUT Persona (12.xxx.xxx-x)</option>
                  <option value="rut_extranjero">RUT Extranjero (55.xxx.xxx-x)</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="sin_identificacion">Sin Identificación (Boleta genérica)</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>RUT / Identificación *</label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(validationErrors.rut ? styles.inputError : {})
                  }}
                  placeholder="12.345.678-9"
                  required
                />
                {validationErrors.rut && (
                  <span style={styles.errorText}>{validationErrors.rut}</span>
                )}
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Razón Social / Nombre Completo *</label>
                <input
                  type="text"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(validationErrors.razonSocial ? styles.inputError : {})
                  }}
                  placeholder="Nombre de la empresa o persona"
                  required
                />
                {validationErrors.razonSocial && (
                  <span style={styles.errorText}>{validationErrors.razonSocial}</span>
                )}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre Fantasía</label>
                <input
                  type="text"
                  name="nombreFantasia"
                  value={formData.nombreFantasia}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Cómo le dices al cliente"
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Giro</label>
                <input
                  type="text"
                  name="giro"
                  value={formData.giro}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Actividad comercial"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(validationErrors.telefono ? styles.inputError : {})
                  }}
                  placeholder="+56912345678 o 912345678"
                />
                {validationErrors.telefono && (
                  <span style={styles.errorText}>{validationErrors.telefono}</span>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Calle y número"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Región</label>
                <Select
                  options={regiones}
                  value={regiones.find(r => r.value === formData.region) || null}
                  onChange={handleRegionChange}
                  placeholder="Selecciona una región..."
                  isClearable
                  isSearchable
                  noOptionsMessage={() => 'No hay regiones disponibles'}
                  styles={customSelectStyles}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Comuna</label>
                <Select
                  options={comunasDisponibles}
                  value={comunasDisponibles.find(c => c.value === formData.comuna) || null}
                  onChange={handleComunaChange}
                  placeholder={formData.region ? "Selecciona una comuna..." : "Primero selecciona una región"}
                  isClearable
                  isSearchable
                  isDisabled={!formData.region}
                  noOptionsMessage={() => 'No hay comunas disponibles'}
                  styles={customSelectStyles}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Ciudad</label>
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Ciudad"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(validationErrors.email ? styles.inputError : {})
                }}
                placeholder="contacto@empresa.cl"
              />
              {validationErrors.email && (
                <span style={styles.errorText}>{validationErrors.email}</span>
              )}
            </div>

            <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #eee'}}>
              <h3 style={{marginBottom: '16px', color: '#333', fontSize: '16px'}}>📞 Datos de Contacto (Persona)</h3>
              <p style={{fontSize: '13px', color: '#666', marginBottom: '16px'}}>Información de la persona de contacto dentro de la empresa</p>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre del Contacto</label>
                  <input
                    type="text"
                    name="contactoNombre"
                    value={formData.contactoNombre}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Nombre completo"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cargo</label>
                  <input
                    type="text"
                    name="contactoCargo"
                    value={formData.contactoCargo}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Ej: Gerente, Contador, etc."
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email del Contacto</label>
                  <input
                    type="email"
                    name="contactoEmail"
                    value={formData.contactoEmail}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="email.contacto@empresa.cl"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono del Contacto</label>
                  <input
                    type="tel"
                    name="contactoTelefono"
                    value={formData.contactoTelefono}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="+56912345678"
                  />
                </div>
              </div>
            </div>

            <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '2px solid #eee'}}>
              <h3 style={{marginBottom: '16px', color: '#333', fontSize: '16px'}}>💼 Condiciones Comerciales</h3>
              <p style={{fontSize: '13px', color: '#666', marginBottom: '16px'}}>Configuración de pagos, crédito y condiciones especiales</p>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Condición de Pago *</label>
                  <select
                    name="condicionPago"
                    value={formData.condicionPago}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="contado">Contado</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Días de Crédito</label>
                  <input
                    type="number"
                    name="diasCredito"
                    value={formData.diasCredito}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="30, 60, 90..."
                    min="0"
                    disabled={formData.condicionPago === 'contado'}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Límite de Crédito ($)</label>
                  <input
                    type="number"
                    name="limiteCredito"
                    value={formData.limiteCredito}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Monto máximo de deuda"
                    min="0"
                    disabled={formData.condicionPago === 'contado'}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Descuento Automático (%)</label>
                  <input
                    type="number"
                    name="descuentoAutomatico"
                    value={formData.descuentoAutomatico}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
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
                {isLoading ? 'Guardando...' : (editingCliente ? 'Actualizar Cliente' : 'Guardar Cliente')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Estilos personalizados para react-select
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
    color: state.isSelected ? 'white' : '#333',
    '&:active': {
      backgroundColor: '#007bff'
    }
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: '14px',
    color: '#999'
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: '14px',
    color: '#333'
  }),
  menu: (base) => ({
    ...base,
    fontSize: '14px'
  })
};

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
    marginBottom: '20px'
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
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px',
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
  emptyMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '14px'
  },
  actionBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    marginRight: '5px'
  },
  deleteBtn: {
    color: '#dc3545'
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
  inputError: {
    border: '1px solid #dc3545',
    backgroundColor: '#fff5f5'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block'
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

export default Clientes;
