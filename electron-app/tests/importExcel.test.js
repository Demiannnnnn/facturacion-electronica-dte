import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import XLSX from 'xlsx';
import { dialog } from 'electron';
import {
  importarClientes,
  importarProductos,
  generarTemplateClientes,
  generarTemplateProductos
} from '../src/main/services/importExcel.js';

let dir;

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'import-excel-'));
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function escribirExcel(nombre, filas) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), 'Hoja1');
  const file = path.join(dir, nombre);
  XLSX.writeFile(wb, file);
  dialog.showOpenDialog.mockResolvedValueOnce({ canceled: false, filePaths: [file] });
  return file;
}

describe('importarClientes', () => {
  it('cancelar el diálogo no importa nada', async () => {
    dialog.showOpenDialog.mockResolvedValueOnce({ canceled: true, filePaths: [] });
    expect(await importarClientes()).toMatchObject({ success: false, canceled: true });
  });

  it('separa filas válidas de inválidas, indicando la línea de Excel', async () => {
    escribirExcel('clientes.xlsx', [
      { RUT: '123456785', 'Razón Social': 'Válido SpA', Email: 'a@b.cl', Teléfono: '+56912345678' },
      { RUT: '12.345.678-9', 'Razón Social': 'DV malo' },
      { rut: '76.086.428-5', razon_social: 'Columnas minúsculas', email: 'no-es-email' },
      { 'Razón Social': 'Sin RUT' }
    ]);

    const r = await importarClientes();
    expect(r).toMatchObject({ success: true, totalProcesados: 4, totalValidos: 1, totalErrores: 3 });
    expect(r.data[0]).toMatchObject({ rut: '12.345.678-5', razon_social: 'Válido SpA', giro: null, email: 'a@b.cl' });
    expect(r.errores.map((e) => e.linea)).toEqual([3, 4, 5]);
    expect(r.errores[0].errores).toEqual(['RUT inválido']);
    expect(r.errores[1].errores).toEqual(['Email inválido']);
    expect(r.errores[2].errores).toEqual(['RUT es requerido']);
  });

  it('un archivo sin filas devuelve error', async () => {
    escribirExcel('vacio.xlsx', []);
    expect(await importarClientes()).toMatchObject({ success: false });
  });

  it('un archivo ilegible devuelve error en vez de lanzar', async () => {
    dialog.showOpenDialog.mockResolvedValueOnce({ canceled: false, filePaths: [path.join(dir, 'no-existe.xlsx')] });
    const r = await importarClientes();
    expect(r.success).toBe(false);
    expect(r.message).toMatch(/Error al leer el archivo/);
  });
});

describe('importarProductos', () => {
  it('valida nombre, precio y stock', async () => {
    escribirExcel('productos.xlsx', [
      { Código: 'P1', Nombre: 'Tornillo', Precio: 150, Stock: 10 },
      { Nombre: 'Gratis', Precio: 0 },
      { Nombre: 'Precio negativo', Precio: -5, Stock: 1 },
      { Precio: 100, Stock: 'x' }
    ]);

    const r = await importarProductos();
    expect(r).toMatchObject({ success: true, totalValidos: 2, totalErrores: 2 });
    expect(r.data).toEqual([
      { codigo: 'P1', nombre: 'Tornillo', descripcion: null, precio: 150, stock: 10 },
      { codigo: null, nombre: 'Gratis', descripcion: null, precio: 0, stock: 0 }
    ]);
    expect(r.errores[0].errores).toEqual(['Precio debe ser un número válido mayor o igual a 0']);
    expect(r.errores[1].errores).toEqual([
      'Nombre es requerido',
      'Stock debe ser un número entero mayor o igual a 0'
    ]);
  });
});

describe('templates', () => {
  it('el template de clientes se puede volver a importar sin errores', async () => {
    const file = path.join(dir, 'template-clientes.xlsx');
    dialog.showSaveDialog.mockResolvedValueOnce({ canceled: false, filePath: file });
    expect(await generarTemplateClientes()).toBe(file);

    dialog.showOpenDialog.mockResolvedValueOnce({ canceled: false, filePaths: [file] });
    const r = await importarClientes();
    expect(r.totalErrores).toBe(0);
    expect(r.totalValidos).toBe(2);
  });

  it('el template de productos se puede volver a importar sin errores', async () => {
    const file = path.join(dir, 'template-productos.xlsx');
    dialog.showSaveDialog.mockResolvedValueOnce({ canceled: false, filePath: file });
    await generarTemplateProductos();

    dialog.showOpenDialog.mockResolvedValueOnce({ canceled: false, filePaths: [file] });
    expect(await importarProductos()).toMatchObject({ totalValidos: 2, totalErrores: 0 });
  });

  it('cancelar el guardado devuelve null', async () => {
    dialog.showSaveDialog.mockResolvedValueOnce({ canceled: true });
    expect(await generarTemplateProductos()).toBeNull();
  });
});
