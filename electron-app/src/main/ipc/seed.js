import { ipcMain, app } from 'electron';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const SALT_ROUNDS = 10;

// Perfiles de testing con sus datos
const profiles = [
  {
    name: 'contador',
    user: {
      username: 'contador',
      password: 'contador123',
      email: 'contador@test.cl'
    },
    config: {
      user_role: 'contador',
      contador_rut: '12.345.678-9',
      contador_razon_social: 'Contador Test SpA',
      contador_email: 'contador@test.cl',
      contador_telefono: '+56912345678'
    }
  },
  {
    name: 'empresa',
    user: {
      username: 'empresa',
      password: 'empresa123',
      email: 'empresa@test.cl'
    },
    config: {
      user_role: 'empresa'
    },
    emisor: {
      rut: '76.123.456-7',
      razon_social: 'Empresa Test Ltda',
      nombre_fantasia: 'Test Company',
      giro: 'Comercio al por mayor',
      direccion: 'Av. Providencia 123',
      comuna: 'Providencia',
      ciudad: 'Santiago',
      email: 'contacto@empresa.test',
      telefono: '+56987654321'
    }
  },
  {
    name: 'personaA',
    user: {
      username: 'honorarios',
      password: 'honorarios123',
      email: 'honorarios@test.cl'
    },
    config: {
      user_role: 'persona_natural',
      user_subtype: 'honorarios'
    },
    emisor: {
      rut: '18.765.432-1',
      razon_social: 'Juan Pérez González',
      nombre_fantasia: 'Consultorías JP',
      giro: 'Servicios profesionales de consultoría',
      direccion: 'Los Aromos 456',
      comuna: 'Las Condes',
      ciudad: 'Santiago',
      email: 'juan.perez@test.cl',
      telefono: '+56911223344'
    }
  },
  {
    name: 'personaB',
    user: {
      username: 'comerciante',
      password: 'comerciante123',
      email: 'comerciante@test.cl'
    },
    config: {
      user_role: 'persona_natural',
      user_subtype: 'comerciante'
    },
    emisor: {
      rut: '19.876.543-2',
      razon_social: 'María González López',
      nombre_fantasia: 'Emprendimientos MG',
      giro: 'Comercio menor de productos varios',
      direccion: 'Pasaje Los Pinos 789',
      comuna: 'Ñuñoa',
      ciudad: 'Santiago',
      email: 'maria.gonzalez@test.cl',
      telefono: '+56922334455'
    }
  }
];

function getDbPath(profileName) {
  // Obtener el userData path base SIN el perfil actual
  const originalUserData = app.getPath('userData');
  
  // Si estamos en un perfil (contiene guión), obtener el path base
  let baseDir, baseName;
  
  if (originalUserData.includes('sistema-facturacion-')) {
    // Estamos en un perfil, extraer el base
    const parts = originalUserData.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Si tiene perfil, quitar el perfil actual
    if (lastPart.match(/sistema-facturacion-\w+$/)) {
      baseName = 'sistema-facturacion';
      baseDir = parts.slice(0, -1).join('/');
    } else {
      baseName = lastPart;
      baseDir = parts.slice(0, -1).join('/');
    }
  } else {
    // Path normal
    baseDir = path.dirname(originalUserData);
    baseName = 'sistema-facturacion';
  }
  
  const configDir = path.join(baseDir, `${baseName}-${profileName}`);
  
  // Crear directorio si no existe
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  return path.join(configDir, 'facturacion.dev.db');
}

function createTablesForSeed(db) {
  // Tabla usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Tabla config
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla emisor
  db.exec(`
    CREATE TABLE IF NOT EXISTS emisor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rut TEXT NOT NULL,
      razon_social TEXT NOT NULL,
      nombre_fantasia TEXT,
      giro TEXT,
      direccion TEXT,
      comuna TEXT,
      ciudad TEXT,
      email TEXT,
      telefono TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tablas adicionales
  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rut TEXT UNIQUE NOT NULL,
      razon_social TEXT NOT NULL,
      nombre_fantasia TEXT,
      giro TEXT,
      direccion TEXT,
      comuna TEXT,
      ciudad TEXT,
      email TEXT,
      telefono TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      categoria TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vendedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS facturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER,
      cliente_id INTEGER,
      cliente_nombre TEXT,
      fecha DATE,
      total REAL,
      estado TEXT DEFAULT 'pendiente',
      detalles TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS folios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo_documento TEXT NOT NULL,
      desde INTEGER NOT NULL,
      hasta INTEGER NOT NULL,
      actual INTEGER NOT NULL,
      fecha_autorizacion DATE,
      estado TEXT DEFAULT 'activo',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}

async function seedProfile(profile) {
  console.log(`📝 Seeding profile: ${profile.name}`);
  
  const dbPath = getDbPath(profile.name);
  console.log(`   DB Path: ${dbPath}`);
  
  // Eliminar DB anterior si existe
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`   ♻️  Removed old database`);
  }
  
  const db = new Database(dbPath);
  
  try {
    // Crear tablas
    createTablesForSeed(db);
    console.log(`   ✅ Tables created`);
    
    // Insertar usuario
    const hashedPassword = await bcrypt.hash(profile.user.password, SALT_ROUNDS);
    const now = new Date().toISOString();
    const insertUser = db.prepare(`
      INSERT INTO users (username, password_hash, created_at, updated_at) 
      VALUES (?, ?, ?, ?)
    `);
    insertUser.run(profile.user.username, hashedPassword, now, now);
    console.log(`   ✅ User created: ${profile.user.username}`);
    
    // Insertar configuración
    const insertConfig = db.prepare(`
      INSERT OR REPLACE INTO config (key, value) 
      VALUES (?, ?)
    `);
    
    Object.entries(profile.config).forEach(([key, value]) => {
      insertConfig.run(key, value);
    });
    console.log(`   ✅ Config saved (role: ${profile.config.user_role})`);
    
    // Insertar emisor si existe
    if (profile.emisor) {
      const insertEmisor = db.prepare(`
        INSERT INTO emisor (rut, razon_social, nombre_fantasia, giro, direccion, comuna, ciudad, email, telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertEmisor.run(
        profile.emisor.rut,
        profile.emisor.razon_social,
        profile.emisor.nombre_fantasia,
        profile.emisor.giro,
        profile.emisor.direccion,
        profile.emisor.comuna,
        profile.emisor.ciudad,
        profile.emisor.email,
        profile.emisor.telefono
      );
      console.log(`   ✅ Emisor created: ${profile.emisor.razon_social}`);
    }
    
    console.log(`   🎉 Profile "${profile.name}" seeded successfully!`);
    
    return { success: true };
    
  } catch (error) {
    console.error(`   ❌ Error seeding profile ${profile.name}:`, error);
    return { success: false, error: error.message };
  } finally {
    db.close();
  }
}

export function registerSeedHandlers() {
  ipcMain.handle('seed:all', async () => {
    console.log('🌱 Starting seed process for all development profiles...');
    
    const results = [];
    
    for (const profile of profiles) {
      const result = await seedProfile(profile);
      results.push({ profile: profile.name, ...result });
    }
    
    console.log('✅ All profiles seeded!');
    
    return {
      success: results.every(r => r.success),
      results
    };
  });

  ipcMain.handle('seed:profile', async (event, profileName) => {
    const profile = profiles.find(p => p.name === profileName);
    
    if (!profile) {
      return { success: false, error: `Profile "${profileName}" not found` };
    }
    
    return await seedProfile(profile);
  });

  console.log('Seed IPC handlers registered');
}
