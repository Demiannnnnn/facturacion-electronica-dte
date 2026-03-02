import React, { useState, useEffect } from 'react';

function Caja() {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [cajaActual, setCajaActual] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [mostrarApertura, setMostrarApertura] = useState(false);
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [mostrarMovimiento, setMostrarMovimiento] = useState(false);

  // Estados para apertura
  const [montoInicial, setMontoInicial] = useState('');
  const [observacionesApertura, setObservacionesApertura] = useState('');

  // Estados para movimiento
  const [tipoMovimiento, setTipoMovimiento] = useState('ingreso');
  const [montoMovimiento, setMontoMovimiento] = useState('');
  const [conceptoMovimiento, setConceptoMovimiento] = useState('');

  // Estados para cierre
  const [arqueoEfectivo, setArqueoEfectivo] = useState({
    billetes100000: 0,
    billetes50000: 0,
    billetes20000: 0,
    billetes10000: 0,
    billetes5000: 0,
    billetes2000: 0,
    billetes1000: 0,
    monedas500: 0,
    monedas100: 0,
    monedas50: 0,
    monedas10: 0
  });

  useEffect(() => {
    verificarEstadoCaja();
    cargarMovimientos();
  }, []);

  const verificarEstadoCaja = () => {
    // Simular verificación
    // const cajaAbierta = localStorage.getItem('caja_abierta');
    setCajaAbierta(false);
  };

  const cargarMovimientos = () => {
    // Simular carga de movimientos
    setMovimientos([]);
  };

  const handleAbrirCaja = () => {
    if (!montoInicial || parseFloat(montoInicial) < 0) {
      alert('Ingrese un monto inicial válido');
      return;
    }

    const nuevaCaja = {
      id: Date.now(),
      fechaApertura: new Date().toISOString(),
      montoInicial: parseFloat(montoInicial),
      observacionesApertura,
      usuario: 'Usuario Actual'
    };

    setCajaActual(nuevaCaja);
    setCajaAbierta(true);
    setMostrarApertura(false);
    setMontoInicial('');
    setObservacionesApertura('');
    
    alert('✅ Caja abierta exitosamente');
  };

  const handleRegistrarMovimiento = () => {
    if (!montoMovimiento || !conceptoMovimiento) {
      alert('Complete todos los campos');
      return;
    }

    const nuevoMovimiento = {
      id: Date.now(),
      tipo: tipoMovimiento,
      monto: parseFloat(montoMovimiento),
      concepto: conceptoMovimiento,
      fecha: new Date().toISOString()
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);
    setMostrarMovimiento(false);
    setMontoMovimiento('');
    setConceptoMovimiento('');
    
    alert('✅ Movimiento registrado');
  };

  const calcularTotalArqueo = () => {
    return (
      arqueoEfectivo.billetes100000 * 100000 +
      arqueoEfectivo.billetes50000 * 50000 +
      arqueoEfectivo.billetes20000 * 20000 +
      arqueoEfectivo.billetes10000 * 10000 +
      arqueoEfectivo.billetes5000 * 5000 +
      arqueoEfectivo.billetes2000 * 2000 +
      arqueoEfectivo.billetes1000 * 1000 +
      arqueoEfectivo.monedas500 * 500 +
      arqueoEfectivo.monedas100 * 100 +
      arqueoEfectivo.monedas50 * 50 +
      arqueoEfectivo.monedas10 * 10
    );
  };

  const calcularSaldoSistema = () => {
    if (!cajaActual) return 0;
    
    const ingresos = movimientos
      .filter(m => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0);
    
    const egresos = movimientos
      .filter(m => m.tipo === 'egreso')
      .reduce((sum, m) => sum + m.monto, 0);
    
    return cajaActual.montoInicial + ingresos - egresos;
  };

  const handleCerrarCaja = () => {
    const saldoSistema = calcularSaldoSistema();
    const saldoFisico = calcularTotalArqueo();
    const diferencia = saldoFisico - saldoSistema;

    const confirmacion = confirm(
      `Saldo Sistema: $${saldoSistema.toLocaleString('es-CL')}\n` +
      `Saldo Físico: $${saldoFisico.toLocaleString('es-CL')}\n` +
      `Diferencia: $${diferencia.toLocaleString('es-CL')}\n\n` +
      `¿Confirmar cierre de caja?`
    );

    if (confirmacion) {
      setCajaAbierta(false);
      setCajaActual(null);
      setMovimientos([]);
      setMostrarCierre(false);
      setArqueoEfectivo({
        billetes100000: 0,
        billetes50000: 0,
        billetes20000: 0,
        billetes10000: 0,
        billetes5000: 0,
        billetes2000: 0,
        billetes1000: 0,
        monedas500: 0,
        monedas100: 0,
        monedas50: 0,
        monedas10: 0
      });
      
      alert('✅ Caja cerrada exitosamente');
    }
  };

  if (!cajaAbierta && !mostrarApertura) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💰</div>
          <h2 style={styles.emptyTitle}>Caja Cerrada</h2>
          <p style={styles.emptyText}>
            Debes abrir la caja para comenzar a operar
          </p>
          <button
            onClick={() => setMostrarApertura(true)}
            style={styles.abrirCajaButton}
          >
            🔓 Abrir Caja
          </button>
        </div>
      </div>
    );
  }

  if (mostrarApertura) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <h2 style={styles.modalTitle}>Apertura de Caja</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Monto Inicial *</label>
            <input
              type="number"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              placeholder="Ingrese monto inicial en efectivo"
              style={styles.input}
              autoFocus
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Observaciones</label>
            <textarea
              value={observacionesApertura}
              onChange={(e) => setObservacionesApertura(e.target.value)}
              placeholder="Observaciones opcionales..."
              style={styles.textarea}
              rows="3"
            />
          </div>

          <div style={styles.modalActions}>
            <button
              onClick={() => setMostrarApertura(false)}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              onClick={handleAbrirCaja}
              style={styles.confirmButton}
            >
              ✓ Abrir Caja
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mostrarCierre) {
    const saldoSistema = calcularSaldoSistema();
    const saldoFisico = calcularTotalArqueo();
    const diferencia = saldoFisico - saldoSistema;

    return (
      <div style={styles.container}>
        <div style={styles.modalWide}>
          <h2 style={styles.modalTitle}>Cierre de Caja - Arqueo</h2>

          <div style={styles.arqueoGrid}>
            {/* Billetes */}
            <div style={styles.arqueoSection}>
              <h3 style={styles.arqueoSectionTitle}>💵 Billetes</h3>
              {[
                { denom: '100000', label: '$100.000' },
                { denom: '50000', label: '$50.000' },
                { denom: '20000', label: '$20.000' },
                { denom: '10000', label: '$10.000' },
                { denom: '5000', label: '$5.000' },
                { denom: '2000', label: '$2.000' },
                { denom: '1000', label: '$1.000' }
              ].map(item => (
                <div key={item.denom} style={styles.arqueoItem}>
                  <label style={styles.arqueoLabel}>{item.label}</label>
                  <input
                    type="number"
                    value={arqueoEfectivo[`billetes${item.denom}`]}
                    onChange={(e) => setArqueoEfectivo({
                      ...arqueoEfectivo,
                      [`billetes${item.denom}`]: parseInt(e.target.value) || 0
                    })}
                    style={styles.arqueoInput}
                    min="0"
                  />
                  <span style={styles.arqueoTotal}>
                    ${(arqueoEfectivo[`billetes${item.denom}`] * parseInt(item.denom)).toLocaleString('es-CL')}
                  </span>
                </div>
              ))}
            </div>

            {/* Monedas */}
            <div style={styles.arqueoSection}>
              <h3 style={styles.arqueoSectionTitle}>🪙 Monedas</h3>
              {[
                { denom: '500', label: '$500' },
                { denom: '100', label: '$100' },
                { denom: '50', label: '$50' },
                { denom: '10', label: '$10' }
              ].map(item => (
                <div key={item.denom} style={styles.arqueoItem}>
                  <label style={styles.arqueoLabel}>{item.label}</label>
                  <input
                    type="number"
                    value={arqueoEfectivo[`monedas${item.denom}`]}
                    onChange={(e) => setArqueoEfectivo({
                      ...arqueoEfectivo,
                      [`monedas${item.denom}`]: parseInt(e.target.value) || 0
                    })}
                    style={styles.arqueoInput}
                    min="0"
                  />
                  <span style={styles.arqueoTotal}>
                    ${(arqueoEfectivo[`monedas${item.denom}`] * parseInt(item.denom)).toLocaleString('es-CL')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.cierreResumen}>
            <div style={styles.cierreRow}>
              <span>Saldo en Sistema:</span>
              <span style={styles.saldoSistema}>
                ${saldoSistema.toLocaleString('es-CL')}
              </span>
            </div>
            <div style={styles.cierreRow}>
              <span>Saldo Físico (Arqueo):</span>
              <span style={styles.saldoFisico}>
                ${saldoFisico.toLocaleString('es-CL')}
              </span>
            </div>
            <div style={styles.cierreRowFinal}>
              <span>Diferencia:</span>
              <span style={{
                ...styles.diferencia,
                color: diferencia === 0 ? '#10b981' : diferencia > 0 ? '#059669' : '#dc2626'
              }}>
                ${Math.abs(diferencia).toLocaleString('es-CL')}
                {diferencia > 0 && ' (Sobrante)'}
                {diferencia < 0 && ' (Faltante)'}
              </span>
            </div>
          </div>

          <div style={styles.modalActions}>
            <button
              onClick={() => setMostrarCierre(false)}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              onClick={handleCerrarCaja}
              style={styles.confirmButton}
            >
              ✓ Cerrar Caja
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mostrarMovimiento) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <h2 style={styles.modalTitle}>Registrar Movimiento</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo de Movimiento *</label>
            <div style={styles.tipoButtons}>
              <button
                onClick={() => setTipoMovimiento('ingreso')}
                style={{
                  ...styles.tipoButton,
                  ...(tipoMovimiento === 'ingreso' ? styles.tipoButtonActive : {})
                }}
              >
                💰 Ingreso
              </button>
              <button
                onClick={() => setTipoMovimiento('egreso')}
                style={{
                  ...styles.tipoButton,
                  ...(tipoMovimiento === 'egreso' ? styles.tipoButtonActive : {})
                }}
              >
                💸 Egreso
              </button>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Monto *</label>
            <input
              type="number"
              value={montoMovimiento}
              onChange={(e) => setMontoMovimiento(e.target.value)}
              placeholder="Ingrese monto"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Concepto *</label>
            <textarea
              value={conceptoMovimiento}
              onChange={(e) => setConceptoMovimiento(e.target.value)}
              placeholder="Descripción del movimiento"
              style={styles.textarea}
              rows="3"
            />
          </div>

          <div style={styles.modalActions}>
            <button
              onClick={() => setMostrarMovimiento(false)}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              onClick={handleRegistrarMovimiento}
              style={styles.confirmButton}
            >
              ✓ Registrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal con caja abierta
  const saldoActual = calcularSaldoSistema();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>💰 Gestión de Caja</h1>
          <p style={styles.subtitle}>
            Caja abierta desde: {new Date(cajaActual?.fechaApertura).toLocaleString('es-CL')}
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => setMostrarMovimiento(true)}
            style={styles.actionButton}
          >
            📝 Movimiento
          </button>
          <button
            onClick={() => setMostrarCierre(true)}
            style={styles.closeButton}
          >
            🔒 Cerrar Caja
          </button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💵</div>
          <div>
            <div style={styles.statLabel}>Monto Inicial</div>
            <div style={styles.statValue}>
              ${cajaActual?.montoInicial.toLocaleString('es-CL')}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div>
            <div style={styles.statLabel}>Ingresos</div>
            <div style={styles.statValueGreen}>
              ${movimientos
                .filter(m => m.tipo === 'ingreso')
                .reduce((sum, m) => sum + m.monto, 0)
                .toLocaleString('es-CL')}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📉</div>
          <div>
            <div style={styles.statLabel}>Egresos</div>
            <div style={styles.statValueRed}>
              ${movimientos
                .filter(m => m.tipo === 'egreso')
                .reduce((sum, m) => sum + m.monto, 0)
                .toLocaleString('es-CL')}
            </div>
          </div>
        </div>

        <div style={styles.statCardHighlight}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <div style={styles.statLabel}>Saldo Actual</div>
            <div style={styles.statValueLarge}>
              ${saldoActual.toLocaleString('es-CL')}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.movimientosSection}>
        <h2 style={styles.sectionTitle}>Movimientos del Día</h2>
        
        {movimientos.length === 0 ? (
          <div style={styles.noMovimientos}>
            <div style={styles.noMovimientosIcon}>📋</div>
            <p>No hay movimientos registrados</p>
          </div>
        ) : (
          <div style={styles.movimientosList}>
            {movimientos.map(mov => (
              <div key={mov.id} style={styles.movimientoItem}>
                <div style={styles.movimientoIcon}>
                  {mov.tipo === 'ingreso' ? '💰' : '💸'}
                </div>
                <div style={styles.movimientoInfo}>
                  <div style={styles.movimientoConcepto}>{mov.concepto}</div>
                  <div style={styles.movimientoFecha}>
                    {new Date(mov.fecha).toLocaleString('es-CL')}
                  </div>
                </div>
                <div style={{
                  ...styles.movimientoMonto,
                  color: mov.tipo === 'ingreso' ? '#059669' : '#dc2626'
                }}>
                  {mov.tipo === 'ingreso' ? '+' : '-'}
                  ${mov.monto.toLocaleString('es-CL')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  actionButton: {
    padding: '10px 20px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  closeButton: {
    padding: '10px 20px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '500px',
    margin: '40px auto'
  },
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px'
  },
  abrirCajaButton: {
    padding: '14px 32px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '500px',
    margin: '40px auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  modalWide: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '800px',
    margin: '40px auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '15px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  tipoButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  tipoButton: {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tipoButtonActive: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
    color: '#0f766e'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px'
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
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statCardHighlight: {
    backgroundColor: '#0f766e',
    color: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)'
  },
  statIcon: {
    fontSize: '40px'
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
  statValueGreen: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#059669'
  },
  statValueRed: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#dc2626'
  },
  statValueLarge: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white'
  },
  movimientosSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px'
  },
  noMovimientos: {
    textAlign: 'center',
    padding: '40px',
    color: '#9ca3af'
  },
  noMovimientosIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  movimientosList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  movimientoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  movimientoIcon: {
    fontSize: '32px'
  },
  movimientoInfo: {
    flex: 1
  },
  movimientoConcepto: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  movimientoFecha: {
    fontSize: '13px',
    color: '#6b7280'
  },
  movimientoMonto: {
    fontSize: '20px',
    fontWeight: '700'
  },
  arqueoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '24px'
  },
  arqueoSection: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px'
  },
  arqueoSectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#1f2937'
  },
  arqueoItem: {
    display: 'grid',
    gridTemplateColumns: '100px 80px 1fr',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  arqueoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563'
  },
  arqueoInput: {
    padding: '8px',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '600'
  },
  arqueoTotal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f766e',
    textAlign: 'right'
  },
  cierreResumen: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  cierreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '15px',
    color: '#4b5563'
  },
  cierreRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: '2px solid #e5e7eb',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937'
  },
  saldoSistema: {
    fontWeight: '700',
    color: '#3b82f6'
  },
  saldoFisico: {
    fontWeight: '700',
    color: '#8b5cf6'
  },
  diferencia: {
    fontSize: '24px',
    fontWeight: '700'
  }
};

export default Caja;
