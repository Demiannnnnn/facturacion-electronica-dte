import React from 'react';

function CarritoVenta({ items, onModificarCantidad, onEliminar }) {
  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>🛒</div>
        <p style={styles.emptyText}>El carrito está vacío</p>
        <p style={styles.emptySubtext}>
          Busca o escanea productos para agregar
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.itemList}>
        {items.map((item, index) => (
          <div key={item.id} style={styles.item}>
            <div style={styles.itemHeader}>
              <span style={styles.itemNumber}>{index + 1}</span>
              <div style={styles.itemInfo}>
                <div style={styles.itemName}>{item.nombre}</div>
                <div style={styles.itemCode}>{item.codigo || 'S/C'}</div>
              </div>
              <button
                onClick={() => onEliminar(item.id)}
                style={styles.deleteButton}
              >
                🗑️
              </button>
            </div>

            <div style={styles.itemFooter}>
              <div style={styles.cantidadControl}>
                <button
                  onClick={() => onModificarCantidad(item.id, item.cantidad - 1)}
                  style={styles.cantidadButton}
                >
                  −
                </button>
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) => onModificarCantidad(item.id, parseInt(e.target.value) || 0)}
                  style={styles.cantidadInput}
                  min="0"
                />
                <button
                  onClick={() => onModificarCantidad(item.id, item.cantidad + 1)}
                  style={styles.cantidadButton}
                >
                  +
                </button>
              </div>

              <div style={styles.itemPrecio}>
                <div style={styles.precioUnitario}>
                  ${(parseFloat(item.precio) || 0).toLocaleString('es-CL')} c/u
                </div>
                <div style={styles.precioTotal}>
                  ${((parseFloat(item.precio) || 0) * item.cantidad).toLocaleString('es-CL')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '16px'
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    padding: '40px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  emptySubtext: {
    fontSize: '14px',
    margin: 0
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  item: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '14px',
    border: '2px solid #e5e7eb',
    transition: 'all 0.2s'
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '12px'
  },
  itemNumber: {
    backgroundColor: '#0f766e',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '2px'
  },
  itemCode: {
    fontSize: '12px',
    color: '#6b7280'
  },
  deleteButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    borderRadius: '4px'
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb'
  },
  cantidadControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  cantidadButton: {
    width: '32px',
    height: '32px',
    border: '2px solid #0f766e',
    backgroundColor: 'white',
    color: '#0f766e',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
  },
  cantidadInput: {
    width: '50px',
    height: '32px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937'
  },
  itemPrecio: {
    textAlign: 'right'
  },
  precioUnitario: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '2px'
  },
  precioTotal: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f766e'
  }
};

export default CarritoVenta;
