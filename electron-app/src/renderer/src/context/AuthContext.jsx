import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstRun, setIsFirstRun] = useState(false);

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
      if (result.success) {
        setUser(result.user);
        setIsFirstRun(false);
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

  const value = {
    user,
    isLoading,
    isFirstRun,
    login,
    register,
    refreshFirstRun,
    logout,
    changePassword
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
