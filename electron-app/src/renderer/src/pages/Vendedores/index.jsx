import React, { useState, useEffect } from 'react';

function Vendedores() {
  const [view, setView] = useState('list');
  const [vendedores, setVendedores] = useState([]);
  const [editingVendedor, setEditingVendedor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    comision: 0,
    activo: 1
  });

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    setIsLoading(true);
    try {
      const result = await window.api.vendedores.getAll();
      if (result.success) {
        setVendedores(result.data);
      } else {
        setError(result.error || 'Error al cargar vendedores');
      }
    } catch (error) {
      console.error('Error loading vendedores:', error);
      setError('Error al cargar vendedores');
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (editingVendedor) {
        result = await window.api.vendedores.update({
          id: editingVendedor.id,
          vendedor: formData
        });
      } else {
        result = await window.api.vendedores.create(formData);
      }

      if (result.success) {
        await loadVendedores();
        handleCancel();
      } else {
        setError(result.error || 'Error al guardar vendedor');
      }
    } catch (error) {
      console.error('Error saving vendedor:', error);
      setError('Error al guardar vendedor');
    }

    setIsLoading(false);
  };

  const handleEdit = (vendedor) => {
    setEditingVendedor(vendedor);
    setFormData({
      nombre: vendedor.nombre,
      apellido: vendedor.apellido,
      email: vendedor.email || '',
      telefono: vendedor.telefono || '',
      comision: vendedor.comision || 0,
      activo: vendedor.activo
    });
    setView('form');
  };

  const handleDelete = async (vendedor) => {
    if (!confirm(`¿Estás seguro de eliminar/desactivar al vendedor "${vendedor.nombre} ${vendedor.apellido}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.api.vendedores.delete(vendedor.id);
      if (result.success) {
        if (result.message) {
          alert(result.message);
        }
        await loadVendedores();
      } else {
        alert(result.error || 'Error al eliminar vendedor');
      }
    } catch (error) {
      console.error('Error deleting vendedor:', error);
      alert('Error al eliminar vendedor');
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setView('list');
    setEditingVendedor(null);
    setError('');
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      comision: 0,
      activo: 1
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👨‍💼 Gestión de Vendedores</h1>
        <p style={styles.subtitle}>Administra tu equipo de ventas</p>
      </div>

      {view === 'list' ? (
        <>
          <div style={styles.toolbar}>
            <button
              onClick={() => setView('form')}
              style={styles.addButton}
            >
              + Nuevo Vendedor
            </button>
          </div>

          {isLoading && <div style={styles.loading}>Cargando...</div>}

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Apellido</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Teléfono</th>
                  <th style={styles.th}>Comisión (%)</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vendedores.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyMessage}>
                      {isLoading ? 'Cargando...' : 'No hay vendedores registrados. Haz clic en "Nuevo Vendedor" para comenzar.'}
                    </td>
                  </tr>
                ) : (
                  vendedores.map((vendedor) => (
                    <tr key={vendedor.id} style={styles.tr}>
                      <td style={styles.td}>{vendedor.nombre}</td>
                      <td style={styles.td}>{vendedor.apellido}</td>
                      <td style={styles.td}>{vendedor.email || '-'}</td>
                      <td style={styles.td}>{vendedor.telefono || '-'}</td>
                      <td style={styles.td}>{vendedor.comision}%</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          ...(vendedor.activo ? styles.badgeActive : styles.badgeInactive)
                        }}>
                          {vendedor.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleEdit(vendedor)}
                          style={styles.actionBtn}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(vendedor)}
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
            {editingVendedor ? 'Editar Vendedor' : 'Nuevo Vendedor'}
          </h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Nombre del vendedor"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Apellido del vendedor"
                  required
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="vendedor@empresa.cl"
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

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Comisión (%)</label>
                <input
                  type="number"
                  name="comision"
                  value={formData.comision}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Ej: 5, 10, 15..."
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Estado</label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo === 1}
                    onChange={handleInputChange}
                    style={{marginRight: '8px'}}
                  />
                  Activo
                </label>
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
                {isLoading ? 'Guardando...' : (editingVendedor ? 'Actualizar Vendedor' : 'Guardar Vendedor')}
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
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '30px',
    borderBottom: '2px solid #007bff',
    paddingBottom: '10px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0 0'
  },
  toolbar: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666'
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '2px solid #dee2e6'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
  },
  tr: {
    ':hover': {
      backgroundColor: '#f8f9fa'
    }
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontStyle: 'italic'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  badgeActive: {
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  badgeInactive: {
    backgroundColor: '#f8d7da',
    color: '#721c24'
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    marginRight: '8px',
    padding: '4px 8px'
  },
  deleteBtn: {
    color: '#dc3545'
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    cursor: 'pointer'
  },
  formButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  }
};

export default Vendedores;
