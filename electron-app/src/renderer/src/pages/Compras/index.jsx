import React, { useState, useEffect } from 'react';

function Compras() {
  const [view, setView] = useState('proveedores'); // proveedores, ordenes, recepcion, cuentas
  const [proveedores, setProveedores] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [mostrarFormProveedor, setMostrarFormProveedor] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState(null);

  // Form proveedor
  const [formProveedor, setFormProveedor] = useState({
    rut: '',
    razonSocial: '',
    nombreFantasia: '',
    giro: '',
    direccion: '',
    comuna: '',
    ciudad: '',
    telefono: '',
    email: '',
    contacto: ''
  });

  useEffect(() => {
    cargarProveedores();
    cargarOrdenes();
  }, []);

  const cargarProveedores = () => {
    // Datos simulados
    setProveedores([
      {
        id: 1,
        rut: '76.123.456-7',
        razonSocial: 'Distribuidora Los Andes Ltda.',
        email: 'ventas@losandes.cl',
        telefono: '+56 2 2222 3333',
        deuda: 1250000
      },
      {
        id: 2,
        rut: '88.987.654-3',
        razonSocial: 'Comercial del Sur S.A.',
        email: 'contacto@comsur.cl',
        telefono: '+56 9 8765 4321',
        deuda: 0
      }
    ]);
  };

  const cargarOrdenes = () => {
    setOrdenes([
      {
        id: 1,
        numero: 'OC-001',
        proveedor: 'Distribuidora Los Andes',
        fecha: '2026-02-25',
        total: 500000,
        estado: 'pendiente'
      },
      {
        id: 2,
        numero: 'OC-002',
        proveedor: 'Comercial del Sur',
        fecha: '2026-02-28',
        total: 350000,
        estado: 'recibida'
      }
    ]);
  };

  const handleGuardarProveedor = () => {
    if (!formProveedor.rut || !formProveedor.razonSocial) {
      alert('Complete los campos obligatorios');
      return;
    }

    if (proveedorEdit) {
      // Editar
      setProveedores(proveedores.map(p =>
        p.id === proveedorEdit.id ? { ...proveedorEdit, ...formProveedor } : p
      ));
    } else {
      // Crear
      setProveedores([
        ...proveedores,
        { id: Date.now(), ...formProveedor, deuda: 0 }
      ]);
    }

    cerrarFormProveedor();
    alert('✅ Proveedor guardado');
  };

  const handleEditarProveedor = (proveedor) => {
    setProveedorEdit(proveedor);
    setFormProveedor(proveedor);
    setMostrarFormProveedor(true);
  };

  const handleEliminarProveedor = (id) => {
    if (confirm('¿Eliminar este proveedor?')) {
      setProveedores(proveedores.filter(p => p.id !== id));
      alert('✅ Proveedor eliminado');
    }
  };

  const cerrarFormProveedor = () => {
    setMostrarFormProveedor(false);
    setProveedorEdit(null);
    setFormProveedor({
      rut: '',
      razonSocial: '',
      nombreFantasia: '',
      giro: '',
      direccion: '',
      comuna: '',
      ciudad: '',
      telefono: '',
      email: '',
      contacto: ''
    });
  };

  // Vista Proveedores
  const renderProveedores = () => (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Lista de Proveedores</h2>
        <button
          onClick={() => setMostrarFormProveedor(true)}
          style={styles.addButton}
        >
          + Nuevo Proveedor
        </button>
      </div>

      {proveedores.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🏢</div>
          <p>No hay proveedores registrados</p>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {proveedores.map(proveedor => (
            <div key={proveedor.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{proveedor.razonSocial}</h3>
                {proveedor.deuda > 0 && (
                  <span style={styles.badgeDeuda}>
                    Deuda: ${proveedor.deuda.toLocaleString('es-CL')}
                  </span>
                )}
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>RUT:</span>
                  <span>{proveedor.rut}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>Email:</span>
                  <span>{proveedor.email}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>Teléfono:</span>
                  <span>{proveedor.telefono}</span>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button
                  onClick={() => handleEditarProveedor(proveedor)}
                  style={styles.editButton}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleEliminarProveedor(proveedor.id)}
                  style={styles.deleteButton}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Vista Órdenes de Compra
  const renderOrdenes = () => (
    <div>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Órdenes de Compra</h2>
        <button style={styles.addButton}>
          + Nueva Orden
        </button>
      </div>

      {ordenes.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📋</div>
          <p>No hay órdenes de compra</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>N° Orden</th>
                <th style={styles.th}>Proveedor</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(orden => (
                <tr key={orden.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.ordenNumero}>{orden.numero}</span>
                  </td>
                  <td style={styles.td}>{orden.proveedor}</td>
                  <td style={styles.td}>
                    {new Date(orden.fecha).toLocaleDateString('es-CL')}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.total}>
                      ${orden.total.toLocaleString('es-CL')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(orden.estado === 'recibida' ? styles.badgeRecibida : styles.badgePendiente)
                    }}>
                      {orden.estado === 'recibida' ? '✅ Recibida' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button style={styles.actionButton}>👁️</button>
                      <button style={styles.actionButton}>📄</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Vista Cuentas por Pagar
  const renderCuentasPorPagar = () => {
    const totalDeuda = proveedores.reduce((sum, p) => sum + p.deuda, 0);

    return (
      <div>
        <h2 style={styles.sectionTitle}>Cuentas por Pagar</h2>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div>
              <div style={styles.statLabel}>Deuda Total</div>
              <div style={styles.statValueRed}>
                ${totalDeuda.toLocaleString('es-CL')}
              </div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <div style={styles.statLabel}>Proveedores con Deuda</div>
              <div style={styles.statValue}>
                {proveedores.filter(p => p.deuda > 0).length}
              </div>
            </div>
          </div>
        </div>

        {proveedores.filter(p => p.deuda > 0).length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>✅</div>
            <p>No hay cuentas por pagar</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Proveedor</th>
                  <th style={styles.th}>RUT</th>
                  <th style={styles.th}>Deuda</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.filter(p => p.deuda > 0).map(proveedor => (
                  <tr key={proveedor.id} style={styles.tr}>
                    <td style={styles.td}>{proveedor.razonSocial}</td>
                    <td style={styles.td}>{proveedor.rut}</td>
                    <td style={styles.td}>
                      <span style={styles.deudaMonto}>
                        ${proveedor.deuda.toLocaleString('es-CL')}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.payButton}>
                        💳 Registrar Pago
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Modal Form Proveedor
  const renderFormProveedor = () => (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h2 style={styles.modalTitle}>
          {proveedorEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </h2>

        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>RUT *</label>
            <input
              type="text"
              value={formProveedor.rut}
              onChange={(e) => setFormProveedor({ ...formProveedor, rut: e.target.value })}
              placeholder="12.345.678-9"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Razón Social *</label>
            <input
              type="text"
              value={formProveedor.razonSocial}
              onChange={(e) => setFormProveedor({ ...formProveedor, razonSocial: e.target.value })}
              placeholder="Nombre legal de la empresa"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre Fantasía</label>
            <input
              type="text"
              value={formProveedor.nombreFantasia}
              onChange={(e) => setFormProveedor({ ...formProveedor, nombreFantasia: e.target.value })}
              placeholder="Nombre comercial"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Giro</label>
            <input
              type="text"
              value={formProveedor.giro}
              onChange={(e) => setFormProveedor({ ...formProveedor, giro: e.target.value })}
              placeholder="Actividad comercial"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroupFull}>
            <label style={styles.label}>Dirección</label>
            <input
              type="text"
              value={formProveedor.direccion}
              onChange={(e) => setFormProveedor({ ...formProveedor, direccion: e.target.value })}
              placeholder="Calle y número"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Comuna</label>
            <input
              type="text"
              value={formProveedor.comuna}
              onChange={(e) => setFormProveedor({ ...formProveedor, comuna: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Ciudad</label>
            <input
              type="text"
              value={formProveedor.ciudad}
              onChange={(e) => setFormProveedor({ ...formProveedor, ciudad: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Teléfono</label>
            <input
              type="text"
              value={formProveedor.telefono}
              onChange={(e) => setFormProveedor({ ...formProveedor, telefono: e.target.value })}
              placeholder="+56 9 1234 5678"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={formProveedor.email}
              onChange={(e) => setFormProveedor({ ...formProveedor, email: e.target.value })}
              placeholder="contacto@proveedor.cl"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroupFull}>
            <label style={styles.label}>Persona de Contacto</label>
            <input
              type="text"
              value={formProveedor.contacto}
              onChange={(e) => setFormProveedor({ ...formProveedor, contacto: e.target.value })}
              placeholder="Nombre del ejecutivo de ventas"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.modalActions}>
          <button
            onClick={cerrarFormProveedor}
            style={styles.cancelButton}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardarProveedor}
            style={styles.confirmButton}
          >
            ✓ Guardar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏭 Compras y Proveedores</h1>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setView('proveedores')}
          style={{
            ...styles.tab,
            ...(view === 'proveedores' ? styles.tabActive : {})
          }}
        >
          🏢 Proveedores
        </button>
        <button
          onClick={() => setView('ordenes')}
          style={{
            ...styles.tab,
            ...(view === 'ordenes' ? styles.tabActive : {})
          }}
        >
          📋 Órdenes de Compra
        </button>
        <button
          onClick={() => setView('cuentas')}
          style={{
            ...styles.tab,
            ...(view === 'cuentas' ? styles.tabActive : {})
          }}
        >
          💰 Cuentas por Pagar
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {view === 'proveedores' && renderProveedores()}
        {view === 'ordenes' && renderOrdenes()}
        {view === 'cuentas' && renderCuentasPorPagar()}
      </div>

      {/* Modal */}
      {mostrarFormProveedor && renderFormProveedor()}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '2px solid #e5e7eb'
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '15px',
    fontWeight: '600',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabActive: {
    color: '#0f766e',
    borderBottomColor: '#0f766e'
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    minHeight: '500px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  card: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    transition: 'all 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '2px solid #f3f4f6'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    flex: 1
  },
  badgeDeuda: {
    padding: '4px 10px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  cardBody: {
    marginBottom: '16px'
  },
  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  cardLabel: {
    fontWeight: '600',
    color: '#6b7280'
  },
  cardActions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  deleteButton: {
    flex: 1,
    padding: '8px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#991b1b',
    cursor: 'pointer'
  },
  empty: {
    textAlign: 'center',
    padding: '60px',
    color: '#9ca3af'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
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
  tr: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#1f2937'
  },
  ordenNumero: {
    fontWeight: '700',
    color: '#0f766e'
  },
  total: {
    fontWeight: '700',
    color: '#059669'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeRecibida: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  badgePendiente: {
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #e5e7eb'
  },
  statIcon: {
    fontSize: '36px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937'
  },
  statValueRed: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#dc2626'
  },
  deudaMonto: {
    fontWeight: '700',
    color: '#dc2626'
  },
  payButton: {
    padding: '8px 16px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  formGroupFull: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px'
  },
  input: {
    padding: '10px 12px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  confirmButton: {
    flex: 2,
    padding: '12px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer'
  }
};

export default Compras;
