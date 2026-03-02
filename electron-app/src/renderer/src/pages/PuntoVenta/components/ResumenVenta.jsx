import React from 'react';

function ResumenVenta({ venta, onNuevaVenta }) {
  const handleImprimir = () => {
    window.print();
  };

  const handleEnviarEmail = () => {
    alert('Función de envío por email pendiente de implementar');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Icono de éxito */}
        <div style={styles.successIcon}>✓</div>
        
        <h1 style={styles.title}>¡Venta Completada!</h1>
        
        <div style={styles.ticket}>
          <div style={styles.ticketHeader}>
            <h2 style={styles.ticketTitle}>BOLETA ELECTRÓNICA</h2>
            <div style={styles.ticketInfo}>
              <div>Folio: <strong>#12345</strong></div>
              <div>Fecha: <strong>{new Date(venta.fecha).toLocaleString('es-CL')}</strong></div>
            </div>
          </div>

          <div style={styles.ticketBody}>
            <div style={styles.items}>
              {venta.items.map((item, index) => (
                <div key={index} style={styles.item}>
                  <div style={styles.itemInfo}>
                    <div style={styles.itemNombre}>{item.nombre}</div>
                    <div style={styles.itemDetalle}>
                      {item.cantidad} x ${item.precio.toLocaleString('es-CL')}
                    </div>
                  </div>
                  <div style={styles.itemTotal}>
                    ${(item.cantidad * item.precio).toLocaleString('es-CL')}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.totales}>
              <div style={styles.totalRow}>
                <span>Subtotal:</span>
                <span>${venta.totales.subtotal.toLocaleString('es-CL')}</span>
              </div>
              <div style={styles.totalRow}>
                <span>IVA (19%):</span>
                <span>${venta.totales.iva.toLocaleString('es-CL')}</span>
              </div>
              <div style={styles.totalRowFinal}>
                <span>TOTAL:</span>
                <span>${venta.totales.total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <div style={styles.pagoInfo}>
              <div style={styles.pagoMetodo}>
                Método de pago: <strong>{venta.pago.metodo.toUpperCase()}</strong>
              </div>
              {venta.pago.metodo === 'efectivo' && (
                <>
                  <div style={styles.pagoDetalle}>
                    Recibido: ${venta.pago.montoRecibido.toLocaleString('es-CL')}
                  </div>
                  <div style={styles.pagoDetalle}>
                    Vuelto: ${venta.pago.vuelto.toLocaleString('es-CL')}
                  </div>
                </>
              )}
              {venta.pago.conRut && (
                <div style={styles.pagoDetalle}>
                  RUT Cliente: <strong>{venta.pago.rutCliente}</strong>
                </div>
              )}
            </div>
          </div>

          <div style={styles.ticketFooter}>
            <div style={styles.qrPlaceholder}>
              <div style={styles.qrCode}>QR</div>
              <div style={styles.qrText}>Escanea para validar</div>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            onClick={handleImprimir}
            style={styles.actionButton}
          >
            🖨️ Imprimir Ticket
          </button>
          <button
            onClick={handleEnviarEmail}
            style={styles.actionButton}
          >
            📧 Enviar por Email
          </button>
          <button
            onClick={onNuevaVenta}
            style={styles.primaryButton}
          >
            ➕ Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px'
  },
  content: {
    maxWidth: '600px',
    width: '100%'
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: '700',
    margin: '0 auto 24px'
  },
  title: {
    textAlign: 'center',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '32px'
  },
  ticket: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  ticketHeader: {
    backgroundColor: '#0f766e',
    color: 'white',
    padding: '24px',
    textAlign: 'center'
  },
  ticketTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    fontWeight: '700'
  },
  ticketInfo: {
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'center',
    gap: '24px'
  },
  ticketBody: {
    padding: '24px'
  },
  items: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '2px dashed #e5e7eb'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  itemInfo: {
    flex: 1
  },
  itemNombre: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  itemDetalle: {
    fontSize: '13px',
    color: '#6b7280'
  },
  itemTotal: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f766e'
  },
  totales: {
    marginBottom: '24px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    color: '#4b5563',
    marginBottom: '8px'
  },
  totalRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    paddingTop: '12px',
    borderTop: '2px solid #e5e7eb',
    marginTop: '12px'
  },
  pagoInfo: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  pagoMetodo: {
    fontSize: '15px',
    color: '#1f2937',
    marginBottom: '8px'
  },
  pagoDetalle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px'
  },
  ticketFooter: {
    backgroundColor: '#f9fafb',
    padding: '24px',
    borderTop: '2px dashed #e5e7eb'
  },
  qrPlaceholder: {
    textAlign: 'center'
  },
  qrCode: {
    width: '100px',
    height: '100px',
    backgroundColor: '#e5e7eb',
    margin: '0 auto 12px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    color: '#6b7280'
  },
  qrText: {
    fontSize: '13px',
    color: '#6b7280'
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  actionButton: {
    padding: '14px',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  primaryButton: {
    gridColumn: '1 / -1',
    padding: '16px',
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default ResumenVenta;
