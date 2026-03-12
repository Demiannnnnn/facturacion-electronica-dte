import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permisos, setPermisos] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    checkFirstRun();
  }, []);

  const checkFirstRun = async () => {
    try {
      const result = await window.api.auth.checkFirstRun();
      setIsFirstRun(result.isFirstRun);
    } catch (error) {
      console.error('Error checking first run:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFirstRun = async () => {
    try {
      const result = await window.api.auth.checkFirstRun();
      setIsFirstRun(result.isFirstRun);
      return result;
    } catch (error) {
      console.error('Error refreshing first run:', error);
      return { isFirstRun: true, error };
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await window.api.auth.login({ email, password });
      if (!result.success) {
        return result;
      }

      // Verificar suscripción después del login para asegurar que exista token
      const subStatus = await window.api.subscription.getStatus();

      // Si el grace period offline expiró, necesita conexión
      if (subStatus.offlineExpired) {
        return {
          success: false,
          error: subStatus.reason || 'Se requiere conexión a internet para verificar tu licencia',
          needsConnection: true
        };
      }

      if (!subStatus.hasActiveSubscription) {
        return {
          success: false,
          error: 'No tienes una suscripción activa',
          needsSubscription: true
        };
      }

      // Si la suscripción está por vencer (menos de 7 días)
      if (subStatus.daysRemaining && subStatus.daysRemaining <= 7) {
        console.warn(`⚠️ Suscripción vence en ${subStatus.daysRemaining} días`);
      }

      // Informar si estamos en modo offline
      if (subStatus.isOffline) {
        console.warn(`📴 Modo offline - grace period: ${subStatus.offlineGraceRemaining} día(s) restante(s)`);
      }

      setSubscription(subStatus);
      setIsOffline(subStatus.isOffline || false);
      setUser(result.user);
      setIsFirstRun(false);
        
      // Cargar permisos del usuario
      if (result.user?.id) {
        // Si el usuario ya tiene rol y permisos en el objeto (nuevo sistema)
        if (result.user.rol) {
          let permisosObj = result.user.permisos;
          // Si permisos es un string JSON, parsearlo
          if (typeof permisosObj === 'string') {
            try {
              permisosObj = JSON.parse(permisosObj);
            } catch (e) {
              console.error('Error parsing permisos:', e);
            }
          }
          setPermisos({
            rol: result.user.rol,
            permisos: permisosObj
          });
        } else {
          // Fallback: cargar permisos de la API (usuarios antiguos)
          try {
            const permisosResult = await window.api.usuarios.getPermisos(result.user.id);
            if (permisosResult.success) {
              setPermisos({
                rol: permisosResult.rol,
                permisos: permisosResult.permisos
              });
            }
          } catch (e) {
            console.warn('Could not load permisos:', e);
          }
        }
        
        // Actualizar último acceso
        try {
          await window.api.usuarios.updateLastAccess(result.user.id);
        } catch (e) {
          console.warn('Could not update last access:', e);
        }
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, nombre, rut) => {
    setIsLoading(true);
    try {
      const result = await window.api.auth.register({ email, password, nombre, rut });
      if (result.success) {
        setIsFirstRun(false);
      }
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Error al registrar usuario' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await window.api.auth.logout();
      setUser(null);
      setPermisos(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Error al cerrar sesión' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    setIsLoading(true);
    try {
      const result = await window.api.auth.changePassword({
        userId: user.id,
        currentPassword,
        newPassword
      });
      return result;
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Error al cambiar contraseña' };
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones auxiliares para verificar permisos
  const hasPermission = (recurso, accion) => {
    if (!permisos) return false;
    
    // El dueño siempre tiene todos los permisos
    if (permisos.rol === 'dueño') return true;
    
    return permisos.permisos?.[recurso]?.[accion] === true;
  };

  const isOwner = () => {
    return permisos?.rol === 'dueño';
  };

  const isAdmin = () => {
    return permisos?.rol === 'administrador' || permisos?.rol === 'dueño';
  };

  const canAccessUsuarios = () => {
    return hasPermission('configuracion', 'usuarios');
  };

  // Nuevas funciones para verificar acceso a módulos
  const canAccessFacturas = () => {
    return hasPermission('facturas', 'ver') || hasPermission('facturas', 'crear');
  };

  const canAccessBoletas = () => {
    return hasPermission('boletas', 'ver') || hasPermission('boletas', 'crear');
  };

  const canAccessClientes = () => {
    return hasPermission('clientes', 'ver') || hasPermission('clientes', 'crear');
  };

  const canAccessProductos = () => {
    return hasPermission('productos', 'ver') || hasPermission('productos', 'crear');
  };

  const canAccessVendedores = () => {
    return hasPermission('vendedores', 'ver') || hasPermission('vendedores', 'crear');
  };

  const canAccessCaja = () => {
    return hasPermission('caja', 'acceder');
  };

  const canAccessReportes = () => {
    return hasPermission('reportes', 'ver');
  };

  const canAccessConfiguracion = () => {
    return hasPermission('configuracion', 'acceder');
  };

  const canAccessDocumentos = () => {
    return hasPermission('documentos', 'ver');
  };

  const value = {
    user,
    permisos,
    isLoading,
    isFirstRun,
    subscription,
    isOffline,
    login,
    register,
    refreshFirstRun,
    logout,
    changePassword,
    hasPermission,
    isOwner,
    isAdmin,
    canAccessUsuarios,
    canAccessFacturas,
    canAccessBoletas,
    canAccessClientes,
    canAccessProductos,
    canAccessVendedores,
    canAccessCaja,
    canAccessReportes,
    canAccessConfiguracion,
    canAccessDocumentos
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
