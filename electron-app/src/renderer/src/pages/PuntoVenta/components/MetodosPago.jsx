import React, { useState, useEffect } from 'react';

function MetodosPago({ total, onConfirmar, onCancelar }) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [conRut, setConRut] = useState(false);
  const [rutCliente, setRutCliente] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');

  const vuelto = montoRecibido ? Math.max(0, parseFloat(montoRecibido) - total) : 0;

  const metodosPago = [
    { id: 'efectivo', nombre: 'Efectivo', icon: '💵' },
    { id: 'debito', nombre: 'Débito', icon: '💳' },
    { id: 'credito', nombre: 'Crédito', icon: '💳' },
    { id: 'transferencia', nombre: 'Transferencia', icon: '🏦' }
  ];

  const montosRapidos = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleConfirmar = () => {
    if (metodoSeleccionado === 'efectivo' && parseFloat(montoRecibido) < total) {
      alert('El monto recibido es menor al total');
      return;
    }

    const datosPago = {
      metodo: metodoSeleccionado,
      montoRecibido: metodoSeleccionado === 'efectivo' ? parseFloat(montoRecibido) : total,
      vuelto: metodoSeleccionado === 'efectivo' ? vuelto : 0,
      conRut,
      rutCliente: conRut ? rutCliente : null,
      nombreCliente: conRut ? nombreCliente : null
    };

    onConfirmar(datosPago);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Método de Pago</h3>

      {/* Métodos de Pago */}
      <div style={styles.metodosGrid}>
        {metodosPago.map(metodo => (
          <button
            key={metodo.id}
            onClick={() => setMetodoSeleccionado(metodo.id)}
            style={{
              ...styles.metodoButton,
              ...(metodoSeleccionado === metodo.id ? styles.metodoButtonActive : {})
            }}
          >
            <span style={styles.metodoIcon}>{metodo.icon}</span>
            <span style={styles.metodoNombre}>{metodo.nombre}</span>
          </button>
        ))}
      </div>

      {/* Monto Recibido (solo efectivo) */}
      {metodoSeleccionado === 'efectivo' && (
        <div style={styles.efectivoSection}>
          <label style={styles.label}>Monto Recibido</label>
          <input
            type="number"
            value={montoRecibido}
            onChange={(e) => setMontoRecibido(e.target.value)}
            placeholder="Ingrese monto..."
            style={styles.montoInput}
            autoFocus
          />

          {/* Montos Rápidos */}
          <div style={styles.montosRapidos}>
            {montosRapidos.map(monto => (
              <button
                key={monto}
                onClick={() => setMontoRecibido(monto.toString())}
                style={styles.montoRapidoButton}
              >
                ${monto.toLocaleString('es-CL')}
              </button>
            ))}
            <button
              onClick={() => setMontoRecibido(total.toString())}
              style={styles.montoRapidoButton}
            >
              Exacto
            </button>
          </div>

          {montoRecibido && (
            <div style={styles.vueltoContainer}>
              <span>Vuelto:</span>
              <span style={styles.vueltoMonto}>
                ${vuelto.toLocaleString('es-CL')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Boleta con RUT */}
      <div style={styles.rutSection}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={conRut}
            onChange={(e) => setConRut(e.target.checked)}
            style={styles.checkbox}
          />
          <span>Boleta con RUT</span>
        </label>

        {conRut && (
          <div style={styles.rutInputs}>
            <input
              type="text"
              value={rutCliente}
              onChange={(e) => setRutCliente(e.target.value)}
              placeholder="RUT (ej: 12.345.678-9)"
              style={styles.rutInput}
            />
            <input
              type="text"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              placeholder="Nombre (opcional)"
              style={styles.rutInput}
            />
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div style={styles.actions}>
        <button
          onClick={onCancelar}
          style={styles.cancelButton}
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmar}
          style={styles.confirmarButton}
          disabled={metodoSeleccionado === 'efectivo' && !montoRecibido}
        >
          ✓ Confirmar Venta
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '2px solid #0f766e',
    marginTop: '20px'
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937'
  },
  metodosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '20px'
  },
  metodoButton: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  metodoButtonActive: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa'
  },
  metodoIcon: {
    fontSize: '32px'
  },
  metodoNombre: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937'
  },
  efectivoSection: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  montoInput: {
    width: '100%',
    padding: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '20px',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '12px'
  },
  montosRapidos: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '12px'
  },
  montoRapidoButton: {
    padding: '10px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  vueltoContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#fef3c7',
    border: '2px solid #fbbf24',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '700'
  },
  vueltoMonto: {
    color: '#92400e',
    fontSize: '24px'
  },
  rutSection: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  rutInputs: {
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  rutInput: {
    padding: '10px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'white',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#4b5563',
    cursor: 'pointer'
  },
  confirmarButton: {
    flex: 2,
    padding: '14px',
    backgroundColor: '#0f766e',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default MetodosPago;
