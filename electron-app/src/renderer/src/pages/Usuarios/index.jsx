import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function Usuarios() {
  const { user, canAccessUsuarios, isOwner } = useAuth();
  const [view, setView] = useState('list');
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    rut: '',
    rol: 'vendedor',
    activo: 1
  });

  useEffect(() => {
    if (canAccessUsuarios && !canAccessUsuarios()) {
      setError('No tienes permisos para acceder a esta sección');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usuariosResult, rolesResult] = await Promise.all([
        window.api.usuarios.getAll(),
        window.api.roles.getAll()
      ]);

      if (Array.isArray(usuariosResult)) {
        setUsuarios(usuariosResult);
      } else if (usuariosResult.error) {
        setError(usuariosResult.error);
      }

      if (Array.isArray(rolesResult)) {
        setRoles(rolesResult);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar datos');
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
    setSuccess('');
    setIsLoading(true);

    // Validaciones
    if (!formData.email || !formData.email.includes('@')) {
      setError('Email válido es requerido');
      setIsLoading(false);
      return;
    }

    if (!editingUsuario && (!formData.password || formData.password.length < 8)) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      let result;
      if (editingUsuario) {
        result = await window.api.usuarios.update({
          id: editingUsuario.id,
          email: formData.email,
          nombre: formData.nombre,
          rut: formData.rut,
          rol: formData.rol,
          activo: formData.activo
        });
      } else {
        result = await window.api.usuarios.create(formData);
      }

      if (result.success) {
        setSuccess(editingUsuario ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
        await loadData();
        handleCancel();
      } else {
        setError(result.error || 'Error al guardar usuario');
      }
    } catch (error) {
      console.error('Error saving usuario:', error);
      setError('Error al guardar usuario');
    }

    setIsLoading(false);
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      email: usuario.email,
      password: '',
      nombre: usuario.nombre || '',
      rut: usuario.rut || '',
      rol: usuario.rol,
      activo: usuario.activo
    });
    setView('form');
  };

  const handleToggleActive = async (usuario) => {
    if (!confirm(`¿Estás seguro de ${usuario.activo ? 'desactivar' : 'activar'} al usuario "${usuario.email}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.api.usuarios.toggleActive({
        id: usuario.id,
        activo: !usuario.activo,
        requestedBy: user.id
      });

      if (result.success) {
        setSuccess(`Usuario ${!usuario.activo ? 'activado' : 'desactivado'} correctamente`);
        await loadData();
      } else {
        setError(result.error || 'Error al cambiar estado del usuario');
      }
    } catch (error) {
      console.error('Error toggling usuario:', error);
      setError('Error al cambiar estado del usuario');
    }
    setIsLoading(false);
  };

  const handleDelete = async (usuario) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${usuario.email}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.api.usuarios.delete({
        id: usuario.id,
        requestedBy: user.id
      });

      if (result.success) {
        setSuccess('Usuario eliminado correctamente');
        await loadData();
      } else {
        setError(result.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error deleting usuario:', error);
      setError('Error al eliminar usuario');
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setView('list');
    setEditingUsuario(null);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      nombre: '',
      rut: '',
      rol: 'vendedor',
      activo: 1
    });
  };

  const getRolColor = (rol) => {
    switch (rol) {
      case 'dueño': return '#d32f2f';
      case 'administrador': return '#f57c00';
      case 'vendedor': return '#1976d2';
      case 'cajero': return '#0288d1';
      case 'contador': return '#388e3c';
      default: return '#757575';
    }
  };

  if (canAccessUsuarios && !canAccessUsuarios()) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          ❌ No tienes permisos para acceder a esta sección
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Gestión de Usuarios</h1>
        <p style={styles.subtitle}>Administra usuarios y sus permisos</p>
      </div>

      {error && (
        <div style={styles.error}>
          ❌ {error}
          <button onClick={() => setError('')} style={styles.closeBtn}>×</button>
        </div>
      )}

      {success && (
        <div style={styles.success}>
          ✅ {success}
          <button onClick={() => setSuccess('')} style={styles.closeBtn}>×</button>
        </div>
      )}

      {view === 'list' ? (
        <>
          <div style={styles.toolbar}>
            <button
              onClick={() => setView('form')}
              style={styles.addButton}
            >
              + Nuevo Usuario
            </button>
          </div>

          {isLoading && <div style={styles.loading}>Cargando...</div>}

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>RUT</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Último Acceso</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyMessage}>
                      {isLoading ? 'Cargando...' : 'No hay usuarios registrados. Haz clic en "Nuevo Usuario" para comenzar.'}
                    </td>
                  </tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id} style={styles.tr}>
                      <td style={styles.td}>{usuario.email}</td>
                      <td style={styles.td}>{usuario.nombre || '-'}</td>
                      <td style={styles.td}>{usuario.rut || '-'}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: getRolColor(usuario.rol),
                          color: 'white'
                        }}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          ...(usuario.activo ? styles.badgeActive : styles.badgeInactive)
                        }}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {usuario.ultimo_acceso 
                          ? new Date(usuario.ultimo_acceso).toLocaleDateString() 
                          : 'Nunca'}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleEdit(usuario)}
                          style={styles.actionBtn}
                          title="Editar usuario"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleActive(usuario)}
                          style={styles.actionBtn}
                          title={usuario.activo ? 'Desactivar' : 'Activar'}
                        >
                          {usuario.activo ? '🔒' : '🔓'}
                        </button>
                        {isOwner && isOwner() && usuario.id !== user.id && (
                          <button
                            onClick={() => handleDelete(usuario)}
                            style={{...styles.actionBtn, ...styles.deleteBtn}}
                            title="Eliminar usuario"
                          >
                            🗑️
                          </button>
                        )}
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
            {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="usuario@empresa.cl"
                  required
                />
              </div>
              {!editingUsuario && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contraseña *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    required={!editingUsuario}
                    minLength="8"
                  />
                </div>
              )}
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Nombre completo del usuario"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>RUT</label>
                <input
                  type="text"
                  name="rut"
                  value={formData.rut}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="12345678-9"
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rol *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                >
                  {roles.map((rol) => (
                    <option key={rol.nombre} value={rol.nombre}>
                      {rol.nombre} - {rol.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              {editingUsuario && (
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
                    Usuario activo
                  </label>
                </div>
              )}
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
                {isLoading ? 'Guardando...' : (editingUsuario ? 'Actualizar Usuario' : 'Crear Usuario')}
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
  errorBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '20px',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '16px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #c3e6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 8px'
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
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '14px'
  },
  tr: {
    transition: 'background-color 0.2s'
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
    fontWeight: 'bold',
    display: 'inline-block'
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

export default Usuarios;
