import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserManual() {
    const navigate = useNavigate();
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    const handleBack = () => {
        navigate('/');
    };

    const manualSections = [
        {
            id: 'clientes',
            icon: '👥',
            title: 'Cómo registrar clientes',
            category: 'Gestión de Datos',
            content: (
                <div>
                    <h4>Pasos para registrar un nuevo cliente:</h4>
                    <ol style={styles.stepList}>
                        <li>Haz clic en <strong>"Clientes"</strong> en el menú lateral</li>
                        <li>Presiona el botón <strong>"+ Nuevo Cliente"</strong></li>
                        <li>Completa los datos requeridos:
                            <ul>
                                <li><strong>RUT:</strong> Ingresa el RUT con formato XX.XXX.XXX-X</li>
                                <li><strong>Razón Social:</strong> Nombre legal del cliente</li>
                                <li><strong>Dirección:</strong> Dirección completa</li>
                                <li><strong>Región y Comuna:</strong> Selecciona de las listas</li>
                                <li><strong>Email y Teléfono:</strong> Datos de contacto</li>
                            </ul>
                        </li>
                        <li>Haz clic en <strong>"Guardar Cliente"</strong></li>
                    </ol>
                    <div style={styles.tip}>
                        <strong>💡 Tip:</strong> El RUT se valida automáticamente. Si es inválido, aparecerá un mensaje de error.
                    </div>
                </div>
            )
        },
        {
            id: 'productos',
            icon: '📦',
            title: 'Cómo agregar productos',
            category: 'Gestión de Datos',
            content: (
                <div>
                    <h4>Pasos para agregar un producto:</h4>
                    <ol style={styles.stepList}>
                        <li>Ve a <strong>"Productos"</strong> en el menú</li>
                        <li>Clic en <strong>"+ Nuevo Producto"</strong></li>
                        <li>Completa la información:
                            <ul>
                                <li><strong>Código:</strong> SKU o código interno (opcional)</li>
                                <li><strong>Nombre:</strong> Nombre del producto</li>
                                <li><strong>Precio:</strong> Precio SIN IVA</li>
                                <li><strong>Stock:</strong> Cantidad disponible</li>
                            </ul>
                        </li>
                        <li>Presiona <strong>"Guardar Producto"</strong></li>
                    </ol>
                    <div style={styles.tip}>
                        <strong>💡 Tip:</strong> El stock se actualiza automáticamente al emitir facturas.
                    </div>
                </div>
            )
        },
        {
            id: 'trabajadores',
            icon: '👥',
            title: 'Gestión de trabajadores',
            category: 'Gestión de Datos',
            content: (
                <div>
                    <h4>Cómo gestionar trabajadores:</h4>
                    <ol style={styles.stepList}>
                        <li>Accede a <strong>"Trabajadores"</strong></li>
                        <li>Visualiza la lista de todos tus trabajadores registrados en el sistema</li>
                        <li>Puedes filtrar por rol (vendedor, contador, gerente, etc.)</li>
                        <li>Observa el estado, email, RUT y fecha de registro de cada trabajador</li>
                    </ol>
                    <p><strong>Nota:</strong> Para crear nuevos trabajadores, accede a <strong>Configuración → Usuarios</strong>. Los trabajadores que crees allí aparecerán automáticamente en esta sección.</p>
                </div>
            )
        },
        {
            id: 'busqueda',
            icon: '🔍',
            title: 'Búsqueda y filtros',
            category: 'Gestión de Datos',
            content: (
                <div>
                    <h4>Cómo buscar información:</h4>
                    <ul style={styles.stepList}>
                        <li><strong>Buscar clientes:</strong> Escribe RUT, razón social o email en la barra de búsqueda</li>
                        <li><strong>Buscar productos:</strong> Ingresa código o nombre del producto</li>
                        <li><strong>Resultados instantáneos:</strong> La tabla se filtra automáticamente mientras escribes</li>
                    </ul>
                    <div style={styles.tip}>
                        <strong>💡 Tip:</strong> No necesitas escribir el texto completo, la búsqueda es parcial.
                    </div>
                </div>
            )
        },
        {
            id: 'facturas',
            icon: '📄',
            title: 'Emitir facturas electrónicas',
            category: 'Facturación',
            content: (
                <div>
                    <h4>Pasos para emitir una factura:</h4>
                    <ol style={styles.stepList}>
                        <li>Ve a <strong>"Facturas"</strong> → <strong>"+ Nueva Factura"</strong></li>
                        <li><strong>Selecciona el cliente</strong> (búscalo por nombre o RUT)</li>
                        <li><strong>Agrega productos:</strong>
                            <ul>
                                <li>Selecciona el producto</li>
                                <li>Ingresa la cantidad</li>
                                <li>El precio se carga automáticamente (puedes modificarlo)</li>
                                <li>Aplica descuento si es necesario (0-100%)</li>
                                <li>Clic en "Agregar"</li>
                            </ul>
                        </li>
                        <li>Repite para todos los productos</li>
                        <li>Revisa los <strong>totales</strong> (Subtotal + IVA 19%)</li>
                        <li>Selecciona <strong>forma de pago</strong> (Contado/Crédito)</li>
                        <li>Clic en <strong>"Emitir Factura"</strong></li>
                    </ol>
                    <div style={styles.tip}>
                        <strong>✅ El sistema automáticamente:</strong>
                        <ul>
                            <li>Asigna el folio correlativo</li>
                            <li>Calcula el IVA (19%)</li>
                            <li>Genera el PDF</li>
                            <li>Envía el documento en formato JSON a la API</li>
                            <li>Descuenta el stock</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'pdf',
            icon: '📑',
            title: 'Generar PDF profesionales',
            category: 'Facturación',
            content: (
                <div>
                    <h4>Ver y descargar PDFs:</h4>
                    <ol style={styles.stepList}>
                        <li>En la lista de facturas, busca la factura que necesitas</li>
                        <li>Clic en el botón <strong>"📄 Ver PDF"</strong></li>
                        <li>El PDF se abre automáticamente con el visor de tu sistema</li>
                        <li>Desde ahí puedes:
                            <ul>
                                <li>Imprimirlo</li>
                                <li>Guardarlo en otra ubicación</li>
                                <li>Enviarlo por email</li>
                            </ul>
                        </li>
                    </ol>
                    <p><strong>Ubicación de PDFs:</strong> Los PDFs se guardan automáticamente en tu carpeta de usuario.</p>
                </div>
            )
        },
        {
            id: 'folios',
            icon: '🔢',
            title: 'Control de folios',
            category: 'Facturación',
            content: (
                <div>
                    <h4>Configurar folios:</h4>
                    <ol style={styles.stepList}>
                        <li>Ve a <strong>"Configuración"</strong> → <strong>"Datos del Emisor"</strong></li>
                        <li>Busca la sección <strong>"Folios"</strong></li>
                        <li>Configura:
                            <ul>
                                <li><strong>Folio Inicial:</strong> Número desde donde empezar (ej: 1)</li>
                                <li><strong>Folio Final:</strong> Número máximo autorizado por SII</li>
                            </ul>
                        </li>
                        <li>El sistema incrementa automáticamente el folio con cada factura</li>
                    </ol>
                    <div style={styles.tip}>
                        <strong>⚠️ Importante:</strong> Los folios deben estar autorizados por el SII.
                    </div>
                </div>
            )
        },
        {
            id: 'iva',
            icon: '💰',
            title: 'Cálculo automático de IVA',
            category: 'Facturación',
            content: (
                <div>
                    <h4>Cómo funciona el IVA:</h4>
                    <ul style={styles.stepList}>
                        <li>El sistema calcula automáticamente el <strong>IVA del 19%</strong></li>
                        <li>Los precios que ingresas en productos son <strong>SIN IVA</strong></li>
                        <li>Al emitir una factura:
                            <ul>
                                <li><strong>Subtotal:</strong> Suma de todos los items</li>
                                <li><strong>IVA:</strong> 19% del subtotal</li>
                                <li><strong>Total:</strong> Subtotal + IVA</li>
                            </ul>
                        </li>
                    </ul>
                    <div style={styles.example}>
                        <strong>Ejemplo:</strong><br />
                        Producto: $100.000 (sin IVA)<br />
                        IVA (19%): $19.000<br />
                        Total: $119.000
                    </div>
                </div>
            )
        },
        {
            id: 'dashboard',
            icon: '📊',
            title: 'Dashboard con estadísticas',
            category: 'Reportes y Métricas',
            content: (
                <div>
                    <h4>Información en el Dashboard:</h4>
                    <ul style={styles.stepList}>
                        <li><strong>Total Ventas:</strong> Suma de todas las facturas emitidas</li>
                        <li><strong>Ventas Hoy:</strong> Facturas del día actual</li>
                        <li><strong>Facturas Pendientes:</strong> Cantidad sin pagar</li>
                        <li><strong>Stock Total:</strong> Suma de unidades en inventario</li>
                    </ul>
                    <h4>Gráficos disponibles:</h4>
                    <ul style={styles.stepList}>
                        <li><strong>Ventas últimos 7 días:</strong> Tendencia de ventas</li>
                        <li><strong>Top 5 productos:</strong> Más vendidos</li>
                        <li><strong>Estado de facturas:</strong> Pendientes vs Pagadas</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'reportes',
            icon: '📈',
            title: 'Reportes de ventas',
            category: 'Reportes y Métricas',
            content: (
                <div>
                    <h4>Generar reportes de ventas:</h4>
                    <ol style={styles.stepList}>
                        <li>Ve a <strong>"Reportes"</strong></li>
                        <li>Selecciona <strong>"Ventas por Período"</strong></li>
                        <li>Elige el período:
                            <ul>
                                <li>Hoy</li>
                                <li>Semana</li>
                                <li>Mes</li>
                                <li>Trimestre</li>
                                <li>Año</li>
                                <li>Personalizado (selecciona fechas)</li>
                            </ul>
                        </li>
                        <li>Clic en <strong>"Generar Reporte"</strong></li>
                    </ol>
                    <p><strong>El reporte incluye:</strong> Total facturado, cantidad de facturas, promedio, subtotal e IVA.</p>
                </div>
            )
        },
        {
            id: 'cobranzas',
            icon: '💵',
            title: 'Cuentas por cobrar',
            category: 'Reportes y Métricas',
            content: (
                <div>
                    <h4>Ver cuentas por cobrar:</h4>
                    <ol style={styles.stepList}>
                        <li>Ve a <strong>"Reportes"</strong> → <strong>"Pagos y Cobranzas"</strong></li>
                        <li>Verás:
                            <ul>
                                <li><strong>Total por cobrar:</strong> Suma de facturas pendientes</li>
                                <li><strong>Facturas vencidas:</strong> Con fecha de vencimiento pasada</li>
                                <li><strong>Por vencer:</strong> Próximas a vencer (7 y 15 días)</li>
                                <li><strong>Top deudores:</strong> Clientes con mayor deuda</li>
                            </ul>
                        </li>
                    </ol>
                    <div style={styles.tip}>
                        <strong>💡 Tip:</strong> Usa este reporte para hacer seguimiento de cobros.
                    </div>
                </div>
            )
        },
        {
            id: 'tributario',
            icon: '🏛️',
            title: 'Resumen tributario (SII)',
            category: 'Reportes y Métricas',
            content: (
                <div>
                    <h4>Generar resumen para el SII:</h4>
                    <ol style={styles.stepList}>
                        <li>Ve a <strong>"Reportes"</strong> → <strong>"Resumen Tributario"</strong></li>
                        <li>Selecciona <strong>mes y año</strong></li>
                        <li>Clic en <strong>"Generar"</strong></li>
                    </ol>
                    <h4>Información para Formulario 29:</h4>
                    <ul style={styles.stepList}>
                        <li><strong>Código 100:</strong> Ventas Netas</li>
                        <li><strong>Código 105:</strong> IVA Débito Fiscal</li>
                        <li><strong>Código 110:</strong> Ventas Exentas</li>
                    </ul>
                    <p>También incluye detalle diario de ventas y resumen anual.</p>
                </div>
            )
        },
        {
            id: 'empresa',
            icon: '🏢',
            title: 'Datos de tu empresa',
            category: 'Configuración',
            content: (
                <div>
                    <h4>Configurar datos del emisor:</h4>
                    <ol style={styles.stepList}>
                        <li>Ve a <strong>"Configuración"</strong></li>
                        <li>Completa:
                            <ul>
                                <li><strong>RUT de la empresa</strong></li>
                                <li><strong>Razón Social</strong></li>
                                <li><strong>Giro</strong></li>
                                <li><strong>Dirección completa</strong></li>
                                <li><strong>Comuna, Ciudad, Región</strong></li>
                                <li><strong>Teléfono y Email</strong></li>
                            </ul>
                        </li>
                        <li><strong>Datos SII:</strong>
                            <ul>
                                <li>Número de Resolución</li>
                                <li>Fecha de Resolución</li>
                            </ul>
                        </li>
                        <li>Guarda los cambios</li>
                    </ol>
                    <p>Estos datos aparecerán en todas las facturas que emitas.</p>
                </div>
            )
        },
        {
            id: 'excel',
            icon: '📊',
            title: 'Exportar a Excel',
            category: 'Configuración',
            content: (
                <div>
                    <h4>Exportar datos a Excel:</h4>
                    <p><strong>Método 1: Atajos de teclado</strong></p>
                    <ul style={styles.stepList}>
                        <li><strong>Ctrl + Shift + C:</strong> Exportar Clientes</li>
                        <li><strong>Ctrl + Shift + P:</strong> Exportar Productos</li>
                        <li><strong>Ctrl + Shift + F:</strong> Exportar Facturas</li>
                    </ul>
                    <p><strong>Método 2: Menú</strong></p>
                    <ol style={styles.stepList}>
                        <li>Ve al menú <strong>"Archivo"</strong></li>
                        <li>Selecciona <strong>"Exportar"</strong></li>
                        <li>Elige qué exportar (Clientes/Productos/Facturas)</li>
                        <li>Selecciona dónde guardar el archivo</li>
                        <li>El archivo se abre automáticamente</li>
                    </ol>
                </div>
            )
        },
        {
            id: 'backup',
            icon: '💾',
            title: 'Backup y restauración',
            category: 'Configuración',
            content: (
                <div>
                    <h4>¿Qué es un backup?</h4>
                    <p>Un backup es una <strong>copia de seguridad</strong> de toda tu información (clientes, productos, facturas, etc.). Te permite recuperar tus datos en caso de problemas.</p>

                    <h4>Backup automático:</h4>
                    <ul style={styles.stepList}>
                        <li>El sistema crea backups <strong>automáticamente cada vez que cierras la aplicación</strong></li>
                        <li>Se guardan los <strong>últimos 30 backups</strong> (aproximadamente 1 mes)</li>
                        <li>No necesitas hacer nada, es completamente automático</li>
                        <li>Los backups antiguos se eliminan automáticamente para ahorrar espacio</li>
                    </ul>

                    <h4>Ubicación de los backups:</h4>
                    <p>Los backups se guardan en una carpeta especial del sistema:</p>
                    <ul style={styles.stepList}>
                        <li><strong>Windows:</strong> C:\Users\[tu-usuario]\AppData\Roaming\electron-app\backups\</li>
                        <li>Cada backup tiene un nombre con fecha y hora (ej: backup_2025-12-18_15-30-00.db)</li>
                    </ul>

                    <div style={styles.tip}>
                        <strong>💡 Tip:</strong> Los backups se crean automáticamente. Solo necesitas preocuparte de ellos si algo sale mal y necesitas recuperar información.
                    </div>

                    <h4>¿Cuándo necesito restaurar un backup?</h4>
                    <ul style={styles.stepList}>
                        <li>Si eliminaste información por error</li>
                        <li>Si la base de datos se corrompió</li>
                        <li>Si necesitas volver a un estado anterior</li>
                    </ul>

                    <div style={{ ...styles.tip, backgroundColor: '#fff3cd', borderColor: '#ffc107', color: '#856404' }}>
                        <strong>⚠️ Importante - Soporte Técnico:</strong><br />
                        Si necesitas restaurar un backup y no te sientes seguro haciéndolo tú mismo, <strong>contacta al soporte técnico</strong>. Es un proceso delicado que puede sobrescribir toda tu información actual.
                        <br /><br />
                        <strong>Contacto de soporte:</strong> [Tu email o teléfono de soporte]
                    </div>

                    <h4>Exportar backup manualmente (avanzado):</h4>
                    <p>Si quieres guardar un backup en una ubicación específica (USB, nube, etc.):</p>
                    <ol style={styles.stepList}>
                        <li>Ve al menú <strong>"Archivo"</strong></li>
                        <li>Selecciona <strong>"Exportar Base de Datos"</strong></li>
                        <li>Elige dónde guardar el archivo</li>
                        <li>Guarda el archivo en un lugar seguro</li>
                    </ol>

                    <div style={styles.example}>
                        <strong>Recomendación:</strong> Exporta un backup manual cada mes a un USB o servicio en la nube (Google Drive, Dropbox) como medida de seguridad adicional.
                    </div>
                </div>
            )
        },
        {
            id: 'problemas',
            icon: '🔧',
            title: 'Solución de problemas',
            category: 'Configuración',
            content: (
                <div>
                    <h4>Problemas comunes y soluciones:</h4>
                    <div style={styles.problemSection}>
                        <p><strong>❌ No puedo eliminar un cliente</strong></p>
                        <p>→ El cliente tiene facturas asociadas. No se puede eliminar.</p>
                    </div>
                    <div style={styles.problemSection}>
                        <p><strong>❌ Error al crear factura</strong></p>
                        <p>→ Verifica que:</p>
                        <ul>
                            <li>Hayas seleccionado un cliente</li>
                            <li>Hayas agregado al menos un producto</li>
                            <li>Los productos tengan stock suficiente</li>
                        </ul>
                    </div>
                    <div style={styles.problemSection}>
                        <p><strong>❌ Olvidé mi contraseña</strong></p>
                        <p>→ Contacta al soporte técnico para recuperar acceso.</p>
                    </div>
                </div>
            )
        }
    ];

    // Agrupar secciones por categoría
    const categories = {
        'Gestión de Datos': [],
        'Facturación': [],
        'Reportes y Métricas': [],
        'Configuración': []
    };

    manualSections.forEach(section => {
        categories[section.category].push(section);
    });

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📚 Manual de Usuario</h1>
                <p style={styles.subtitle}>
                    Haz clic en cualquier tema para ver las instrucciones paso a paso
                </p>
            </div>

            <div style={styles.content}>
                {Object.entries(categories).map(([categoryName, sections]) => (
                    <div key={categoryName} style={styles.categorySection}>
                        <h2 style={styles.categoryTitle}>{categoryName}</h2>
                        <div style={styles.sectionsGrid}>
                            {sections.map(section => (
                                <div key={section.id} style={styles.sectionCard}>
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        style={{
                                            ...styles.sectionButton,
                                            ...(expandedSection === section.id ? styles.sectionButtonActive : {})
                                        }}
                                    >
                                        <span style={styles.sectionIcon}>{section.icon}</span>
                                        <span style={styles.sectionTitle}>{section.title}</span>
                                        <span style={styles.expandIcon}>
                                            {expandedSection === section.id ? '▼' : '▶'}
                                        </span>
                                    </button>

                                    {expandedSection === section.id && (
                                        <div style={styles.sectionContent}>
                                            {section.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.footer}>
                <button onClick={handleBack} style={styles.backButton}>
                    ← Volver al Dashboard
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#f8f9fa'
    },
    header: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center'
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
        margin: 0
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        margin: '10px 0 0 0'
    },
    content: {
        marginBottom: '20px'
    },
    categorySection: {
        marginBottom: '30px'
    },
    categoryTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '15px',
        paddingLeft: '10px',
        borderLeft: '4px solid #28a745'
    },
    sectionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '15px'
    },
    sectionCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s'
    },
    sectionButton: {
        width: '100%',
        padding: '15px 20px',
        backgroundColor: 'white',
        border: 'none',
        borderBottom: '1px solid #e0e0e0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'left',
        transition: 'background-color 0.2s',
        fontSize: '16px'
    },
    sectionButtonActive: {
        backgroundColor: '#f0f8ff',
        borderBottom: '2px solid #28a745'
    },
    sectionIcon: {
        fontSize: '24px',
        flexShrink: 0
    },
    sectionTitle: {
        flex: 1,
        fontWeight: '500',
        color: '#333'
    },
    expandIcon: {
        fontSize: '12px',
        color: '#666',
        flexShrink: 0
    },
    sectionContent: {
        padding: '20px',
        backgroundColor: '#fafafa',
        borderTop: '1px solid #e0e0e0',
        animation: 'fadeIn 0.3s ease-in'
    },
    stepList: {
        lineHeight: '1.8',
        color: '#555',
        marginBottom: '15px'
    },
    tip: {
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '15px',
        fontSize: '14px',
        color: '#004085'
    },
    example: {
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '15px',
        fontSize: '14px',
        color: '#856404'
    },
    problemSection: {
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e0e0e0'
    },
    footer: {
        textAlign: 'center',
        padding: '20px'
    },
    backButton: {
        padding: '12px 30px',
        fontSize: '16px',
        fontWeight: '500',
        color: '#666',
        backgroundColor: 'white',
        border: '2px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
};

export default UserManual;
