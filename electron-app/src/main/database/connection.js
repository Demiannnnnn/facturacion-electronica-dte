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
      tipo_documento INTEGER DEFAULT 33,
      cliente_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      fecha_vencimiento TEXT,
      forma_pago TEXT DEFAULT 'contado',
      condiciones_pago TEXT,
      subtotal REAL NOT NULL,
      monto_exento REAL DEFAULT 0,
      descuento_global REAL DEFAULT 0,
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
      numero_linea INTEGER NOT NULL,
      producto_id INTEGER,
      codigo_item TEXT,
      descripcion TEXT NOT NULL,
      cantidad REAL NOT NULL,
      unidad TEXT DEFAULT 'UN',
      precio_unitario REAL NOT NULL,
      descuento REAL DEFAULT 0,
      monto_item REAL NOT NULL,
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

  // Tabla de emisor (datos de la empresa)
  db.exec(`
    CREATE TABLE IF NOT EXISTS emisor (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      rut TEXT UNIQUE NOT NULL,
      razon_social TEXT NOT NULL,
      nombre_fantasia TEXT,
      giro TEXT NOT NULL,
      direccion TEXT NOT NULL,
      comuna TEXT NOT NULL,
      ciudad TEXT NOT NULL,
      region TEXT,
      telefono TEXT,
      email TEXT,
      logo_path TEXT,
      resolucion_sii TEXT,
      numero_resolucion TEXT,
      fecha_resolucion TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tabla de folios
  db.exec(`
    CREATE TABLE IF NOT EXISTS folios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_documento INTEGER NOT NULL,
      desde INTEGER NOT NULL,
      hasta INTEGER NOT NULL,
      actual INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(tipo_documento)
    )
  `);

  // Migración: Eliminar columna subtotal de factura_items si existe (columna antigua)
  try {
    // Verificar si la columna existe
    const tableInfo = db.prepare("PRAGMA table_info(factura_items)").all();
    const hasSubtotal = tableInfo.some(col => col.name === 'subtotal');

    if (hasSubtotal) {
      console.log('Removing old subtotal column from factura_items...');

      // SQLite no permite DROP COLUMN directamente, hay que recrear la tabla
      db.exec(`
        BEGIN TRANSACTION;
        
        -- Crear tabla temporal con la estructura correcta
        CREATE TABLE factura_items_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          factura_id INTEGER NOT NULL,
          numero_linea INTEGER NOT NULL,
          producto_id INTEGER,
          codigo_item TEXT,
          descripcion TEXT NOT NULL,
          cantidad REAL NOT NULL,
          unidad TEXT DEFAULT 'UN',
          precio_unitario REAL NOT NULL,
          descuento REAL DEFAULT 0,
          monto_item REAL NOT NULL,
          FOREIGN KEY (factura_id) REFERENCES facturas (id) ON DELETE CASCADE,
          FOREIGN KEY (producto_id) REFERENCES productos (id)
        );
        
        -- Copiar datos (sin la columna subtotal)
        INSERT INTO factura_items_new 
          (id, factura_id, numero_linea, producto_id, codigo_item, descripcion, 
           cantidad, unidad, precio_unitario, descuento, monto_item)
        SELECT 
          id, factura_id, 
          COALESCE(numero_linea, 1) as numero_linea,
          producto_id, 
          codigo_item, 
          descripcion, 
          cantidad, 
          COALESCE(unidad, 'UN') as unidad,
          precio_unitario, 
          COALESCE(descuento, 0) as descuento,
          COALESCE(monto_item, cantidad * precio_unitario) as monto_item
        FROM factura_items;
        
        -- Eliminar tabla antigua
        DROP TABLE factura_items;
        
        -- Renombrar tabla nueva
        ALTER TABLE factura_items_new RENAME TO factura_items;
        
        COMMIT;
      `);

      console.log('Old subtotal column removed successfully');
    }
  } catch (error) {
    console.error('Error removing subtotal column:', error);
    // Si hay error, hacer rollback
    try {
      db.exec('ROLLBACK');
    } catch (e) {
      // Ignorar error de rollback
    }
  }

  // Migraciones: Agregar columnas nuevas si no existen
  const migrateColumns = [
    // Facturas
    { table: 'facturas', column: 'tipo_documento', definition: 'INTEGER DEFAULT 33' },
    { table: 'facturas', column: 'forma_pago', definition: 'TEXT DEFAULT "contado"' },
    { table: 'facturas', column: 'condiciones_pago', definition: 'TEXT' },
    { table: 'facturas', column: 'monto_exento', definition: 'REAL DEFAULT 0' },
    { table: 'facturas', column: 'descuento_global', definition: 'REAL DEFAULT 0' },
    { table: 'facturas', column: 'pdf_path', definition: 'TEXT' }, // Ruta al PDF guardado
    { table: 'facturas', column: 'sii_track_id', definition: 'TEXT' }, // ID de seguimiento del SII
    { table: 'facturas', column: 'sii_estado', definition: 'TEXT' }, // Estado en el SII (ACEPTADO, RECHAZADO, etc)
    // Factura Items
    { table: 'factura_items', column: 'numero_linea', definition: 'INTEGER DEFAULT 1' },
    { table: 'factura_items', column: 'codigo_item', definition: 'TEXT' },
    { table: 'factura_items', column: 'unidad', definition: 'TEXT DEFAULT "UN"' },
    { table: 'factura_items', column: 'descuento', definition: 'REAL DEFAULT 0' },
    { table: 'factura_items', column: 'monto_item', definition: 'REAL DEFAULT 0' }
  ];

  migrateColumns.forEach(({ table, column, definition }) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Column ${column} added to ${table} table`);
    } catch (error) {
      // La columna ya existe, ignorar el error
      if (!error.message.includes('duplicate column name')) {
        console.error(`Error adding column ${column} to ${table}:`, error);
      }
    }
  });

  // Inicializar folio si no existe
  try {
    const folioExists = db.prepare('SELECT COUNT(*) as count FROM folios WHERE tipo_documento = 33').get();
    if (folioExists.count === 0) {
      db.prepare('INSERT INTO folios (tipo_documento, desde, hasta, actual, created_at) VALUES (?, ?, ?, ?, ?)').run(
        33, // Factura Electrónica
        1,
        10000,
        1,
        new Date().toISOString()
      );
      console.log('Folio inicial creado para facturas electrónicas');
    }
  } catch (error) {
    console.error('Error initializing folios:', error);
  }

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
