import { getDatabase } from '../database/connection.js';

/**
 * Sistema de validación de permisos
 * Proporciona funciones para verificar permisos de usuarios antes de ejecutar acciones
 */

/**
 * Obtener permisos de un usuario por su ID
 * @param {number} userId - ID del usuario
 * @returns {Object|null} - Objeto con permisos o null si no existe
 */
export function getUserPermisos(userId) {
  try {
    const db = getDatabase();
    const stmt = db.prepare('SELECT permisos, rol, activo FROM users WHERE id = ?');
    const usuario = stmt.get(userId);
    
    if (!usuario || !usuario.activo) {
      return null;
    }

    return {
      rol: usuario.rol,
      permisos: JSON.parse(usuario.permisos || '{}')
    };
  } catch (error) {
    console.error('Error getting user permisos:', error);
    return null;
  }
}

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {number} userId - ID del usuario
 * @param {string} recurso - Recurso (ej: 'facturas', 'clientes')
 * @param {string} accion - Acción (ej: 'crear', 'editar', 'eliminar')
 * @returns {boolean} - true si tiene permiso, false si no
 */
export function hasPermission(userId, recurso, accion) {
  const userPermisos = getUserPermisos(userId);
  
  if (!userPermisos) {
    return false;
  }

  // El dueño siempre tiene todos los permisos
  if (userPermisos.rol === 'dueño') {
    return true;
  }

  const permisos = userPermisos.permisos;
  return permisos[recurso] && permisos[recurso][accion] === true;
}

/**
 * Middleware para validar permisos antes de ejecutar una acción
 * @param {number} userId - ID del usuario
 * @param {string} recurso - Recurso que se intenta acceder
 * @param {string} accion - Acción que se intenta realizar
 * @returns {Object} - { autorizado: boolean, error?: string }
 */
export function requirePermission(userId, recurso, accion) {
  if (!userId) {
    return {
      autorizado: false,
      error: 'Usuario no autenticado'
    };
  }

  const userPermisos = getUserPermisos(userId);
  
  if (!userPermisos) {
    return {
      autorizado: false,
      error: 'Usuario no encontrado o inactivo'
    };
  }

  // El dueño siempre tiene acceso
  if (userPermisos.rol === 'dueño') {
    return { autorizado: true };
  }

  const tienePermiso = userPermisos.permisos[recurso] && 
                       userPermisos.permisos[recurso][accion] === true;

  if (!tienePermiso) {
    return {
      autorizado: false,
      error: `No tienes permiso para ${accion} ${recurso}`
    };
  }

  return { autorizado: true };
}

/**
 * Verificar si el usuario es dueño o administrador
 * @param {number} userId - ID del usuario
 * @returns {boolean}
 */
export function isAdminOrOwner(userId) {
  const userPermisos = getUserPermisos(userId);
  if (!userPermisos) return false;
  
  return userPermisos.rol === 'dueño' || userPermisos.rol === 'administrador';
}

/**
 * Verificar si el usuario es dueño
 * @param {number} userId - ID del usuario
 * @returns {boolean}
 */
export function isOwner(userId) {
  const userPermisos = getUserPermisos(userId);
  if (!userPermisos) return false;
  
  return userPermisos.rol === 'dueño';
}

/**
 * Obtener todos los permisos organizados por categoría
 * @returns {Object} - Estructura de permisos disponibles
 */
export function getPermisosEstructura() {
  return {
    facturas: {
      label: 'Facturas',
      acciones: {
        crear: 'Crear facturas',
        ver: 'Ver facturas',
        editar: 'Editar facturas',
        eliminar: 'Eliminar facturas',
        emitir: 'Emitir al SII',
        anular: 'Anular facturas'
      }
    },
    boletas: {
      label: 'Boletas',
      acciones: {
        crear: 'Crear boletas',
        ver: 'Ver boletas',
        editar: 'Editar boletas',
        eliminar: 'Eliminar boletas',
        emitir: 'Emitir al SII',
        anular: 'Anular boletas'
      }
    },
    clientes: {
      label: 'Clientes',
      acciones: {
        crear: 'Crear clientes',
        ver: 'Ver clientes',
        editar: 'Editar clientes',
        eliminar: 'Eliminar clientes'
      }
    },
    productos: {
      label: 'Productos',
      acciones: {
        crear: 'Crear productos',
        ver: 'Ver productos',
        editar: 'Editar productos',
        eliminar: 'Eliminar productos'
      }
    },
    trabajadores: {
      label: 'Trabajadores',
      acciones: {
        crear: 'Crear trabajadores',
        ver: 'Ver trabajadores',
        editar: 'Editar trabajadores',
        eliminar: 'Eliminar trabajadores'
      }
    },
    caja: {
      label: 'Caja',
      acciones: {
        acceder: 'Acceder a caja',
        abrir: 'Abrir caja',
        cerrar: 'Cerrar caja',
        ver_movimientos: 'Ver movimientos'
      }
    },
    reportes: {
      label: 'Reportes',
      acciones: {
        ver: 'Ver reportes',
        exportar: 'Exportar reportes',
        financieros: 'Ver reportes financieros'
      }
    },
    configuracion: {
      label: 'Configuración',
      acciones: {
        acceder: 'Acceder a configuración',
        empresa: 'Configurar empresa',
        folios: 'Gestionar folios',
        usuarios: 'Gestionar usuarios'
      }
    },
    documentos: {
      label: 'Documentos',
      acciones: {
        ver: 'Ver documentos',
        anular: 'Anular documentos',
        reenviar: 'Reenviar documentos'
      }
    }
  };
}

/**
 * Validar estructura de permisos
 * @param {Object} permisos - Objeto de permisos a validar
 * @returns {boolean}
 */
export function validarPermisos(permisos) {
  try {
    const estructura = getPermisosEstructura();
    
    for (const recurso in permisos) {
      if (!estructura[recurso]) {
        return false;
      }
      
      for (const accion in permisos[recurso]) {
        if (!estructura[recurso].acciones[accion]) {
          return false;
        }
        
        if (typeof permisos[recurso][accion] !== 'boolean') {
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
