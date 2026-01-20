import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function Empresas() {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [stats, setStats] = useState({ total: 0, activas: 0, inactivas: 0 });
  
  const [formData, setFormData] = useState({
    rut: '',
    razonSocial: '',
    nombreFantasia: '',
    giro: '',
    direccion: '',
    comuna: '',
    ciudad: '',
    region: '',
    email: '',
    telefono: '',
    estado: 'activa'
  });

  useEffect(() => {
    cargarEmpresas();
    cargarEstadisticas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      setLoading(true);
      const result = await window.api.empresas.getAll(user.id);
      if (result.success) {
        setEmpresas(result.data);
      }
    } catch (error) {
      console.error('Error cargando empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const result = await window.api.empresas.getStats(user.id);
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      cargarEmpresas();
      return;
    }

    try {
      const result = await window.api.empresas.search(user.id, searchTerm);
      if (result.success) {
        setEmpresas(result.data);
      }
    } catch (error) {
      console.error('Error buscando empresas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let result;
      if (editingEmpresa) {
        result = await window.api.empresas.update(editingEmpresa.id, formData);
      } else {
        result = await window.api.empresas.create({
          ...formData,
          contadorId: user.id
        });
      }

      if (result.success) {
        alert(result.message);
        cerrarModal();
        cargarEmpresas();
        cargarEstadisticas();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error guardando empresa:', error);
      alert('Error al guardar empresa');
    }
  };

  const handleEdit = (empresa) => {
    setEditingEmpresa(empresa);
    setFormData({
      rut: empresa.rut,
      razonSocial: empresa.razon_social,
      nombreFantasia: empresa.nombre_fantasia || '',
      giro: empresa.giro || '',
      direccion: empresa.direccion || '',
      comuna: empresa.comuna || '',
      ciudad: empresa.ciudad || '',
      region: empresa.region || '',
      email: empresa.email || '',
      telefono: empresa.telefono || '',
      estado: empresa.estado
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta empresa? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const result = await window.api.empresas.delete(id);
      if (result.success) {
        alert(result.message);
        cargarEmpresas();
        cargarEstadisticas();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error eliminando empresa:', error);
      alert('Error al eliminar empresa');
    }
  };

  const handleChangeStatus = async (id, nuevoEstado) => {
    try {
      const result = await window.api.empresas.changeStatus(id, nuevoEstado);
      if (result.success) {
        alert(result.message);
        cargarEmpresas();
        cargarEstadisticas();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar estado');
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingEmpresa(null);
    setFormData({
      rut: '',
      razonSocial: '',
      nombreFantasia: '',
      giro: '',
      direccion: '',
      comuna: '',
      ciudad: '',
      region: '',
      email: '',
      telefono: '',
      estado: 'activa'
    });
  };

  const formatRut = (rut) => {
    // Formato simple: 12.345.678-9
    if (!rut) return '';
    const clean = rut.replace(/[^0-9kK]/g, '');
    if (clean.length <= 1) return clean;
    const dv = clean.slice(-1);
    const numero = clean.slice(0, -1);
    return `${numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando empresas...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏢 Empresas Cliente</h1>
          <p style={styles.subtitle}>Gestiona las empresas que administras como contador</p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.addButton}>
          ➕ Nueva Empresa
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Empresas</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <div style={styles.statValue}>{stats.activas}</div>
            <div style={styles.statLabel}>Activas</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏸️</div>
          <div>
            <div style={styles.statValue}>{stats.inactivas}</div>
            <div style={styles.statLabel}>Inactivas</div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por RUT, razón social, nombre fantasía o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchButton}>
          🔍 Buscar
        </button>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              cargarEmpresas();
            }}
            style={styles.clearButton}
          >
            ✖️ Limpiar
          </button>
        )}
      </div>

      {/* Tabla de empresas */}
      <div style={styles.tableContainer}>
        {empresas.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🏢</div>
            <h3>No hay empresas registradas</h3>
            <p>Comienza agregando tu primera empresa cliente</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>RUT</th>
                <th style={styles.th}>Razón Social</th>
                <th style={styles.th}>Nombre Fantasía</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Teléfono</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id} style={styles.tr}>
                  <td style={styles.td}>{formatRut(empresa.rut)}</td>
                  <td style={styles.td}>{empresa.razon_social}</td>
                  <td style={styles.td}>{empresa.nombre_fantasia || '-'}</td>
                  <td style={styles.td}>{empresa.email || '-'}</td>
                  <td style={styles.td}>{empresa.telefono || '-'}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(empresa.estado === 'activa'
                          ? styles.badgeActive
                          : styles.badgeInactive)
                      }}
                    >
                      {empresa.estado === 'activa' ? '✅ Activa' : '⏸️ Inactiva'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(empresa)}
                        style={styles.editButton}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() =>
                          handleChangeStatus(
                            empresa.id,
                            empresa.estado === 'activa' ? 'inactiva' : 'activa'
                          )
                        }
                        style={styles.toggleButton}
                        title={
                          empresa.estado === 'activa' ? 'Desactivar' : 'Activar'
                        }
                      >
                        {empresa.estado === 'activa' ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleDelete(empresa.id)}
                        style={styles.deleteButton}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={cerrarModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingEmpresa ? '✏️ Editar Empresa' : '➕ Nueva Empresa'}
              </h2>
              <button onClick={cerrarModal} style={styles.closeButton}>
                ✖️
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>RUT *</label>
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) =>
                      setFormData({ ...formData, rut: e.target.value })
                    }
                    placeholder="12.345.678-9"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value })
                    }
                    style={styles.input}
                  >
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Razón Social *</label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) =>
                    setFormData({ ...formData, razonSocial: e.target.value })
                  }
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre Fantasía</label>
                <input
                  type="text"
                  value={formData.nombreFantasia}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreFantasia: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Giro</label>
                <input
                  type="text"
                  value={formData.giro}
                  onChange={(e) =>
                    setFormData({ ...formData, giro: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) =>
                    setFormData({ ...formData, direccion: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Comuna</label>
                  <input
                    type="text"
                    value={formData.comuna}
                    onChange={(e) =>
                      setFormData({ ...formData, comuna: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Ciudad</label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) =>
                      setFormData({ ...formData, ciudad: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Región</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={cerrarModal} style={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" style={styles.saveButton}>
                  {editingEmpresa ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '0'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    gap: '16px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #1e3a8a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statIcon: {
    fontSize: '32px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e3a8a'
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280'
  },
  searchContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  searchInput: {
    flex: 1,
    padding: '10px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px'
  },
  searchButton: {
    padding: '10px 20px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  clearButton: {
    padding: '10px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280'
  },
  tr: {
    borderBottom: '1px solid #f3f4f6'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#374151'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  badgeInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  toggleButton: {
    padding: '6px 12px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#9ca3af'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  form: {
    padding: '24px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#1e3a8a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default Empresas;
