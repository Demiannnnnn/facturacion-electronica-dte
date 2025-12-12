import { ipcMain } from 'electron';
import bcrypt from 'bcrypt';
import { getDatabase, isFirstRun } from '../database/connection.js';
import { setCurrentUser, getCurrentUser, clearCurrentUser } from '../utils/session.js';

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
  ipcMain.handle('auth:register', async (event, { username, password }) => {
    try {
      // Validaciones
      if (!username || username.length < 3 || username.length > 50) {
        return { success: false, error: 'El nombre de usuario debe tener entre 3 y 50 caracteres' };
      }

      if (!password || password.length < 8) {
        return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
      }

      // Verificar que no haya usuarios existentes
      if (!isFirstRun()) {
        return { success: false, error: 'Ya existe un usuario registrado' };
      }

      const db = getDatabase();

      // Hashear contraseña
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Insertar usuario
      const now = new Date().toISOString();
      const stmt = db.prepare(
        'INSERT INTO users (username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)'
      );

      const result = stmt.run(username, passwordHash, now, now);

      console.log('User registered successfully:', username);

      return {
        success: true,
        user: {
          id: result.lastInsertRowid,
          username
        }
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  });

  // Login
  ipcMain.handle('auth:login', async (event, { username, password }) => {
    try {
      if (!username || !password) {
        return { success: false, error: 'Usuario y contraseña son requeridos' };
      }

      const db = getDatabase();

      // Buscar usuario
      const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get(username);

      if (!user) {
        return { success: false, error: 'Usuario o contraseña incorrectos' };
      }

      // Verificar contraseña
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) {
        return { success: false, error: 'Usuario o contraseña incorrectos' };
      }

      // Establecer sesión
      const userData = {
        id: user.id,
        username: user.username
      };

      setCurrentUser(userData);

      console.log('User logged in:', username);

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

      console.log('Password changed successfully for user:', user.username);

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('Auth IPC handlers registered');
}
