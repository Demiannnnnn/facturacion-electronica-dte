import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente para proteger rutas basado en permisos específicos
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar si hay permiso
 * @param {string} props.requiredPermission - Nombre del permiso requerido (ej: 'facturas', 'clientes')
 * @param {string} props.redirectTo - Ruta a la que redirigir si no hay permiso (por defecto /cliente)
 */
function PermissionRoute({ children, requiredPermission, redirectTo = '/cliente' }) {
  const auth = useAuth();
  const { permisos } = auth;

  // Mientras cargan los permisos, mostrar loading
  if (!permisos) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        🔒 Verificando permisos...
      </div>
    );
  }

  // Mapeo de permisos a funciones de verificación
  const permissionChecks = {
    'facturas': auth.canAccessFacturas,
    'boletas': auth.canAccessBoletas,
    'clientes': auth.canAccessClientes,
    'productos': auth.canAccessProductos,
    'trabajadores': auth.canAccessTrabajadores,
    'caja': auth.canAccessCaja,
    'reportes': auth.canAccessReportes,
    'configuracion': auth.canAccessConfiguracion,
    'documentos': auth.canAccessDocumentos,
    'usuarios': auth.canAccessUsuarios
  };

  const checkFunction = permissionChecks[requiredPermission];
  
  // Si no hay función de verificación o retorna false, redirigir
  if (!checkFunction || !checkFunction()) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default PermissionRoute;
