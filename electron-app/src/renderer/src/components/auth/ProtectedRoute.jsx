import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

function ProtectedRoute({ children, requiredRole }) {
  const { user, isLoading, isFirstRun } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const roleConfig = await window.api.config.get('user_role');
        if (roleConfig && roleConfig.value) {
          setUserRole(roleConfig.value);
        }
      } catch (error) {
        console.error('Error cargando rol del usuario:', error);
      } finally {
        setLoadingRole(false);
      }
    };

    if (user) {
      loadUserRole();
    } else {
      setLoadingRole(false);
    }
  }, [user]);

  if (isLoading || loadingRole) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    );
  }

  if (isFirstRun) {
    return <Navigate to="/register" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Validar rol si se especifica requiredRole
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirigir al dashboard correcto según el rol
      if (userRole === 'contador') {
        return <Navigate to="/contador" replace />;
      } else if (userRole === 'empresa' || userRole === 'persona_natural') {
        return <Navigate to="/cliente" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
