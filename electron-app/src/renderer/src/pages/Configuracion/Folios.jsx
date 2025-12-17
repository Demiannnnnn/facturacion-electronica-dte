import React, { useState, useEffect } from 'react';
import './Folios.css';

function Folios() {
    const [folios, setFolios] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ desde: '', hasta: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        cargarFolios();
    }, []);

    const cargarFolios = async () => {
        setIsLoading(true);
        try {
            const result = await window.api.folios.getAll();
            if (result.success) {
                setFolios(result.data);
            } else {
                setError(result.error || 'Error al cargar folios');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar folios');
        }
        setIsLoading(false);
    };

    const handleEdit = (folio) => {
        setEditingId(folio.id);
        setEditForm({
            desde: folio.desde,
            hasta: folio.hasta
        });
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({ desde: '', hasta: '' });
        setError('');
    };

    const handleSave = async (id) => {
        setError('');
        setSuccess('');

        // Validaciones
        const desde = parseInt(editForm.desde);
        const hasta = parseInt(editForm.hasta);

        if (isNaN(desde) || isNaN(hasta)) {
            setError('Los valores deben ser números válidos');
            return;
        }

        if (desde < 1) {
            setError('El folio inicial debe ser mayor a 0');
            return;
        }

        if (hasta <= desde) {
            setError('El folio final debe ser mayor al folio inicial');
            return;
        }

        setIsLoading(true);
        try {
            const result = await window.api.folios.update({
                id,
                desde,
                hasta
            });

            if (result.success) {
                setSuccess('Rango de folios actualizado correctamente');
                setEditingId(null);
                await cargarFolios();
            } else {
                setError(result.error || 'Error al actualizar folios');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al actualizar folios');
        }
        setIsLoading(false);
    };

    const getAlertClass = (disponibles) => {
        if (disponibles < 50) return 'alert-danger';
        if (disponibles < 100) return 'alert-warning';
        return 'alert-success';
    };

    const getAlertIcon = (disponibles) => {
        if (disponibles < 50) return '🔴';
        if (disponibles < 100) return '🟡';
        return '🟢';
    };

    return (
        <div className="folios-container">
            <div className="folios-header">
                <div>
                    <h1 className="folios-title">⚙️ Configuración de Folios</h1>
                    <p className="folios-subtitle">
                        Gestiona los rangos de folios para cada tipo de documento tributario
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <strong>Éxito:</strong> {success}
                </div>
            )}

            <div className="folios-info">
                <p>
                    <strong>ℹ️ Información:</strong> Los folios son números consecutivos únicos para cada tipo de documento.
                    Asegúrate de configurar rangos suficientes para evitar quedarte sin folios disponibles.
                </p>
            </div>

            {isLoading && folios.length === 0 ? (
                <div className="loading">Cargando folios...</div>
            ) : (
                <div className="folios-table-container">
                    <table className="folios-table">
                        <thead>
                            <tr>
                                <th>Tipo de Documento</th>
                                <th>Folio Inicial</th>
                                <th>Folio Final</th>
                                <th>Folio Actual</th>
                                <th>Disponibles</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {folios.map((folio) => (
                                <tr key={folio.id}>
                                    <td>
                                        <div className="tipo-documento">
                                            <strong>Tipo {folio.tipo_documento}</strong>
                                            <div className="tipo-nombre">{folio.nombre}</div>
                                        </div>
                                    </td>
                                    <td>
                                        {editingId === folio.id ? (
                                            <input
                                                type="number"
                                                value={editForm.desde}
                                                onChange={(e) => setEditForm({ ...editForm, desde: e.target.value })}
                                                className="input-folio"
                                                min="1"
                                            />
                                        ) : (
                                            <span className="folio-number">{folio.desde.toLocaleString('es-CL')}</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === folio.id ? (
                                            <input
                                                type="number"
                                                value={editForm.hasta}
                                                onChange={(e) => setEditForm({ ...editForm, hasta: e.target.value })}
                                                className="input-folio"
                                                min={editForm.desde}
                                            />
                                        ) : (
                                            <span className="folio-number">{folio.hasta.toLocaleString('es-CL')}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="folio-actual">{folio.actual.toLocaleString('es-CL')}</span>
                                    </td>
                                    <td>
                                        <span className={`disponibles ${getAlertClass(folio.disponibles)}`}>
                                            {folio.disponibles.toLocaleString('es-CL')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getAlertClass(folio.disponibles)}`}>
                                            {getAlertIcon(folio.disponibles)}
                                            {folio.disponibles < 50 ? ' Crítico' : folio.disponibles < 100 ? ' Bajo' : ' OK'}
                                        </span>
                                    </td>
                                    <td>
                                        {editingId === folio.id ? (
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleSave(folio.id)}
                                                    className="btn-save"
                                                    disabled={isLoading}
                                                >
                                                    ✓ Guardar
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="btn-cancel"
                                                    disabled={isLoading}
                                                >
                                                    ✕ Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(folio)}
                                                className="btn-edit"
                                            >
                                                ✏️ Editar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="folios-help">
                <h3>💡 Ayuda</h3>
                <ul>
                    <li><strong>Folio Inicial:</strong> Primer número del rango autorizado</li>
                    <li><strong>Folio Final:</strong> Último número del rango autorizado</li>
                    <li><strong>Folio Actual:</strong> Próximo folio que se asignará</li>
                    <li><strong>Disponibles:</strong> Cantidad de folios que quedan por usar</li>
                    <li><strong>🔴 Crítico:</strong> Menos de 50 folios disponibles</li>
                    <li><strong>🟡 Bajo:</strong> Menos de 100 folios disponibles</li>
                    <li><strong>🟢 OK:</strong> 100 o más folios disponibles</li>
                </ul>
                <p className="warning">
                    <strong>⚠️ Importante:</strong> No puedes modificar el rango a valores menores que el folio actual.
                    Asegúrate de solicitar nuevos rangos al SII antes de que se agoten.
                </p>
            </div>
        </div>
    );
}

export default Folios;
