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

  // Tabla de usuarios con sistema de roles y permisos
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      rut TEXT,
      nombre TEXT,
      rol TEXT DEFAULT 'vendedor',
      permisos TEXT DEFAULT '{}',
      activo INTEGER DEFAULT 1,
      requiere_autorizacion INTEGER DEFAULT 0,
      ultimo_acceso TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Migración: Actualizar tabla users de username a email
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasUsername = tableInfo.some(col => col.name === 'username');
    const hasEmail = tableInfo.some(col => col.name === 'email');

    if (hasUsername && !hasEmail) {
      console.log('Migrating users table from username to email...');

      db.exec(`
        BEGIN TRANSACTION;
        
        -- Crear tabla temporal con la estructura nueva
        CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          rut TEXT,
          nombre TEXT,
          rol TEXT DEFAULT 'vendedor',
          permisos TEXT DEFAULT '{}',
          activo INTEGER DEFAULT 1,
          requiere_autorizacion INTEGER DEFAULT 0,
          ultimo_acceso TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        
        -- Copiar datos existentes (username -> email, asignar rol dueño al primer usuario)
        INSERT INTO users_new (id, email, password_hash, rut, nombre, rol, created_at, updated_at)
        SELECT id, username || '@temp.local' as email, password_hash, NULL, NULL, 'dueño', created_at, updated_at
        FROM users;
        
        -- Eliminar tabla antigua
        DROP TABLE users;
        
        -- Renombrar tabla nueva
        ALTER TABLE users_new RENAME TO users;
        
        COMMIT;
      `);

      console.log('✅ Users table migrated successfully! Please update user emails.');
      console.log('⚠️  Note: Existing usernames were converted to email format (username@temp.local)');
    }
  } catch (error) {
    console.error('Error migrating users table:', error);
    try {
      db.exec('ROLLBACK');
    } catch (e) {
      // Ignorar error de rollback
    }
  }

  // Migración: Agregar columnas de permisos a users si no existen
  try {
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasPermisos = tableInfo.some(col => col.name === 'permisos');
    const hasRequiereAutorizacion = tableInfo.some(col => col.name === 'requiere_autorizacion');
    const hasUltimoAcceso = tableInfo.some(col => col.name === 'ultimo_acceso');

    if (!hasPermisos) {
      db.exec(`ALTER TABLE users ADD COLUMN permisos TEXT DEFAULT '{}'`);
      console.log('✅ Column permisos added to users table');
    }
    if (!hasRequiereAutorizacion) {
      db.exec(`ALTER TABLE users ADD COLUMN requiere_autorizacion INTEGER DEFAULT 0`);
      console.log('✅ Column requiere_autorizacion added to users table');
    }
    if (!hasUltimoAcceso) {
      db.exec(`ALTER TABLE users ADD COLUMN ultimo_acceso TEXT`);
      console.log('✅ Column ultimo_acceso added to users table');
    }
  } catch (error) {
    console.error('Error adding permissions columns:', error);
  }

  // Tabla de roles predefinidos con sus permisos
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL,
      descripcion TEXT,
      permisos TEXT NOT NULL,
      es_modificable INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Tabla de auditoría de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      usuario_responsable_id INTEGER,
      accion TEXT NOT NULL,
      datos_anteriores TEXT,
      datos_nuevos TEXT,
      ip_address TEXT,
      detalles TEXT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES users(id),
      FOREIGN KEY (usuario_responsable_id) REFERENCES users(id)
    )
  `);

  // Insertar roles predefinidos si no existen
  const rolesExisten = db.prepare('SELECT COUNT(*) as count FROM roles').get();
  if (rolesExisten.count === 0) {
    const insertRole = db.prepare(`
      INSERT INTO roles (nombre, descripcion, permisos, es_modificable)
      VALUES (?, ?, ?, ?)
    `);

    const roles = [
      {
        nombre: 'dueño',
        descripcion: 'Acceso total al sistema, puede gestionar usuarios y configuración',
        permisos: JSON.stringify({
          facturas: { crear: true, ver: true, editar: true, eliminar: true, emitir: true, anular: true },
          boletas: { crear: true, ver: true, editar: true, eliminar: true, emitir: true, anular: true },
          clientes: { crear: true, ver: true, editar: true, eliminar: true },
          productos: { crear: true, ver: true, editar: true, eliminar: true },
          trabajadores: { crear: true, ver: true, editar: true, eliminar: true },
          caja: { acceder: true, abrir: true, cerrar: true, ver_movimientos: true },
          reportes: { ver: true, exportar: true, financieros: true },
          configuracion: { acceder: true, empresa: true, folios: true, usuarios: true },
          documentos: { ver: true, anular: true, reenviar: true }
        }),
        es_modificable: 0
      },
      {
        nombre: 'administrador',
        descripcion: 'Gestión completa excepto eliminación de ventas y usuarios',
        permisos: JSON.stringify({
          facturas: { crear: true, ver: true, editar: true, eliminar: false, emitir: true, anular: false },
          boletas: { crear: true, ver: true, editar: true, eliminar: false, emitir: true, anular: false },
          clientes: { crear: true, ver: true, editar: true, eliminar: true },
          productos: { crear: true, ver: true, editar: true, eliminar: true },
          trabajadores: { crear: true, ver: true, editar: true, eliminar: false },
          caja: { acceder: true, abrir: true, cerrar: true, ver_movimientos: true },
          reportes: { ver: true, exportar: true, financieros: true },
          configuracion: { acceder: true, empresa: true, folios: true, usuarios: false },
          documentos: { ver: true, anular: false, reenviar: true }
        }),
        es_modificable: 1
      },
      {
        nombre: 'vendedor',
        descripcion: 'Crear ventas y gestionar clientes, sin acceso a eliminación',
        permisos: JSON.stringify({
          facturas: { crear: true, ver: true, editar: false, eliminar: false, emitir: true, anular: false },
          boletas: { crear: true, ver: true, editar: false, eliminar: false, emitir: true, anular: false },
          clientes: { crear: true, ver: true, editar: true, eliminar: false },
          productos: { crear: false, ver: true, editar: false, eliminar: false },
          trabajadores: { crear: false, ver: true, editar: false, eliminar: false },
          caja: { acceder: true, abrir: false, cerrar: false, ver_movimientos: true },
          reportes: { ver: true, exportar: false, financieros: false },
          configuracion: { acceder: false, empresa: false, folios: false, usuarios: false },
          documentos: { ver: true, anular: false, reenviar: false }
        }),
        es_modificable: 1
      },
      {
        nombre: 'cajero',
        descripcion: 'Solo gestión de caja y registro de pagos',
        permisos: JSON.stringify({
          facturas: { crear: false, ver: true, editar: false, eliminar: false, emitir: false, anular: false },
          boletas: { crear: true, ver: true, editar: false, eliminar: false, emitir: true, anular: false },
          clientes: { crear: false, ver: true, editar: false, eliminar: false },
          productos: { crear: false, ver: true, editar: false, eliminar: false },
          trabajadores: { crear: false, ver: true, editar: false, eliminar: false },
          caja: { acceder: true, abrir: true, cerrar: true, ver_movimientos: true },
          reportes: { ver: false, exportar: false, financieros: false },
          configuracion: { acceder: false, empresa: false, folios: false, usuarios: false },
          documentos: { ver: true, anular: false, reenviar: false }
        }),
        es_modificable: 1
      },
      {
        nombre: 'contador',
        descripcion: 'Solo lectura y generación de reportes',
        permisos: JSON.stringify({
          facturas: { crear: false, ver: true, editar: false, eliminar: false, emitir: false, anular: false },
          boletas: { crear: false, ver: true, editar: false, eliminar: false, emitir: false, anular: false },
          clientes: { crear: false, ver: true, editar: false, eliminar: false },
          productos: { crear: false, ver: true, editar: false, eliminar: false },
          trabajadores: { crear: false, ver: true, editar: false, eliminar: false },
          caja: { acceder: true, abrir: false, cerrar: false, ver_movimientos: true },
          reportes: { ver: true, exportar: true, financieros: true },
          configuracion: { acceder: false, empresa: false, folios: false, usuarios: false },
          documentos: { ver: true, anular: false, reenviar: false }
        }),
        es_modificable: 1
      }
    ];

    for (const rol of roles) {
      insertRole.run(rol.nombre, rol.descripcion, rol.permisos, rol.es_modificable);
    }
    console.log('✅ Roles predefinidos insertados correctamente');
  }

  // Migración: Asignar rol y permisos de dueño al primer usuario si no los tiene
  try {
    const primerUsuario = db.prepare('SELECT id, rol, permisos FROM users ORDER BY id ASC LIMIT 1').get();
    
    if (primerUsuario) {
      const necesitaMigracion = !primerUsuario.rol || 
                               primerUsuario.rol === 'vendedor' || 
                               !primerUsuario.permisos || 
                               primerUsuario.permisos === '{}';
      
      if (necesitaMigracion) {
        const rolDueno = db.prepare('SELECT permisos FROM roles WHERE nombre = ?').get('dueño');
        
        if (rolDueno) {
          db.prepare('UPDATE users SET rol = ?, permisos = ? WHERE id = ?')
            .run('dueño', rolDueno.permisos, primerUsuario.id);
          
          console.log('✅ Primer usuario actualizado con rol y permisos de dueño');
        }
      }
    }
  } catch (error) {
    console.error('Error actualizando primer usuario:', error);
  }

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
      updated_at TEXT NOT NULL,
      UNIQUE(tipo_documento)
    )
  `);

  // Tabla de empresas del contador (multi-tenant)
  db.exec(`
    CREATE TABLE IF NOT EXISTS empresas_contador (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contador_id INTEGER NOT NULL,
      rut TEXT UNIQUE NOT NULL,
      razon_social TEXT NOT NULL,
      nombre_fantasia TEXT,
      giro TEXT,
      direccion TEXT,
      comuna TEXT,
      ciudad TEXT,
      region TEXT,
      email TEXT,
      telefono TEXT,
      estado TEXT DEFAULT 'activa',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (contador_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Tabla de vendedores
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      comision REAL DEFAULT 0,
      activo INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tabla de guías de despacho
  db.exec(`
    CREATE TABLE IF NOT EXISTS guias_despacho (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folio INTEGER UNIQUE NOT NULL,
      factura_id INTEGER,
      cliente_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      direccion_despacho TEXT NOT NULL,
      fecha_despacho TEXT,
      transportista TEXT,
      patente TEXT,
      observaciones TEXT,
      estado TEXT DEFAULT 'pendiente',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (factura_id) REFERENCES facturas (id),
      FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    )
  `);

  // Tabla de items de guías de despacho
  db.exec(`
    CREATE TABLE IF NOT EXISTS guia_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guia_id INTEGER NOT NULL,
      numero_linea INTEGER NOT NULL,
      producto_id INTEGER,
      descripcion TEXT NOT NULL,
      cantidad REAL NOT NULL,
      unidad TEXT DEFAULT 'UN',
      FOREIGN KEY (guia_id) REFERENCES guias_despacho (id) ON DELETE CASCADE,
      FOREIGN KEY (producto_id) REFERENCES productos (id)
    )
  `);

  // Tabla de referencias de documentos (para notas de crédito/débito)
  db.exec(`
    CREATE TABLE IF NOT EXISTS referencias_documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documento_id INTEGER NOT NULL,
      tipo_documento_referencia INTEGER NOT NULL,
      folio_referencia INTEGER NOT NULL,
      fecha_referencia TEXT NOT NULL,
      razon_referencia TEXT NOT NULL,
      codigo_referencia INTEGER,
      detalle TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (documento_id) REFERENCES facturas (id) ON DELETE CASCADE
    )
  `);

  // Tabla de pagos (cuentas por cobrar)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      factura_id INTEGER NOT NULL,
      monto REAL NOT NULL,
      fecha_pago TEXT NOT NULL,
      forma_pago TEXT NOT NULL,
      referencia TEXT,
      observaciones TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (factura_id) REFERENCES facturas (id) ON DELETE CASCADE
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
    // Clientes - PRIORIDAD ALTA
    { table: 'clientes', column: 'tipo_documento', definition: 'TEXT DEFAULT "rut_empresa"' },
    { table: 'clientes', column: 'nombre_fantasia', definition: 'TEXT' },
    { table: 'clientes', column: 'contacto_nombre', definition: 'TEXT' },
    { table: 'clientes', column: 'contacto_cargo', definition: 'TEXT' },
    { table: 'clientes', column: 'contacto_email', definition: 'TEXT' },
    { table: 'clientes', column: 'contacto_telefono', definition: 'TEXT' },
    // Clientes - PRIORIDAD MEDIA (Condiciones Comerciales)
    { table: 'clientes', column: 'condicion_pago', definition: 'TEXT DEFAULT "contado"' },
    { table: 'clientes', column: 'dias_credito', definition: 'INTEGER DEFAULT 0' },
    { table: 'clientes', column: 'limite_credito', definition: 'REAL DEFAULT 0' },
    { table: 'clientes', column: 'vendedor_id', definition: 'INTEGER' },
    { table: 'clientes', column: 'zona', definition: 'TEXT' },
    { table: 'clientes', column: 'descuento_automatico', definition: 'REAL DEFAULT 0' },
    { table: 'clientes', column: 'lista_precios', definition: 'TEXT DEFAULT "normal"' },
    // Productos
    { table: 'productos', column: 'exento', definition: 'INTEGER DEFAULT 0' }, // 0 = afecto, 1 = exento de IVA
    // Folios
    { table: 'folios', column: 'updated_at', definition: 'TEXT' }, // Agregar updated_at para compatibilidad
    // Facturas
    { table: 'facturas', column: 'tipo_documento', definition: 'INTEGER DEFAULT 33' },
    { table: 'facturas', column: 'forma_pago', definition: 'TEXT DEFAULT "contado"' },
    { table: 'facturas', column: 'condiciones_pago', definition: 'TEXT' },
    { table: 'facturas', column: 'monto_exento', definition: 'REAL DEFAULT 0' },
    { table: 'facturas', column: 'descuento_global', definition: 'REAL DEFAULT 0' },
    { table: 'facturas', column: 'pdf_path', definition: 'TEXT' }, // Ruta al PDF guardado
    { table: 'facturas', column: 'sii_track_id', definition: 'TEXT' }, // ID de seguimiento del SII
    { table: 'facturas', column: 'sii_estado', definition: 'TEXT' }, // Estado en el SII (ACEPTADO, RECHAZADO, etc)
    { table: 'facturas', column: 'orden_compra', definition: 'TEXT' }, // PRIORIDAD ALTA
    { table: 'facturas', column: 'forma_pago_detalle', definition: 'TEXT' }, // PRIORIDAD ALTA - efectivo, transferencia, cheque, tarjeta
    { table: 'facturas', column: 'vendedor_id', definition: 'INTEGER' }, // PRIORIDAD MEDIA - vendedor asignado
    // Factura Items
    { table: 'factura_items', column: 'numero_linea', definition: 'INTEGER DEFAULT 1' },
    { table: 'factura_items', column: 'codigo_item', definition: 'TEXT' },
    { table: 'factura_items', column: 'unidad', definition: 'TEXT DEFAULT "UN"' },
    { table: 'factura_items', column: 'descuento', definition: 'REAL DEFAULT 0' },
    { table: 'factura_items', column: 'monto_item', definition: 'REAL DEFAULT 0' },
    { table: 'factura_items', column: 'descuento_monto', definition: 'REAL DEFAULT 0' }, // PRIORIDAD ALTA - descuento en pesos
    { table: 'factura_items', column: 'exento', definition: 'INTEGER DEFAULT 0' } // 0 = afecto, 1 = exento de IVA
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

  // Inicializar folios si no existen
  try {
    // Tipo 33: Factura Electrónica
    const folioExists33 = db.prepare('SELECT COUNT(*) as count FROM folios WHERE tipo_documento = 33').get();
    if (folioExists33.count === 0) {
      db.prepare('INSERT INTO folios (tipo_documento, desde, hasta, actual, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        33, // Factura Electrónica
        1,
        10000,
        1,
        new Date().toISOString(),
        new Date().toISOString()
      );
      console.log('Folio inicial creado para Facturas Electrónicas (Tipo 33)');
    }

    // Tipo 52: Guía de Despacho
    const folioExists52 = db.prepare('SELECT COUNT(*) as count FROM folios WHERE tipo_documento = 52').get();
    if (folioExists52.count === 0) {
      db.prepare('INSERT INTO folios (tipo_documento, desde, hasta, actual, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        52, // Guía de Despacho
        1,
        10000,
        1,
        new Date().toISOString(),
        new Date().toISOString()
      );
      console.log('Folio inicial creado para Guía de Despacho (Tipo 52)');
    }

    // Tipo 61: Nota de Crédito
    const folioExists61 = db.prepare('SELECT COUNT(*) as count FROM folios WHERE tipo_documento = 61').get();
    if (folioExists61.count === 0) {
      db.prepare('INSERT INTO folios (tipo_documento, desde, hasta, actual, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        61, // Nota de Crédito
        1,
        10000,
        1,
        new Date().toISOString(),
        new Date().toISOString()
      );
      console.log('Folio inicial creado para Notas de Crédito (Tipo 61)');
    }

    // Tipo 56: Nota de Débito
    const folioExists56 = db.prepare('SELECT COUNT(*) as count FROM folios WHERE tipo_documento = 56').get();
    if (folioExists56.count === 0) {
      db.prepare('INSERT INTO folios (tipo_documento, desde, hasta, actual, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        56, // Nota de Débito
        1,
        10000,
        1,
        new Date().toISOString(),
        new Date().toISOString()
      );
      console.log('Folio inicial creado para Notas de Débito (Tipo 56)');
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
