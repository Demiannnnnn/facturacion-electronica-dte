import { ipcMain } from 'electron';
import bcrypt from 'bcrypt';
import { getDatabase } from '../../database/connection.js';
import { addToSyncQueue } from '../../services/api/sistema/sync-service.js';

const SALT_ROUNDS = 10;

function isConnectivityError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('fetch failed')
  );
}

/**
 * Sistema de gestión de usuarios, roles y permisos
 */
export function registerUsuariosHandlers() {
  
  // ========================================
  // GESTIÓN DE USUARIOS
  // ========================================

  // Obtener todos los usuarios
  ipcMain.handle('usuarios:getAll', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT 
          id, email, rut, nombre, rol, permisos, activo, requiere_autorizacion, ultimo_acceso, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `);
      const usuarios = stmt.all();
      
      // Parse permisos JSON
      return usuarios.map(u => ({
        ...u,
        permisos: u.permisos ? JSON.parse(u.permisos) : {}
      }));
    } catch (error) {
      console.error('Error getting usuarios:', error);
      return { success: false, error: error.message };
    }
  });

  // Obtener un usuario por ID
  ipcMain.handle('usuarios:getById', async (event, id) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT 
          id, email, rut, nombre, rol, permisos, activo, requiere_autorizacion, ultimo_acceso, created_at, updated_at
        FROM users
        WHERE id = ?
      `);
      const usuario = stmt.get(id);
      
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      
      return {
        ...usuario,
        permisos: usuario.permisos ? JSON.parse(usuario.permisos) : {}
      };
    } catch (error) {
      console.error('Error getting usuario:', error);
      return { success: false, error: error.message };
    }
  });

  // Crear nuevo usuario
  ipcMain.handle('usuarios:create', async (event, { email, password, rut, nombre, rol, permisos }) => {
    try {
      console.log('👤 [USUARIOS:create] Solicitud recibida:', {
        email,
        rol,
        tieneNombre: !!nombre,
        tieneRut: !!rut
      });

      // Validaciones
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Email válido es requerido' };
      }

      if (!password || password.length < 8) {
        return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
      }

      if (!rol) {
        return { success: false, error: 'El rol es requerido' };
      }

      const db = getDatabase();

      // Verificar si el email ya existe
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return { success: false, error: 'El email ya está registrado' };
      }

      // Cuentas hijas (empleados) se registran en API externa como trabajador.
      // Se excluyen dueños y contadores de este flujo.
      const shouldCreateExternalTrabajador = rol !== 'dueño' && rol !== 'contador';

      console.log('👤 [USUARIOS:create] Evaluación trabajador externo:', {
        rol,
        shouldCreateExternalTrabajador
      });

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const now = new Date().toISOString();

      // Si no se especifican permisos personalizados, obtener los del rol
      let permisosFinales = permisos;
      if (!permisosFinales) {
        const rolData = db.prepare('SELECT permisos FROM roles WHERE nombre = ?').get(rol);
        if (rolData) {
          permisosFinales = JSON.parse(rolData.permisos);
        }
      }

      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, rut, nombre, rol, permisos, activo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);

      const result = stmt.run(
        email, 
        passwordHash, 
        rut || null, 
        nombre || null, 
        rol, 
        JSON.stringify(permisosFinales || {}),
        now,
        now
      );

      // Registrar en auditoría
      registrarAuditoria(db, result.lastInsertRowid, null, 'CREATE', null, {
        email, rol, nombre, rut
      });

      let syncPending = false;
      let syncError = null;

      if (shouldCreateExternalTrabajador) {
        try {
          const apiTrabajadores = (await import('../../services/api/facturacion/trabajadores.js')).default;
          console.log('📤 [USUARIOS:create] Enviando trabajador a API externa...');
          await apiTrabajadores.createTrabajador({
            email,
            password,
            nombre,
            rut,
            rol,
            permisos: permisosFinales,
            activo: true,
            local_id: result.lastInsertRowid
          });
          console.log('✅ [USUARIOS:create] Trabajador creado en API externa');
        } catch (apiError) {
          syncPending = true;
          syncError = apiError.message || 'No se pudo sincronizar trabajador';

          // Encolar para sync posterior (offline-first)
          addToSyncQueue({
            entity_type: 'trabajador',
            entity_local_id: result.lastInsertRowid,
            operation: 'create',
            payload: {
              local_id: result.lastInsertRowid,
              nombre: nombre || String(email || '').split('@')[0] || `user-${result.lastInsertRowid}`,
              rut: rut || '',
              rol: rol || null,
              permisos: permisosFinales || {},
              password,
              email,
              activo: true
            },
            queued_at: now
          });

          if (isConnectivityError(apiError)) {
            console.warn('📴 [USUARIOS:create] Sin conexión. Trabajador encolado para sincronización posterior.');
          } else {
            console.warn('⚠️ [USUARIOS:create] Trabajador encolado para sincronización posterior:', syncError);
          }
        }
      }

      console.log('✅ [USUARIOS:create] Usuario creado localmente:', {
        id: result.lastInsertRowid,
        email,
        rol
      });

      return {
        success: true,
        syncPending,
        syncError,
        usuario: {
          id: result.lastInsertRowid,
          email,
          nombre,
          rol,
          permisos: permisosFinales
        }
      };
    } catch (error) {
      console.error('Error creating usuario:', error);
      return { success: false, error: error.message };
    }
  });

  // Backfill de trabajadores históricos usando /sync/push
  ipcMain.handle('usuarios:syncTrabajadoresPendientes', async () => {
    try {
      const db = getDatabase();
      const { syncPushOperations } = await import('../../services/api/sistema/sync-service.js');

      const usuariosHijos = db.prepare(`
        SELECT id, email, rut, nombre, rol, activo, updated_at, created_at
        FROM users
        WHERE rol != 'dueño' AND rol != 'contador'
        ORDER BY id ASC
      `).all();

      const operations = usuariosHijos.map((u) => ({
        entity_type: 'trabajador',
        entity_local_id: u.id,
        operation: 'update',
        queued_at: u.updated_at || u.created_at || new Date().toISOString(),
        payload: {
          local_id: u.id,
          nombre: (u.nombre && String(u.nombre).trim()) || String(u.email || '').split('@')[0] || `user-${u.id}`,
          rut: u.rut || '',
          cargo: u.rol || null,
          email: u.email,
          activo: Boolean(u.activo)
        }
      }));

      if (operations.length === 0) {
        return {
          success: true,
          message: 'No hay trabajadores pendientes para sincronizar',
          total: 0,
          synced: 0,
          conflicts: 0,
          failed: 0
        };
      }

      const pushResult = await syncPushOperations(operations);
      if (!pushResult.success) {
        return {
          success: false,
          error: pushResult.error || 'No se pudo sincronizar trabajadores',
          total: operations.length,
          synced: 0,
          conflicts: 0,
          failed: operations.length,
          details: pushResult
        };
      }

      return {
        success: true,
        total: operations.length,
        synced: pushResult.results?.length || 0,
        conflicts: pushResult.conflicts?.length || 0,
        failed: pushResult.failed?.length || 0,
        details: pushResult
      };
    } catch (error) {
      console.error('❌ [USUARIOS:syncTrabajadoresPendientes] Error:', error);
      return { success: false, error: error.message };
    }
  });

  // Actualizar usuario
  ipcMain.handle('usuarios:update', async (event, { id, email, rut, nombre, rol, permisos, activo }) => {
    try {
      const db = getDatabase();

      // Obtener datos anteriores para auditoría
      const usuarioAnterior = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!usuarioAnterior) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const updates = [];
      const values = [];

      if (email !== undefined) {
        // Verificar que el email no esté en uso por otro usuario
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
        if (existingUser) {
          return { success: false, error: 'El email ya está registrado por otro usuario' };
        }
        updates.push('email = ?');
        values.push(email);
      }

      if (rut !== undefined) {
        updates.push('rut = ?');
        values.push(rut);
      }

      if (nombre !== undefined) {
        updates.push('nombre = ?');
        values.push(nombre);
      }

      if (rol !== undefined) {
        updates.push('rol = ?');
        values.push(rol);

        // Si cambia el rol y no se especifican permisos personalizados, usar los del nuevo rol
        if (permisos === undefined) {
          const rolData = db.prepare('SELECT permisos FROM roles WHERE nombre = ?').get(rol);
          if (rolData) {
            updates.push('permisos = ?');
            values.push(rolData.permisos);
          }
        }
      }

      if (permisos !== undefined) {
        updates.push('permisos = ?');
        values.push(JSON.stringify(permisos));
      }

      if (activo !== undefined) {
        updates.push('activo = ?');
        values.push(activo ? 1 : 0);
      }

      if (updates.length === 0) {
        return { success: false, error: 'No hay cambios para actualizar' };
      }

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      const stmt = db.prepare(`
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = ?
      `);

      stmt.run(...values);

      // Obtener datos nuevos para auditoría
      const usuarioNuevo = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

      registrarAuditoria(db, id, null, 'UPDATE', 
        { email: usuarioAnterior.email, rol: usuarioAnterior.rol, activo: usuarioAnterior.activo },
        { email: usuarioNuevo.email, rol: usuarioNuevo.rol, activo: usuarioNuevo.activo }
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating usuario:', error);
      return { success: false, error: error.message };
    }
  });

  // Cambiar contraseña de usuario
  ipcMain.handle('usuarios:changePassword', async (event, { id, newPassword, requestedBy }) => {
    try {
      if (!newPassword || newPassword.length < 8) {
        return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
      }

      const db = getDatabase();
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      const now = new Date().toISOString();

      const stmt = db.prepare(`
        UPDATE users 
        SET password_hash = ?, updated_at = ?
        WHERE id = ?
      `);

      stmt.run(passwordHash, now, id);

      registrarAuditoria(db, id, requestedBy, 'CHANGE_PASSWORD', null, null);

      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: error.message };
    }
  });

  // Activar/Desactivar usuario
  ipcMain.handle('usuarios:toggleActive', async (event, { id, activo, requestedBy }) => {
    try {
      const db = getDatabase();
      
      const stmt = db.prepare(`
        UPDATE users 
        SET activo = ?, updated_at = ?
        WHERE id = ?
      `);

      stmt.run(activo ? 1 : 0, new Date().toISOString(), id);

      registrarAuditoria(db, id, requestedBy, activo ? 'ACTIVATE' : 'DEACTIVATE', null, null);

      return { success: true };
    } catch (error) {
      console.error('Error toggling usuario active:', error);
      return { success: false, error: error.message };
    }
  });

  // Eliminar usuario
  ipcMain.handle('usuarios:delete', async (event, { id, requestedBy }) => {
    try {
      const db = getDatabase();

      // No permitir eliminar si es el único usuario dueño
      const countDuenos = db.prepare('SELECT COUNT(*) as count FROM users WHERE rol = ? AND activo = 1 AND id != ?').get('dueño', id);
      const usuario = db.prepare('SELECT rol FROM users WHERE id = ?').get(id);
      
      if (usuario.rol === 'dueño' && countDuenos.count === 0) {
        return { success: false, error: 'No se puede eliminar el único usuario dueño del sistema' };
      }

      const stmt = db.prepare('DELETE FROM users WHERE id = ?');
      stmt.run(id);

      registrarAuditoria(db, id, requestedBy, 'DELETE', null, null);

      return { success: true };
    } catch (error) {
      console.error('Error deleting usuario:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // GESTIÓN DE ROLES
  // ========================================

  // Obtener todos los roles
  ipcMain.handle('roles:getAll', async () => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT * FROM roles ORDER BY nombre');
      const roles = stmt.all();
      
      return roles.map(r => ({
        ...r,
        permisos: JSON.parse(r.permisos)
      }));
    } catch (error) {
      console.error('Error getting roles:', error);
      return { success: false, error: error.message };
    }
  });

  // Obtener permisos de un rol específico
  ipcMain.handle('roles:getPermisos', async (event, nombreRol) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT permisos FROM roles WHERE nombre = ?');
      const rol = stmt.get(nombreRol);
      
      if (!rol) {
        return { success: false, error: 'Rol no encontrado' };
      }
      
      return {
        success: true,
        permisos: JSON.parse(rol.permisos)
      };
    } catch (error) {
      console.error('Error getting rol permisos:', error);
      return { success: false, error: error.message };
    }
  });

  // Actualizar permisos de un rol (solo si es modificable)
  ipcMain.handle('roles:updatePermisos', async (event, { nombreRol, permisos }) => {
    try {
      const db = getDatabase();
      
      // Verificar que el rol sea modificable
      const rol = db.prepare('SELECT es_modificable FROM roles WHERE nombre = ?').get(nombreRol);
      if (!rol) {
        return { success: false, error: 'Rol no encontrado' };
      }
      
      if (!rol.es_modificable) {
        return { success: false, error: 'Este rol no puede ser modificado' };
      }

      const stmt = db.prepare(`
        UPDATE roles 
        SET permisos = ?, updated_at = ?
        WHERE nombre = ?
      `);

      stmt.run(JSON.stringify(permisos), new Date().toISOString(), nombreRol);

      // Actualizar permisos de todos los usuarios con este rol
      const updateUsers = db.prepare(`
        UPDATE users 
        SET permisos = ?, updated_at = ?
        WHERE rol = ?
      `);

      updateUsers.run(JSON.stringify(permisos), new Date().toISOString(), nombreRol);

      return { success: true };
    } catch (error) {
      console.error('Error updating rol permisos:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // VALIDACIÓN DE PERMISOS
  // ========================================

  // Verificar si un usuario tiene un permiso específico
  ipcMain.handle('usuarios:checkPermission', async (event, { userId, recurso, accion }) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT permisos, activo FROM users WHERE id = ?');
      const usuario = stmt.get(userId);
      
      if (!usuario || !usuario.activo) {
        return { success: false, hasPermission: false, error: 'Usuario no encontrado o inactivo' };
      }

      const permisos = JSON.parse(usuario.permisos);
      const hasPermission = permisos[recurso] && permisos[recurso][accion] === true;

      return { success: true, hasPermission };
    } catch (error) {
      console.error('Error checking permission:', error);
      return { success: false, hasPermission: false, error: error.message };
    }
  });

  // Obtener todos los permisos de un usuario
  ipcMain.handle('usuarios:getPermisos', async (event, userId) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare('SELECT permisos, rol FROM users WHERE id = ?');
      const usuario = stmt.get(userId);
      
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      return {
        success: true,
        rol: usuario.rol,
        permisos: JSON.parse(usuario.permisos)
      };
    } catch (error) {
      console.error('Error getting usuario permisos:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // AUDITORÍA
  // ========================================

  // Obtener historial de auditoría de un usuario
  ipcMain.handle('usuarios:getAuditLog', async (event, userId) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT 
          a.*,
          u1.email as usuario_email,
          u2.email as responsable_email
        FROM audit_usuarios a
        LEFT JOIN users u1 ON a.usuario_id = u1.id
        LEFT JOIN users u2 ON a.usuario_responsable_id = u2.id
        WHERE a.usuario_id = ?
        ORDER BY a.timestamp DESC
        LIMIT 100
      `);
      
      const logs = stmt.all(userId);
      
      return logs.map(log => ({
        ...log,
        datos_anteriores: log.datos_anteriores ? JSON.parse(log.datos_anteriores) : null,
        datos_nuevos: log.datos_nuevos ? JSON.parse(log.datos_nuevos) : null
      }));
    } catch (error) {
      console.error('Error getting audit log:', error);
      return { success: false, error: error.message };
    }
  });

  // Actualizar último acceso del usuario
  ipcMain.handle('usuarios:updateLastAccess', async (event, userId) => {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        UPDATE users 
        SET ultimo_acceso = ?
        WHERE id = ?
      `);
      
      stmt.run(new Date().toISOString(), userId);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating last access:', error);
      return { success: false, error: error.message };
    }
  });
}

/**
 * Función auxiliar para registrar acciones en la tabla de auditoría
 */
function registrarAuditoria(db, usuarioId, responsableId, accion, datosAnteriores, datosNuevos, detalles = null) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_usuarios (usuario_id, usuario_responsable_id, accion, datos_anteriores, datos_nuevos, detalles)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      usuarioId,
      responsableId || null,
      accion,
      datosAnteriores ? JSON.stringify(datosAnteriores) : null,
      datosNuevos ? JSON.stringify(datosNuevos) : null,
      detalles || null
    );
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
}
