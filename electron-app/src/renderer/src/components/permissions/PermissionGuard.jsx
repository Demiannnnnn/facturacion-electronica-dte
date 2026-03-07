import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tooltip } from '@mui/material';

/**
 * Componente para proteger acciones que requieren permisos específicos
 * Oculta o deshabilita elementos según los permisos del usuario
 */
export default function PermissionGuard({ 
  recurso, 
  accion, 
  children, 
  fallback = null,
  showTooltip = true,
  disabled = false 
}) {
  const { hasPermission } = useAuth();

  const tienePermiso = hasPermission(recurso, accion);

  // Si no tiene permiso y hay un fallback, mostrarlo
  if (!tienePermiso && fallback) {
    return fallback;
  }

  // Si no tiene permiso y no hay fallback, no mostrar nada
  if (!tienePermiso && !fallback) {
    return null;
  }

  // Si tiene permiso, renderizar children
  // Si disabled es true, mostrar tooltip explicativo
  if (disabled && showTooltip) {
    return (
      <Tooltip title={`Acción no permitida: ${accion} ${recurso}`}>
        <span>
          {React.cloneElement(children, { disabled: true })}
        </span>
      </Tooltip>
    );
  }

  return children;
}

/**
 * Hook personalizado para verificar permisos
 */
export function usePermissions() {
  const { hasPermission, isOwner, isAdmin, permisos } = useAuth();

  const canCreate = (recurso) => hasPermission(recurso, 'crear');
  const canEdit = (recurso) => hasPermission(recurso, 'editar');
  const canDelete = (recurso) => hasPermission(recurso, 'eliminar');
  const canView = (recurso) => hasPermission(recurso, 'ver');
  const canEmit = (recurso) => hasPermission(recurso, 'emitir');
  const canAnular = (recurso) => hasPermission(recurso, 'anular');

  return {
    hasPermission,
    canCreate,
    canEdit,
    canDelete,
    canView,
    canEmit,
    canAnular,
    isOwner: isOwner(),
    isAdmin: isAdmin(),
    permisos
  };
}
