# Sistema de Control de Acceso Basado en Roles y Permisos

## 📋 Resumen de Implementación

Se ha implementado un **sistema completo de control de acceso basado en roles y permisos** que limita las funcionalidades visibles y accesibles según el rol y permisos del usuario.

## ✅ Cambios Implementados

### 1. **AuthContext Extendido**
Se agregaron nuevas funciones de verificación de permisos al contexto de autenticación:

- `canAccessFacturas()` - Verifica acceso a facturas
- `canAccessBoletas()` - Verifica acceso a boletas  
- `canAccessClientes()` - Verifica acceso a clientes
- `canAccessProductos()` - Verifica acceso a productos
- `canAccessVendedores()` - Verifica acceso a vendedores
- `canAccessCaja()` - Verifica acceso a caja
- `canAccessReportes()` - Verifica acceso a reportes
- `canAccessConfiguracion()` - Verifica acceso a configuración
- `canAccessDocumentos()` - Verifica acceso a documentos

### 2. **ClienteLayout - Menú Filtrado**
El menú lateral del `ClienteLayout` ahora:

✅ **Filtra módulos según permisos** - Solo muestra los módulos a los que el usuario tiene acceso
✅ **Verifica permisos en tiempo real** - Usa las funciones del AuthContext para validar
✅ **Mapeo inteligente** - Relaciona cada módulo con sus permisos correspondientes

**Ejemplo de mapeo:**
```javascript
const modulePermissions = {
  'facturas': canAccessFacturas,
  'boletas': canAccessBoletas,
  'clientes': canAccessClientes,
  'productos': canAccessProductos,
  'pos': canAccessCaja, // POS requiere permisos de caja
  // ... más módulos
};
```

### 3. **Layout Básico - Menú Filtrado**
El `Layout.jsx` también filtra sus opciones de menú según permisos.

### 4. **PermissionRoute Component**
Nuevo componente para proteger rutas individuales:

```jsx
<PermissionRoute requiredPermission="facturas">
  <Facturas />
</PermissionRoute>
```

**Características:**
- ✅ Bloquea acceso a rutas sin permiso
- ✅ Redirige automáticamente al dashboard
- ✅ Muestra mensaje de "Verificando permisos..."
- ✅ Se integra con ProtectedRoute para doble validación

### 5. **Rutas Protegidas en App.jsx**
Se aplicó `PermissionRoute` a las rutas principales:

- `/cliente/clientes` - Requiere permiso "clientes"
- `/cliente/productos` - Requiere permiso "productos"
- `/cliente/vendedores` - Requiere permiso "vendedores"
- `/cliente/facturas` - Requiere permiso "facturas"
- `/cliente/boletas` - Requiere permiso "boletas"
- `/cliente/caja` - Requiere permiso "caja"
- `/cliente/reportes` - Requiere permiso "reportes"
- `/cliente/documentos` - Requiere permiso "documentos"

## 🔒 Cómo Funciona

### Nivel 1: Verificación de Rol
```
ProtectedRoute → Verifica que el usuario tenga el rol correcto (empresa/contador/persona_natural)
```

### Nivel 2: Verificación de Permisos
```
PermissionRoute → Verifica que el usuario tenga el permiso específico para ese módulo
```

### Nivel 3: Filtrado de Menú
```
Layout → Solo muestra en el menú los módulos a los que el usuario tiene acceso
```

## 📊 Ejemplos de Comportamiento

### Ejemplo 1: Usuario "Vendedor"
**Permisos típicos:**
- ✅ Ver y crear facturas
- ✅ Ver y gestionar clientes
- ✅ Ver productos
- ❌ No puede acceder a configuración
- ❌ No puede gestionar usuarios
- ❌ No puede ver reportes financieros

**Resultado:**
- El menú solo mostrará: Dashboard, Clientes, Productos, Facturas
- Si intenta acceder a `/cliente/reportes` directamente, será redirigido al dashboard

### Ejemplo 2: Usuario "Cajero"
**Permisos típicos:**
- ✅ Acceder a caja
- ✅ Crear boletas
- ✅ Ver clientes
- ❌ No puede crear facturas
- ❌ No puede acceder a reportes

**Resultado:**
- El menú solo mostrará: Dashboard, Caja, Punto de Venta, Boletas, Clientes
- No verá opciones de Facturas, Reportes, ni Configuración

### Ejemplo 3: Usuario "Dueño"
**Permisos:**
- ✅ Acceso total a todo el sistema

**Resultado:**
- Ve todos los módulos disponibles
- Puede acceder a cualquier ruta sin restricciones

## 🎯 Beneficios

1. **Seguridad Mejorada**: Los usuarios solo ven y acceden a lo que les corresponde
2. **Experiencia Simplificada**: Interfaz más limpia y relevante para cada rol
3. **Gestión Centralizada**: Los permisos se gestionan desde el módulo de Usuarios
4. **Protección Múltiple**: Validación en menú, rutas y componentes
5. **Escalable**: Fácil agregar nuevos módulos y permisos

## 🔧 Para Agregar un Nuevo Módulo Protegido

### Paso 1: Agregar función en AuthContext
```javascript
const canAccessNuevoModulo = () => {
  return hasPermission('nuevo_modulo', 'ver');
};
```

### Paso 2: Exportar en el value de AuthContext
```javascript
const value = {
  // ... otros
  canAccessNuevoModulo
};
```

### Paso 3: Agregar al mapeo en ClienteLayout
```javascript
const modulePermissions = {
  // ... otros
  'nuevo-modulo': canAccessNuevoModulo
};
```

### Paso 4: Proteger la ruta en App.jsx
```jsx
<Route
  path="/cliente/nuevo-modulo"
  element={
    <ProtectedRoute requiredRole={['empresa', 'persona_natural']}>
      <PermissionRoute requiredPermission="nuevo-modulo">
        <ClienteLayout>
          <NuevoModulo />
        </ClienteLayout>
      </PermissionRoute>
    </ProtectedRoute>
  }
/>
```

## 📝 Notas Importantes

- El rol "dueño" siempre tiene acceso completo (bypass automático)
- Los permisos se cargan desde la base de datos al hacer login
- Si un usuario no tiene permisos definidos, por defecto no verá ningún módulo (excepto Dashboard)
- Los módulos siguen respetando la configuración de módulos habilitados/deshabilitados del selector de módulos

## 🚀 Próximos Pasos Sugeridos

1. Aplicar `PermissionRoute` a las rutas restantes (guías, notas de crédito/débito, etc.)
2. Agregar control de permisos granular dentro de cada página (ej: botón "Eliminar" solo visible para usuarios con permiso)
3. Implementar auditoría de acceso a módulos
4. Crear un panel de administración para gestionar permisos personalizados

---

**Fecha de implementación:** 7 de Marzo, 2026
**Sistema:** Sistema de Facturación Electrónica B2B
