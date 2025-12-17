import { useState, useEffect } from 'react';
import './CuentasPorCobrar.css';

export default function CuentasPorCobrar() {
    const [activeTab, setActiveTab] = useState('pendientes');
    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPagoModal, setShowPagoModal] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState(null);
    const [pagoData, setPagoData] = useState({
        monto: '',
        metodoPago: 'efectivo',
        referencia: '',
        notas: ''
    });
    const [estadoCuenta, setEstadoCuenta] = useState(null);
    const [selectedCliente, setSelectedCliente] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const facturasResponse = await window.api.facturas.getAll();
            const clientesResponse = await window.api.clientes.getAll();

            // Verificar que las respuestas sean exitosas
            if (!facturasResponse.success || !clientesResponse.success) {
                throw new Error('Error al obtener datos del servidor');
            }

            const allFacturas = facturasResponse.data || [];
            const allClientes = clientesResponse.data || [];
            setClientes(allClientes);

            // Filtrar facturas según la pestaña activa
            let filtered = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch (activeTab) {
                case 'pendientes':
                    filtered = allFacturas.filter(f => f.estado_pago === 'pendiente' || f.estado_pago === 'parcial');
                    break;
                case 'vencidas':
                    filtered = allFacturas.filter(f => {
                        if (f.estado_pago === 'pagada') return false;
                        const fechaVencimiento = new Date(f.fecha_vencimiento);
                        return fechaVencimiento < today;
                    });
                    break;
                case 'pagadas':
                    filtered = allFacturas.filter(f => f.estado_pago === 'pagada');
                    break;
                case 'estado':
                    // Para estado de cuenta, no filtramos aquí
                    filtered = allFacturas;
                    break;
            }

            setFacturas(filtered);
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error al cargar datos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistrarPago = (factura) => {
        setSelectedFactura(factura);
        const saldoPendiente = factura.total - (factura.monto_pagado || 0);
        setPagoData({
            monto: saldoPendiente.toString(),
            metodoPago: 'efectivo',
            referencia: '',
            notas: ''
        });
        setShowPagoModal(true);
    };

    const handleSubmitPago = async (e) => {
        e.preventDefault();

        const monto = parseFloat(pagoData.monto);
        if (isNaN(monto) || monto <= 0) {
            alert('Ingrese un monto válido');
            return;
        }

        const saldoPendiente = selectedFactura.total - (selectedFactura.monto_pagado || 0);
        if (monto > saldoPendiente) {
            alert(`El monto no puede ser mayor al saldo pendiente ($${saldoPendiente.toLocaleString('es-CL')})`);
            return;
        }

        try {
            const response = await window.api.pagos.create({
                factura_id: selectedFactura.id,
                monto: monto,
                forma_pago: pagoData.metodoPago,
                referencia: pagoData.referencia,
                observaciones: pagoData.notas,
                fecha_pago: new Date().toISOString().split('T')[0]
            });

            if (!response.success) {
                throw new Error(response.error || 'Error al registrar pago');
            }

            alert('Pago registrado exitosamente');
            setShowPagoModal(false);
            loadData();
        } catch (error) {
            console.error('Error registering payment:', error);
            alert('Error al registrar pago: ' + error.message);
        }
    };

    const handleVerPagos = async (factura) => {
        try {
            const response = await window.api.pagos.getByFactura(factura.id);

            if (!response.success) {
                throw new Error(response.error || 'Error al cargar pagos');
            }

            const pagos = response.data || [];

            if (pagos.length === 0) {
                alert('Esta factura no tiene pagos registrados');
                return;
            }

            let mensaje = `Pagos de Factura ${factura.folio}:\n\n`;
            pagos.forEach((pago, index) => {
                mensaje += `${index + 1}. Fecha: ${new Date(pago.fecha_pago).toLocaleDateString('es-CL')}\n`;
                mensaje += `   Monto: $${pago.monto.toLocaleString('es-CL')}\n`;
                mensaje += `   Método: ${pago.forma_pago}\n`;
                if (pago.referencia) mensaje += `   Referencia: ${pago.referencia}\n`;
                if (pago.observaciones) mensaje += `   Notas: ${pago.observaciones}\n`;
                mensaje += '\n';
            });

            alert(mensaje);
        } catch (error) {
            console.error('Error loading payments:', error);
            alert('Error al cargar pagos: ' + error.message);
        }
    };

    const handleLoadEstadoCuenta = async () => {
        if (!selectedCliente) {
            alert('Seleccione un cliente');
            return;
        }

        setLoading(true);
        try {
            const response = await window.api.pagos.getEstadoCuenta(parseInt(selectedCliente));

            if (!response.success) {
                throw new Error(response.error || 'Error al cargar estado de cuenta');
            }

            setEstadoCuenta(response.data);
        } catch (error) {
            console.error('Error loading account status:', error);
            alert('Error al cargar estado de cuenta: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (factura) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fechaVencimiento = new Date(factura.fecha_vencimiento);
        const isVencida = fechaVencimiento < today && factura.estado_pago !== 'pagada';

        if (factura.estado_pago === 'pagada') {
            return <span className="badge badge-success">Pagada</span>;
        } else if (factura.estado_pago === 'parcial') {
            return <span className="badge badge-warning">Pago Parcial</span>;
        } else if (isVencida) {
            return <span className="badge badge-danger">Vencida</span>;
        } else {
            return <span className="badge badge-info">Pendiente</span>;
        }
    };

    const renderTabContent = () => {
        if (activeTab === 'estado') {
            return (
                <div className="estado-cuenta-container">
                    <div className="selector-cliente">
                        <label>Seleccionar Cliente:</label>
                        <select
                            value={selectedCliente}
                            onChange={(e) => setSelectedCliente(e.target.value)}
                            className="form-select"
                        >
                            <option value="">-- Seleccione un cliente --</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.razon_social} - {cliente.rut}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleLoadEstadoCuenta} className="btn-primary">
                            Consultar Estado
                        </button>
                    </div>

                    {estadoCuenta && (
                        <div className="estado-cuenta-result">
                            <div className="estado-header">
                                <h3>{estadoCuenta.cliente.razon_social}</h3>
                                <p>RUT: {estadoCuenta.cliente.rut}</p>
                            </div>

                            <div className="estado-resumen">
                                <div className="resumen-card">
                                    <span className="label">Total Facturado:</span>
                                    <span className="value">${estadoCuenta.resumen.total_facturado.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="resumen-card">
                                    <span className="label">Total Pagado:</span>
                                    <span className="value success">${estadoCuenta.resumen.total_pagado.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="resumen-card">
                                    <span className="label">Saldo Pendiente:</span>
                                    <span className="value danger">${estadoCuenta.resumen.saldo_pendiente.toLocaleString('es-CL')}</span>
                                </div>
                            </div>

                            <div className="facturas-detalle">
                                <h4>Detalle de Facturas</h4>
                                <table className="facturas-table">
                                    <thead>
                                        <tr>
                                            <th>Folio</th>
                                            <th>Fecha</th>
                                            <th>Vencimiento</th>
                                            <th>Total</th>
                                            <th>Pagado</th>
                                            <th>Saldo</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estadoCuenta.facturas.map(factura => {
                                            const saldo = factura.total - (factura.monto_pagado || 0);
                                            return (
                                                <tr key={factura.id}>
                                                    <td>{factura.folio}</td>
                                                    <td>{new Date(factura.fecha_emision).toLocaleDateString('es-CL')}</td>
                                                    <td>{new Date(factura.fecha_vencimiento).toLocaleDateString('es-CL')}</td>
                                                    <td>${factura.total.toLocaleString('es-CL')}</td>
                                                    <td>${(factura.monto_pagado || 0).toLocaleString('es-CL')}</td>
                                                    <td>${saldo.toLocaleString('es-CL')}</td>
                                                    <td>{getEstadoBadge(factura)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="facturas-list">
                {loading ? (
                    <div className="loading">Cargando...</div>
                ) : facturas.length === 0 ? (
                    <div className="empty-state">No hay facturas en esta categoría</div>
                ) : (
                    <table className="facturas-table">
                        <thead>
                            <tr>
                                <th>Folio</th>
                                <th>Cliente</th>
                                <th>Fecha Emisión</th>
                                <th>Vencimiento</th>
                                <th>Total</th>
                                <th>Pagado</th>
                                <th>Saldo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facturas.map(factura => {
                                const saldo = factura.total - (factura.monto_pagado || 0);
                                return (
                                    <tr key={factura.id}>
                                        <td>{factura.folio}</td>
                                        <td>{factura.cliente_razon_social}</td>
                                        <td>{new Date(factura.fecha_emision).toLocaleDateString('es-CL')}</td>
                                        <td>{new Date(factura.fecha_vencimiento).toLocaleDateString('es-CL')}</td>
                                        <td>${factura.total.toLocaleString('es-CL')}</td>
                                        <td>${(factura.monto_pagado || 0).toLocaleString('es-CL')}</td>
                                        <td>${saldo.toLocaleString('es-CL')}</td>
                                        <td>{getEstadoBadge(factura)}</td>
                                        <td className="actions">
                                            {factura.estado_pago !== 'pagada' && (
                                                <button
                                                    onClick={() => handleRegistrarPago(factura)}
                                                    className="btn-action btn-primary"
                                                    title="Registrar Pago"
                                                >
                                                    💰
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleVerPagos(factura)}
                                                className="btn-action btn-secondary"
                                                title="Ver Pagos"
                                            >
                                                📋
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    return (
        <div className="cuentas-por-cobrar">
            <div className="page-header">
                <h1>💰 Cuentas por Cobrar</h1>
                <p>Gestión de pagos y estado de cuenta de clientes</p>
            </div>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'pendientes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pendientes')}
                >
                    📋 Pendientes
                </button>
                <button
                    className={`tab ${activeTab === 'vencidas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vencidas')}
                >
                    ⚠️ Vencidas
                </button>
                <button
                    className={`tab ${activeTab === 'pagadas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pagadas')}
                >
                    ✅ Pagadas
                </button>
                <button
                    className={`tab ${activeTab === 'estado' ? 'active' : ''}`}
                    onClick={() => setActiveTab('estado')}
                >
                    📊 Estado de Cuenta
                </button>
            </div>

            <div className="tab-content">
                {renderTabContent()}
            </div>

            {/* Modal de Registro de Pago */}
            {showPagoModal && (
                <div className="modal-overlay" onClick={() => setShowPagoModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Registrar Pago</h2>
                            <button className="close-btn" onClick={() => setShowPagoModal(false)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="factura-info">
                                <p><strong>Factura:</strong> {selectedFactura?.folio}</p>
                                <p><strong>Cliente:</strong> {selectedFactura?.cliente_razon_social}</p>
                                <p><strong>Total:</strong> ${selectedFactura?.total.toLocaleString('es-CL')}</p>
                                <p><strong>Pagado:</strong> ${(selectedFactura?.monto_pagado || 0).toLocaleString('es-CL')}</p>
                                <p><strong>Saldo Pendiente:</strong> ${(selectedFactura?.total - (selectedFactura?.monto_pagado || 0)).toLocaleString('es-CL')}</p>
                            </div>

                            <form onSubmit={handleSubmitPago}>
                                <div className="form-group">
                                    <label>Monto a Pagar *</label>
                                    <input
                                        type="number"
                                        value={pagoData.monto}
                                        onChange={(e) => setPagoData({ ...pagoData, monto: e.target.value })}
                                        required
                                        min="1"
                                        step="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Método de Pago *</label>
                                    <select
                                        value={pagoData.metodoPago}
                                        onChange={(e) => setPagoData({ ...pagoData, metodoPago: e.target.value })}
                                        required
                                    >
                                        <option value="efectivo">Efectivo</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="tarjeta_credito">Tarjeta de Crédito</option>
                                        <option value="tarjeta_debito">Tarjeta de Débito</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Referencia (N° Transferencia, Cheque, etc.)</label>
                                    <input
                                        type="text"
                                        value={pagoData.referencia}
                                        onChange={(e) => setPagoData({ ...pagoData, referencia: e.target.value })}
                                        placeholder="Ej: N° 123456"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Notas</label>
                                    <textarea
                                        value={pagoData.notas}
                                        onChange={(e) => setPagoData({ ...pagoData, notas: e.target.value })}
                                        placeholder="Observaciones adicionales"
                                        rows="3"
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowPagoModal(false)} className="btn-secondary">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Registrar Pago
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
