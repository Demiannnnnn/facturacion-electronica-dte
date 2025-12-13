import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let db = null;

export function initDatabase() {
  try {
    const userDataPath = app.getPath('userData');

    // En desarrollo, usar base de datos separada
    const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;
    const dbName = isDevelopment ? 'facturacion.dev.db' : 'facturacion.db';
    const dbPath = path.join(userDataPath, dbName);

    // Crear directorio si no existe
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    console.log('Initializing database at:', dbPath);
    console.log('Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');

    // Conectar a la base de datos
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    // Crear tablas
    createTables();

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function createTables() {
  const db = getDatabase();

  // Tabla de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tabla de clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rut TEXT UNIQUE NOT NULL,
      razon_social TEXT NOT NULL,
      giro TEXT,
      direccion TEXT,
      region TEXT,
      comuna TEXT,
      ciudad TEXT,
      telefono TEXT,
      email TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Migración: Agregar columna region si no existe
  try {
    db.exec(`ALTER TABLE clientes ADD COLUMN region TEXT`);
    console.log('Column region added to clientes table');
  } catch (error) {
    // La columna ya existe, ignorar el error
    if (!error.message.includes('duplicate column name')) {
      console.error('Error adding region column:', error);
    }
  }

  // Tabla de productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tabla de facturas
  db.exec(`
    CREATE TABLE IF NOT EXISTS facturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folio INTEGER UNIQUE NOT NULL,
      cliente_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      fecha_vencimiento TEXT,
      subtotal REAL NOT NULL,
      iva REAL NOT NULL,
      total REAL NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    )
  `);

  // Tabla de items de factura
  db.exec(`
    CREATE TABLE IF NOT EXISTS factura_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      factura_id INTEGER NOT NULL,
      producto_id INTEGER,
      descripcion TEXT NOT NULL,
      cantidad REAL NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (factura_id) REFERENCES facturas (id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos (id)
    )
  `);

  // Tabla de configuración
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  console.log('Tables created successfully');
}

export function isFirstRun() {
  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get();
    return result.count === 0;
  } catch (error) {
    console.error('Error checking first run:', error);
    return true;
  }
}
