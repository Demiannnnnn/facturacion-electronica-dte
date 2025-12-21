import XLSX from 'xlsx';
import { dialog } from 'electron';
import path from 'path';

/**
 * Servicio de importación desde Excel
 * Importa datos desde archivos Excel (.xlsx, .xls) con validación robusta
 */

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} - True si es válido
 */
function validarRUT(rut) {
    if (!rut || typeof rut !== 'string') return false;

    // Limpiar RUT (quitar puntos y guión)
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').trim();

    if (rutLimpio.length < 2) return false;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();

    // Validar que el cuerpo sea numérico
    if (!/^\d+$/.test(cuerpo)) return false;

    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    return dv === dvCalculado;
}

/**
 * Formatea un RUT al formato estándar XX.XXX.XXX-X
 * @param {string} rut - RUT a formatear
 * @returns {string} - RUT formateado
 */
function formatearRUT(rut) {
    if (!rut) return '';

    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').trim();
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);

    // Formatear con puntos
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${cuerpoFormateado}-${dv}`;
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
function validarEmail(email) {
    if (!email) return true; // Email es opcional
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida un número de teléfono chileno
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} - True si es válido
 */
function validarTelefono(telefono) {
    if (!telefono) return true; // Teléfono es opcional
    const regex = /^(\+?56)?[0-9]{8,9}$/;
    return regex.test(telefono.replace(/\s/g, ''));
}

/**
 * Importa clientes desde un archivo Excel
 * @returns {Promise<Object>} - Resultado de la importación
 */
export async function importarClientes() {
    try {
        // Mostrar diálogo para seleccionar archivo
        const { filePaths, canceled } = await dialog.showOpenDialog({
            title: 'Importar Clientes desde Excel',
            filters: [
                { name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }
            ],
            properties: ['openFile']
        });

        if (canceled || !filePaths || filePaths.length === 0) {
            return {
                success: false,
                message: 'Importación cancelada',
                canceled: true
            };
        }

        const filePath = filePaths[0];

        // Leer archivo Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return {
                success: false,
                message: 'El archivo está vacío o no tiene el formato correcto'
            };
        }

        // Validar y procesar datos
        const clientesValidos = [];
        const errores = [];

        data.forEach((row, index) => {
            const lineaExcel = index + 2; // +2 porque Excel empieza en 1 y tiene header
            const erroresLinea = [];

            // Validar campos requeridos
            if (!row['RUT'] && !row['rut']) {
                erroresLinea.push('RUT es requerido');
            }

            if (!row['Razón Social'] && !row['razon_social'] && !row['Razon Social']) {
                erroresLinea.push('Razón Social es requerida');
            }

            // Obtener valores (soportar diferentes formatos de columnas)
            const rut = (row['RUT'] || row['rut'] || '').toString().trim();
            const razonSocial = (row['Razón Social'] || row['razon_social'] || row['Razon Social'] || '').toString().trim();
            const giro = (row['Giro'] || row['giro'] || '').toString().trim();
            const direccion = (row['Dirección'] || row['direccion'] || row['Direccion'] || '').toString().trim();
            const region = (row['Región'] || row['region'] || row['Region'] || '').toString().trim();
            const comuna = (row['Comuna'] || row['comuna'] || '').toString().trim();
            const ciudad = (row['Ciudad'] || row['ciudad'] || '').toString().trim();
            const telefono = (row['Teléfono'] || row['telefono'] || row['Telefono'] || '').toString().trim();
            const email = (row['Email'] || row['email'] || '').toString().trim();

            // Validar RUT
            if (rut && !validarRUT(rut)) {
                erroresLinea.push('RUT inválido');
            }

            // Validar email
            if (email && !validarEmail(email)) {
                erroresLinea.push('Email inválido');
            }

            // Validar teléfono
            if (telefono && !validarTelefono(telefono)) {
                erroresLinea.push('Teléfono inválido');
            }

            if (erroresLinea.length > 0) {
                errores.push({
                    linea: lineaExcel,
                    rut: rut || 'N/A',
                    razonSocial: razonSocial || 'N/A',
                    errores: erroresLinea
                });
            } else {
                clientesValidos.push({
                    rut: formatearRUT(rut),
                    razon_social: razonSocial,
                    giro: giro || null,
                    direccion: direccion || null,
                    region: region || null,
                    comuna: comuna || null,
                    ciudad: ciudad || null,
                    telefono: telefono || null,
                    email: email || null
                });
            }
        });

        return {
            success: true,
            data: clientesValidos,
            errores: errores,
            totalProcesados: data.length,
            totalValidos: clientesValidos.length,
            totalErrores: errores.length
        };

    } catch (error) {
        console.error('Error al importar clientes:', error);
        return {
            success: false,
            message: `Error al leer el archivo: ${error.message}`
        };
    }
}

/**
 * Importa productos desde un archivo Excel
 * @returns {Promise<Object>} - Resultado de la importación
 */
export async function importarProductos() {
    try {
        // Mostrar diálogo para seleccionar archivo
        const { filePaths, canceled } = await dialog.showOpenDialog({
            title: 'Importar Productos desde Excel',
            filters: [
                { name: 'Excel', extensions: ['xlsx', 'xls', 'csv'] }
            ],
            properties: ['openFile']
        });

        if (canceled || !filePaths || filePaths.length === 0) {
            return {
                success: false,
                message: 'Importación cancelada',
                canceled: true
            };
        }

        const filePath = filePaths[0];

        // Leer archivo Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return {
                success: false,
                message: 'El archivo está vacío o no tiene el formato correcto'
            };
        }

        // Validar y procesar datos
        const productosValidos = [];
        const errores = [];

        data.forEach((row, index) => {
            const lineaExcel = index + 2;
            const erroresLinea = [];

            // Validar campos requeridos
            if (!row['Nombre'] && !row['nombre']) {
                erroresLinea.push('Nombre es requerido');
            }

            if (!row['Precio'] && !row['precio'] && row['Precio'] !== 0 && row['precio'] !== 0) {
                erroresLinea.push('Precio es requerido');
            }

            // Obtener valores
            const codigo = (row['Código'] || row['codigo'] || row['Codigo'] || '').toString().trim();
            const nombre = (row['Nombre'] || row['nombre'] || '').toString().trim();
            const descripcion = (row['Descripción'] || row['descripcion'] || row['Descripcion'] || '').toString().trim();
            const precioStr = (row['Precio'] || row['precio'] || '0').toString().trim();
            const stockStr = (row['Stock'] || row['stock'] || '0').toString().trim();

            // Validar precio
            const precio = parseFloat(precioStr);
            if (isNaN(precio) || precio < 0) {
                erroresLinea.push('Precio debe ser un número válido mayor o igual a 0');
            }

            // Validar stock
            const stock = parseInt(stockStr);
            if (isNaN(stock) || stock < 0) {
                erroresLinea.push('Stock debe ser un número entero mayor o igual a 0');
            }

            if (erroresLinea.length > 0) {
                errores.push({
                    linea: lineaExcel,
                    codigo: codigo || 'N/A',
                    nombre: nombre || 'N/A',
                    errores: erroresLinea
                });
            } else {
                productosValidos.push({
                    codigo: codigo || null,
                    nombre: nombre,
                    descripcion: descripcion || null,
                    precio: precio,
                    stock: stock
                });
            }
        });

        return {
            success: true,
            data: productosValidos,
            errores: errores,
            totalProcesados: data.length,
            totalValidos: productosValidos.length,
            totalErrores: errores.length
        };

    } catch (error) {
        console.error('Error al importar productos:', error);
        return {
            success: false,
            message: `Error al leer el archivo: ${error.message}`
        };
    }
}

/**
 * Genera un template de Excel para clientes
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export async function generarTemplateClientes() {
    try {
        // Datos de ejemplo
        const datosEjemplo = [
            {
                'RUT': '12.345.678-9',
                'Razón Social': 'Empresa Ejemplo S.A.',
                'Giro': 'Comercio al por menor',
                'Dirección': 'Av. Principal 123',
                'Región': 'Región Metropolitana',
                'Comuna': 'Santiago',
                'Ciudad': 'Santiago',
                'Teléfono': '+56912345678',
                'Email': 'contacto@ejemplo.cl'
            },
            {
                'RUT': '98.765.432-1',
                'Razón Social': 'Comercial Demo Ltda.',
                'Giro': 'Servicios profesionales',
                'Dirección': 'Calle Secundaria 456',
                'Región': 'Valparaíso',
                'Comuna': 'Viña del Mar',
                'Ciudad': 'Viña del Mar',
                'Teléfono': '+56987654321',
                'Email': 'info@demo.cl'
            }
        ];

        // Crear libro de trabajo
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosEjemplo);

        // Ajustar anchos de columna
        ws['!cols'] = [
            { wch: 15 }, // RUT
            { wch: 30 }, // Razón Social
            { wch: 25 }, // Giro
            { wch: 35 }, // Dirección
            { wch: 20 }, // Región
            { wch: 20 }, // Comuna
            { wch: 15 }, // Ciudad
            { wch: 15 }, // Teléfono
            { wch: 25 }  // Email
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

        // Mostrar diálogo para guardar
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Guardar Template de Clientes',
            defaultPath: 'Template_Clientes.xlsx',
            filters: [
                { name: 'Excel', extensions: ['xlsx'] }
            ]
        });

        if (canceled || !filePath) {
            return null;
        }

        // Escribir archivo
        XLSX.writeFile(wb, filePath);

        return filePath;
    } catch (error) {
        console.error('Error al generar template de clientes:', error);
        throw error;
    }
}

/**
 * Genera un template de Excel para productos
 * @returns {Promise<string>} - Ruta del archivo generado
 */
export async function generarTemplateProductos() {
    try {
        // Datos de ejemplo
        const datosEjemplo = [
            {
                'Código': 'PROD001',
                'Nombre': 'Producto Ejemplo 1',
                'Descripción': 'Descripción detallada del producto',
                'Precio': 10000,
                'Stock': 50
            },
            {
                'Código': 'PROD002',
                'Nombre': 'Producto Ejemplo 2',
                'Descripción': 'Otro producto de ejemplo',
                'Precio': 25000,
                'Stock': 100
            }
        ];

        // Crear libro de trabajo
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(datosEjemplo);

        // Ajustar anchos de columna
        ws['!cols'] = [
            { wch: 15 }, // Código
            { wch: 30 }, // Nombre
            { wch: 40 }, // Descripción
            { wch: 12 }, // Precio
            { wch: 10 }  // Stock
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Productos');

        // Mostrar diálogo para guardar
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Guardar Template de Productos',
            defaultPath: 'Template_Productos.xlsx',
            filters: [
                { name: 'Excel', extensions: ['xlsx'] }
            ]
        });

        if (canceled || !filePath) {
            return null;
        }

        // Escribir archivo
        XLSX.writeFile(wb, filePath);

        return filePath;
    } catch (error) {
        console.error('Error al generar template de productos:', error);
        throw error;
    }
}
