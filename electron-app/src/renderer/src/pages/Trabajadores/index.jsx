import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function Trabajadores() {
  const { user, canAccessUsuarios } = useAuth();
  const [trabajadores, setTrabajadores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
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
        setTrabajadores(usuariosResult);
      } else if (usuariosResult.error) {
        setError(usuariosResult.error);
      }

      if (Array.isArray(rolesResult)) {
        setRoles(rolesResult);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar datos de trabajadores');
    }
    setIsLoading(false);
  };

  const getRolNombre = (rolId) => {
    const rol = roles.find(r => r.id === rolId);
    return rol ? rol.nombre : rolId;
  };

  const filteredTrabajadores = filtroRol === 'todos' 
    ? trabajadores 
    : trabajadores.filter(t => t.rol === filtroRol);

  const stats = {
    total: trabajadores.length,
    activos: trabajadores.filter(t => t.activo === 1).length,
    inactivos: trabajadores.filter(t => t.activo === 0).length
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Gestión de Trabajadores</h1>
        <p style={styles.subtitle}>Visualiza todos tus trabajadores registrados en el sistema</p>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total Trabajadores</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statNumber, color: '#28a745'}}>{stats.activos}</div>
          <div style={styles.statLabel}>Activos</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statNumber, color: '#dc3545'}}>{stats.inactivos}</div>
          <div style={styles.statLabel}>Inactivos</div>
        </div>
      </div>

      {/* Filtro */}
      <div style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filtrar por rol:</label>
          <select 
            value={filtroRol} 
            onChange={(e) => setFiltroRol(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="todos">Todos los roles</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.id}>{rol.nombre}</option>
            ))}
          </select>
        </div>
        <button onClick={loadData} style={styles.refreshButton}>
          🔄 Actualizar
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {isLoading && <div style={styles.loading}>Cargando...</div>}

      {/* Tabla de Trabajadores */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>RUT</th>
              <th style={styles.th}>Rol</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrabajadores.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyMessage}>
                  {isLoading ? 'Cargando...' : 'No hay trabajadores registrados.'}
                </td>
              </tr>
            ) : (
              filteredTrabajadores.map((trabajador) => (
                <tr key={trabajador.id} style={styles.tr}>
                  <td style={styles.td}>{trabajador.nombre || '-'}</td>
                  <td style={styles.td}>{trabajador.email || '-'}</td>
                  <td style={styles.td}>{trabajador.rut || '-'}</td>
                  <td style={styles.td}>{getRolNombre(trabajador.rol)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(trabajador.activo ? styles.badgeActive : styles.badgeInactive)
                    }}>
                      {trabajador.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {trabajador.created_at 
                      ? new Date(trabajador.created_at).toLocaleDateString('es-CL') 
                      : '-'
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.infoBox}>
        <p style={styles.infoText}>
          💡 <strong>Nota:</strong> Para crear nuevos trabajadores, accede a la sección de <strong>Configuración → Usuarios</strong>
        </p>
      </div>
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
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    border: '1px solid #e0e0e0'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '10px 0'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  toolbar: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  filterLabel: {
    fontWeight: '500',
    color: '#333'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
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
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb'
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
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
  infoBox: {
    backgroundColor: '#e7f3ff',
    border: '1px solid #b3d9ff',
    borderRadius: '4px',
    padding: '15px',
    marginTop: '20px'
  },
  infoText: {
    color: '#004085',
    margin: 0,
    fontSize: '14px'
  }
};

export default Trabajadores;
