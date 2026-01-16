import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const homeDir = os.homedir();
  const configDir = path.join(homeDir, '.config', `sistema-facturacion-${profileName}`);
  
  // Crear directorio si no existe
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  return path.join(configDir, 'facturacion.dev.db');
}

function createTables(db) {
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

  // Tablas adicionales necesarias para que la app funcione
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vendedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT,
      telefono TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function seedProfile(profile) {
  console.log(`\n📝 Seeding profile: ${profile.name}`);
  
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
    createTables(db);
    console.log(`   ✅ Tables created`);
    
    // Insertar usuario
    const hashedPassword = await bcrypt.hash(profile.user.password, 10);
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
    
  } catch (error) {
    console.error(`   ❌ Error seeding profile ${profile.name}:`, error);
  } finally {
    db.close();
  }
}

async function seedAll() {
  console.log('🌱 Starting seed process for all development profiles...\n');
  console.log('='.repeat(60));
  
  for (const profile of profiles) {
    await seedProfile(profile);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All profiles seeded successfully!');
  console.log('\n📋 Available commands:');
  console.log('   npm run dev:contador   → Load contador profile');
  console.log('   npm run dev:empresa    → Load empresa profile');
  console.log('   npm run dev:personaA   → Load persona honorarios profile');
  console.log('   npm run dev:personaB   → Load persona comerciante profile');
  console.log('\n📄 See testing.md for credentials\n');
}

seedAll().catch(console.error);
