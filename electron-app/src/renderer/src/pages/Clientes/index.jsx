import React, { useState, useEffect } from 'react';

function Clientes() {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState([]);
  const [editingCliente, setEditingCliente] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    rut: '',
    razonSocial: '',
    giro: '',
    direccion: '',
    comuna: '',
    ciudad: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    loadClientes();
  }, []);

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (editingCliente) {
        // Actualizar
        result = await window.api.clientes.update({
          id: editingCliente.id,
          cliente: formData
        });
      } else {
        // Crear
        result = await window.api.clientes.create(formData);
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
    setFormData({
      rut: cliente.rut,
      razonSocial: cliente.razon_social,
      giro: cliente.giro || '',
      direccion: cliente.direccion || '',
      comuna: cliente.comuna || '',
      ciudad: cliente.ciudad || '',
      telefono: cliente.telefono || '',
      email: cliente.email || ''
    });
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
    setFormData({
      rut: '',
      razonSocial: '',
      giro: '',
      direccion: '',
      comuna: '',
      ciudad: '',
      telefono: '',
      email: ''
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
                  <th style={styles.th}>Giro</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.emptyMessage}>
                      {isLoading ? 'Cargando...' : 'No hay clientes registrados. Haz clic en "Nuevo Cliente" para comenzar.'}
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                    <tr key={cliente.id} style={styles.tr}>
                      <td style={styles.td}>{cliente.rut}</td>
                      <td style={styles.td}>{cliente.razon_social}</td>
                      <td style={styles.td}>{cliente.giro || '-'}</td>
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
                <label style={styles.label}>RUT *</label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="12.345.678-9"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Razón Social *</label>
                <input
                  type="text"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Nombre de la empresa"
                  required
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
                  style={styles.input}
                  placeholder="+56912345678"
                />
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
                <label style={styles.label}>Comuna</label>
                <input
                  type="text"
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Comuna"
                />
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
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="contacto@empresa.cl"
              />
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
