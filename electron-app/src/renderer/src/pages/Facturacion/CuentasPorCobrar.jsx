import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import './CuentasPorCobrar.css';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

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
    const [reportePagos, setReportePagos] = useState(null);

    useEffect(() => {
        loadData();
        loadReportePagos();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const facturasResponse = await window.api.facturas.getAll();
            const clientesResponse = await window.api.clientes.getAll();

            if (!facturasResponse.success || !clientesResponse.success) {
                throw new Error('Error al obtener datos del servidor');
            }

            const allFacturas = facturasResponse.data || [];
            const allClientes = clientesResponse.data || [];
            setClientes(allClientes);

            let filtered = [];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            switch (activeTab) {
                case 'pendientes':
                    filtered = allFacturas.filter(f => f.estado === 'pendiente' || f.estado === 'parcial');
                    break;
                case 'vencidas':
                    filtered = allFacturas.filter(f => {
                        if (f.estado === 'pagada') return false;
                        const fechaVencimiento = new Date(f.fecha_vencimiento);
                        return fechaVencimiento < today;
                    });
                    break;
                case 'pagadas':
                    filtered = allFacturas.filter(f => f.estado === 'pagada');
                    break;
                case 'estado':
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

    const loadReportePagos = async () => {
        try {
            const result = await window.api.facturas.getReportePagos();
            if (result.success) {
                setReportePagos(result.data);
            }
        } catch (error) {
            console.error('Error loading reporte pagos:', error);
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
            loadReportePagos();
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

    const handleExportarReporte = async () => {
        try {
            // Preparar datos para exportar
            const data = {
                facturas: facturas,
                totales: reportePagos?.totales || {},
                fecha: new Date().toLocaleDateString('es-CL')
            };

            // Aquí podrías llamar a un handler IPC para exportar a Excel
            alert('Funcionalidad de exportación en desarrollo. Los datos están listos para exportar.');
            console.log('Datos para exportar:', data);
        } catch (error) {
            console.error('Error exportando:', error);
            alert('Error al exportar reporte');
        }
    };

    const getEstadoBadge = (factura) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fechaVencimiento = new Date(factura.fecha_vencimiento);
        const isVencida = fechaVencimiento < today && factura.estado !== 'pagada';

        if (factura.estado === 'pagada') {
            return <span className="badge badge-success">Pagada</span>;
        } else if (factura.estado === 'parcial') {
            return <span className="badge badge-warning">Pago Parcial</span>;
        } else if (isVencida) {
            return <span className="badge badge-danger">Vencida</span>;
        } else {
            return <span className="badge badge-info">Pendiente</span>;
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(price || 0);
    };

    const renderAlertasVencimiento = () => {
        if (!reportePagos) return null;

        const { totales, facturasVencidas, proximos7Dias, proximos15Dias } = reportePagos;

        return (
            <div className="alertas-vencimiento">
                <div className="alerta-card critico">
                    <div className="alerta-header">
                        <span className="alerta-icon">🚨</span>
                        <span className="alerta-label">Vencidas</span>
                    </div>
                    <div className="alerta-valor">{facturasVencidas?.length || 0}</div>
                    <div className="alerta-monto">{formatPrice(totales?.total_vencido || 0)}</div>
                </div>

                <div className="alerta-card urgente">
                    <div className="alerta-header">
                        <span className="alerta-icon">⚠️</span>
                        <span className="alerta-label">Vencen en 7 días</span>
                    </div>
                    <div className="alerta-valor">{proximos7Dias?.length || 0}</div>
                    <div className="alerta-monto">
                        {formatPrice(proximos7Dias?.reduce((sum, f) => sum + f.total, 0) || 0)}
                    </div>
                </div>

                <div className="alerta-card proximo">
                    <div className="alerta-header">
                        <span className="alerta-icon">📅</span>
                        <span className="alerta-label">Vencen en 15 días</span>
                    </div>
                    <div className="alerta-valor">{proximos15Dias?.length || 0}</div>
                    <div className="alerta-monto">
                        {formatPrice(proximos15Dias?.reduce((sum, f) => sum + f.total, 0) || 0)}
                    </div>
                </div>

                <div className="alerta-card ok">
                    <div className="alerta-header">
                        <span className="alerta-icon">✅</span>
                        <span className="alerta-label">Cobrado</span>
                    </div>
                    <div className="alerta-valor">{totales?.cantidad_pagadas || 0}</div>
                    <div className="alerta-monto">{formatPrice(totales?.total_cobrado || 0)}</div>
                </div>
            </div>
        );
    };

    const renderGraficos = () => {
        if (!reportePagos) return null;

        const { totales, proyeccion } = reportePagos;

        // Gráfico de distribución de estados
        const estadosData = {
            labels: ['Cobrado', 'Por Cobrar', 'Vencido'],
            datasets: [{
                data: [
                    totales?.total_cobrado || 0,
                    (totales?.total_por_cobrar || 0) - (totales?.total_vencido || 0),
                    totales?.total_vencido || 0
                ],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                borderWidth: 0
            }]
        };

        // Gráfico de proyección de flujo de caja
        const proyeccionData = {
            labels: proyeccion?.slice(0, 8).map(p => p.periodo.split(' - ')[0]) || [],
            datasets: [{
                label: 'Monto Esperado',
                data: proyeccion?.slice(0, 8).map(p => p.monto_esperado) || [],
                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        };

        return (
            <div className="graficos-container">
                <div className="grafico-card">
                    <h3>💰 Distribución de Cobros</h3>
                    <div className="chart-container">
                        <Doughnut
                            data={estadosData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom'
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                return context.label + ': ' + formatPrice(context.parsed);
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="grafico-card">
                    <h3>📈 Proyección de Flujo de Caja (8 semanas)</h3>
                    <div className="chart-container">
                        <Line
                            data={proyeccionData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                return 'Monto: ' + formatPrice(context.parsed.y);
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: function (value) {
                                                return '$' + (value / 1000).toFixed(0) + 'K';
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        if (activeTab === 'estado') {
            return (
                <div className="estado-cuenta-container">
                    <div className="selector-cliente">
                        <div style={{ flex: 1, minWidth: '250px' }}>
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
                        </div>
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
                                    <span className="value">{formatPrice(estadoCuenta.resumen.total_facturado)}</span>
                                </div>
                                <div className="resumen-card">
                                    <span className="label">Total Pagado:</span>
                                    <span className="value success">{formatPrice(estadoCuenta.resumen.total_pagado)}</span>
                                </div>
                                <div className="resumen-card">
                                    <span className="label">Saldo Pendiente:</span>
                                    <span className="value danger">{formatPrice(estadoCuenta.resumen.saldo_pendiente)}</span>
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
                                                    <td>{formatPrice(factura.total)}</td>
                                                    <td>{formatPrice(factura.monto_pagado || 0)}</td>
                                                    <td>{formatPrice(saldo)}</td>
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
            <>
                {activeTab === 'pendientes' && renderAlertasVencimiento()}
                {activeTab === 'pendientes' && renderGraficos()}

                <div className="export-buttons">
                    <button className="export-btn" onClick={handleExportarReporte}>
                        📊 Exportar a Excel
                    </button>
                    <button className="export-btn" onClick={() => alert('Funcionalidad de PDF en desarrollo')}>
                        📑 Exportar a PDF
                    </button>
                </div>

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
                                            <td>{new Date(factura.fecha).toLocaleDateString('es-CL')}</td>
                                            <td>{new Date(factura.fecha_vencimiento).toLocaleDateString('es-CL')}</td>
                                            <td>{formatPrice(factura.total)}</td>
                                            <td>{formatPrice(factura.monto_pagado || 0)}</td>
                                            <td>{formatPrice(saldo)}</td>
                                            <td>{getEstadoBadge(factura)}</td>
                                            <td className="actions">
                                                {factura.estado !== 'pagada' && (
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
            </>
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
                                <p><strong>Total:</strong> {formatPrice(selectedFactura?.total)}</p>
                                <p><strong>Pagado:</strong> {formatPrice(selectedFactura?.monto_pagado || 0)}</p>
                                <p><strong>Saldo Pendiente:</strong> {formatPrice(selectedFactura?.total - (selectedFactura?.monto_pagado || 0))}</p>
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
