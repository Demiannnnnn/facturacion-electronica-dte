/**
 * Script para generar el archivo regionesComunas.js desde la API oficial del gobierno
 * Fuente: APIs Gobierno Digital Chile - División Político Administrativa (DPA)
 * URL: https://apis.digital.gob.cl/dpa/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function obtenerRegiones() {
  const response = await fetch('https://apis.digital.gob.cl/dpa/regiones');
  const data = await response.json();
  return data;
}

async function obtenerComunasPorRegion(codigoRegion) {
  const response = await fetch(`https://apis.digital.gob.cl/dpa/regiones/${codigoRegion}/comunas`);
  const data = await response.json();
  return data;
}

async function generarArchivo() {
  try {
    console.log('Descargando regiones desde API oficial...');
    const regiones = await obtenerRegiones();

    console.log(`Encontradas ${regiones.length} regiones`);

    const regionesFormateadas = [];
    const comunasPorRegion = {};

    for (const region of regiones) {
      console.log(`Procesando: ${region.nombre}...`);

      // Formatear región
      regionesFormateadas.push({
        value: region.nombre,
        label: region.nombre,
        codigo: region.codigo
      });

      // Obtener comunas de esta región
      const comunas = await obtenerComunasPorRegion(region.codigo);

      // Formatear comunas
      comunasPorRegion[region.nombre] = comunas.map(comuna => ({
        value: comuna.nombre,
        label: comuna.nombre
      })).sort((a, b) => a.label.localeCompare(b.label));

      console.log(`  ${comunas.length} comunas`);
    }

    // Ordenar regiones por código
    regionesFormateadas.sort((a, b) => {
      const ordenCodigos = ['15', '01', '02', '03', '04', '05', '13', '06', '07', '16', '08', '09', '14', '10', '11', '12'];
      return ordenCodigos.indexOf(a.codigo) - ordenCodigos.indexOf(b.codigo);
    });

    // Contar total de comunas
    let totalComunas = 0;
    Object.values(comunasPorRegion).forEach(comunas => {
      totalComunas += comunas.length;
    });

    console.log(`\nTotal: ${totalComunas} comunas`);

    // Generar contenido del archivo
    const contenido = `/**
 * Datos de regiones y comunas de Chile
 * Fuente: API Gobierno Digital Chile - División Político Administrativa (DPA)
 * URL: https://apis.digital.gob.cl/dpa/
 * Generado automáticamente el: ${new Date().toISOString()}
 * Total regiones: ${regiones.length}
 * Total comunas: ${totalComunas}
 */

export const regiones = ${JSON.stringify(regionesFormateadas, null, 2)};

export const comunasPorRegion = ${JSON.stringify(comunasPorRegion, null, 2)};

/**
 * Obtiene las comunas de una región específica
 * @param {string} region - Nombre de la región
 * @returns {Array} Array de comunas en formato {value, label}
 */
export function getComunasByRegion(region) {
  return comunasPorRegion[region] || [];
}
`;

    // Escribir archivo
    const rutaArchivo = path.join(__dirname, '..', 'src', 'renderer', 'src', 'data', 'regionesComunas.js');
    fs.writeFileSync(rutaArchivo, contenido, 'utf8');

    console.log(`\n✅ Archivo generado exitosamente: ${rutaArchivo}`);
    console.log(`📊 ${regiones.length} regiones, ${totalComunas} comunas`);

  } catch (error) {
    console.error('❌ Error al generar el archivo:', error);
    process.exit(1);
  }
}

generarArchivo();
