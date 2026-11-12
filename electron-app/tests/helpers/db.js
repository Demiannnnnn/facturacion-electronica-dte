import fs from 'fs';
import os from 'os';
import path from 'path';
import { setUserDataPath } from 'electron';
import { initDatabase } from '../../src/main/database/connection.js';

/** Crea una base SQLite nueva con el esquema real de la app en un directorio temporal */
export function nuevaBaseDeDatos() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facturacion-db-'));
  setUserDataPath(dir);
  const db = initDatabase();
  return {
    db,
    dir,
    cerrar() {
      db.close();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
}

export function insertarCliente(db, { rut = '12.345.678-5', razon_social = 'Cliente Ltda' } = {}) {
  const now = new Date().toISOString();
  return db
    .prepare('INSERT INTO clientes (rut, razon_social, created_at, updated_at) VALUES (?, ?, ?, ?)')
    .run(rut, razon_social, now, now).lastInsertRowid;
}

export function insertarProducto(db, { nombre = 'Producto', precio = 1000, stock = 10 } = {}) {
  const now = new Date().toISOString();
  return db
    .prepare('INSERT INTO productos (nombre, precio, stock, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(nombre, precio, stock, now, now).lastInsertRowid;
}
