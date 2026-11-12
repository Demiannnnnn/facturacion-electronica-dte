import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validarRut } from '../src/renderer/src/utils/validaciones.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extraerRutsDeArchivo(rutaRelativa) {
  const rutaAbsoluta = path.resolve(__dirname, rutaRelativa);
  const contenido = fs.readFileSync(rutaAbsoluta, 'utf-8');
  // Formato chileno: XX.XXX.XXX-X o X.XXX.XXX-X
  const regex = /\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b/g;
  const coincidencias = contenido.match(regex);
  return coincidencias || [];
}

describe('RUTs en archivos de seed y testing', () => {
  it('todos los RUTs en electron-app/src/main/ipc/seed.js deben tener DV válido', () => {
    const ruts = extraerRutsDeArchivo('../src/main/ipc/seed.js');
    expect(ruts.length).toBeGreaterThan(0);
    for (const rut of ruts) {
      expect(validarRut(rut), `RUT inválido en src/main/ipc/seed.js: ${rut}`).toBe(true);
    }
  });

  it('todos los RUTs en electron-app/scripts/seed-profiles.js deben tener DV válido', () => {
    const ruts = extraerRutsDeArchivo('../scripts/seed-profiles.js');
    expect(ruts.length).toBeGreaterThan(0);
    for (const rut of ruts) {
      expect(validarRut(rut), `RUT inválido en scripts/seed-profiles.js: ${rut}`).toBe(true);
    }
  });

  it('todos los RUTs en testing.md deben tener DV válido', () => {
    const ruts = extraerRutsDeArchivo('../../testing.md');
    expect(ruts.length).toBeGreaterThan(0);
    for (const rut of ruts) {
      expect(validarRut(rut), `RUT inválido en testing.md: ${rut}`).toBe(true);
    }
  });
});
