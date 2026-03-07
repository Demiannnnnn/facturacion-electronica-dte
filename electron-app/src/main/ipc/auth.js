import { ipcMain } from 'electron';
import bcrypt from 'bcrypt';
import { getDatabase, isFirstRun } from '../database/connection.js';
import { setCurrentUser, getCurrentUser, clearCurrentUser } from '../utils/session.js';
import tokenStore from '../utils/tokenStore.js';

const SALT_ROUNDS = 10;

export function registerAuthHandlers() {
  // Verificar si es la primera vez que se ejecuta la app
  ipcMain.handle('auth:checkFirstRun', async () => {
    try {
      const firstRun = isFirstRun();
      console.log('First run check:', firstRun);
      return { isFirstRun: firstRun };
    } catch (error) {
      console.error('Error checking first run:', error);
      return { isFirstRun: true, error: error.message };
    }
  });

  // Registrar primer usuario
  ipcMain.handle('auth:register', async (event, { email, password, rut, nombre }) => {
    try {
      // Validaciones
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Email válido es requerido' };
      }

      if (!password || password.length < 8) {
        return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
      }

      // Verificar que no haya usuarios existentes
      if (!isFirstRun()) {
        return { success: false, error: 'Ya existe un usuario registrado' };
      }

      const db = getDatabase();

      // Primero registrar en la API externa (si está disponible)
      try {
        const apiAuth = (await import('../services/api/auth.js')).default;
        const apiResult = await apiAuth.register(email, password, rut, nombre);
        console.log('External API register result:', apiResult);
        if (!apiResult || apiResult.success === false) {
          // Si la API devuelve error, detener el registro local
          return { success: false, error: apiResult?.error || 'Error en el registro externo' };
        }

        // Extraer tokens desde distintos formatos posibles que devuelva la API
        const access = apiResult.accessToken
          || (apiResult.tokens && apiResult.tokens.accessToken)
          || (apiResult.data && (apiResult.data.token || apiResult.data.accessToken))
          || apiResult.token || null;
        const refresh = apiResult.refreshToken
          || (apiResult.tokens && apiResult.tokens.refreshToken)
          || (apiResult.data && apiResult.data.refreshToken)
          || null;
        if (access || refresh) {
          try {
            await tokenStore.setTokens({ access, refresh });
            console.log('Tokens saved after external registration - access present?', !!access, 'access:', access ? access.slice(0,10)+'...' : null);
          } catch (e) {
            console.warn('Could not save tokens after registration:', e);
          }
        }
      } catch (apiError) {
        console.error('Error registering user in API:', apiError);
        return { success: false, error: 'Error al registrar usuario en el servidor externo' };
      }

      // Si la API fue exitosa, proceder a crear el usuario localmente
      // Hashear contraseña
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Insertar usuario con rol de dueño (primer usuario)
      const now = new Date().toISOString();
      
      // Obtener permisos completos del rol dueño
      const rolesDb = db.prepare('SELECT permisos FROM roles WHERE nombre = ?');
      const rolDueno = rolesDb.get('dueño');
      const permisosCompletos = rolDueno ? rolDueno.permisos : null;
      
      const stmt = db.prepare(
        'INSERT INTO users (email, password_hash, rut, nombre, rol, permisos, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const result = stmt.run(email, passwordHash, rut, nombre, 'dueño', permisosCompletos, now, now);

      console.log('User registered successfully locally:', email, 'with role: dueño');

      return {
        success: true,
        user: {
          id: result.lastInsertRowid,
          email,
          nombre
        }
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  });

  // Login
  ipcMain.handle('auth:login', async (event, { email, password }) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email y contraseña son requeridos' };
      }

      const db = getDatabase();
      // Buscar usuario localmente
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar contraseña
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      // Si el usuario no tiene rol (usuario antiguo), asignar rol de dueño si es el primer usuario
      if (!user.rol && user.id === 1) {
        const rolesDb = db.prepare('SELECT permisos FROM roles WHERE nombre = ?');
        const rolDueno = rolesDb.get('dueño');
        const permisosCompletos = rolDueno ? rolDueno.permisos : null;
        
        const updateStmt = db.prepare('UPDATE users SET rol = ?, permisos = ? WHERE id = ?');
        updateStmt.run('dueño', permisosCompletos, user.id);
        
        user.rol = 'dueño';
        user.permisos = permisosCompletos;
        console.log('Assigned dueño role to first user:', user.email);
      }

      const userData = { 
        id: user.id, 
        email: user.email, 
        nombre: user.nombre, 
        rut: user.rut,
        rol: user.rol,
        permisos: user.permisos 
      };

      // Intentar autenticar contra la API externa para obtener tokens (si disponible)
      try {
        const apiAuth = (await import('../services/api/auth.js')).default;
        const apiResult = await apiAuth.login(email, password);
        console.log('External API login result:', apiResult);
        if (apiResult && apiResult.success !== false) {
          const access = apiResult.accessToken
            || (apiResult.tokens && apiResult.tokens.accessToken)
            || (apiResult.data && (apiResult.data.token || apiResult.data.accessToken))
            || apiResult.token || null;
          const refresh = apiResult.refreshToken
            || (apiResult.tokens && apiResult.tokens.refreshToken)
            || (apiResult.data && apiResult.data.refreshToken)
            || null;
          if (access || refresh) {
            try {
              await tokenStore.setTokens({ access, refresh });
              console.log('Tokens saved after external login - access present?', !!access, 'access:', access ? access.slice(0,10)+'...' : null);
            } catch (e) {
              console.warn('Could not save tokens after login:', e);
            }
          }
        }
      } catch (apiErr) {
        console.warn('External API login failed (optional):', apiErr);
      }

      setCurrentUser(userData);

      console.log('User logged in:', email);

      return {
        success: true,
        user: userData
      };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
    }
  });

  // Obtener usuario actual
  ipcMain.handle('auth:getCurrentUser', async () => {
    try {
      const user = getCurrentUser();
      return { success: true, user };
    } catch (error) {
      console.error('Error getting current user:', error);
      return { success: false, error: error.message };
    }
  });

  // Logout
  ipcMain.handle('auth:logout', async () => {
    try {
      clearCurrentUser();
      console.log('User logged out');
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error: error.message };
    }
  });

  // Cambiar contraseña
  ipcMain.handle('auth:changePassword', async (event, { userId, currentPassword, newPassword }) => {
    try {
      // Validaciones
      if (!userId || !currentPassword || !newPassword) {
        return { success: false, error: 'Todos los campos son requeridos' };
      }

      if (newPassword.length < 8) {
        return { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres' };
      }

      if (currentPassword === newPassword) {
        return { success: false, error: 'La nueva contraseña debe ser diferente a la actual' };
      }

      const db = getDatabase();

      // Obtener usuario
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(userId);

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar contraseña actual
      const match = await bcrypt.compare(currentPassword, user.password_hash);

      if (!match) {
        return { success: false, error: 'La contraseña actual es incorrecta' };
      }

      // Hashear nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Actualizar contraseña
      const now = new Date().toISOString();
      const updateStmt = db.prepare(
        'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
      );

      updateStmt.run(newPasswordHash, now, userId);

      console.log('Password changed successfully for user:', user.email);

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('Auth IPC handlers registered');
}
