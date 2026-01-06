#!/bin/bash

# Script para reiniciar la aplicación en modo desarrollo
# Elimina la base de datos y configuraciones para volver al estado inicial

echo "🔄 Reiniciando aplicación al estado inicial..."

# Obtener el directorio de datos de usuario
USER_DATA_DIR="$HOME/.config/sistema-facturacion"

# Verificar que existe el directorio
if [ ! -d "$USER_DATA_DIR" ]; then
    echo "❌ No se encontró el directorio de datos: $USER_DATA_DIR"
    exit 1
fi

echo "📂 Directorio de datos: $USER_DATA_DIR"

# Hacer backup si hay datos importantes
BACKUP_DIR="$USER_DATA_DIR/reset-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup de la base de datos actual
if [ -f "$USER_DATA_DIR/facturacion.dev.db" ]; then
    echo "💾 Creando backup de la base de datos..."
    cp "$USER_DATA_DIR/facturacion.dev.db" "$BACKUP_DIR/"
    echo "✅ Backup guardado en: $BACKUP_DIR"
fi

# Eliminar base de datos de desarrollo
if [ -f "$USER_DATA_DIR/facturacion.dev.db" ]; then
    echo "🗑️  Eliminando base de datos de desarrollo..."
    rm "$USER_DATA_DIR/facturacion.dev.db"
    echo "✅ Base de datos eliminada"
else
    echo "ℹ️  No existe base de datos de desarrollo"
fi

# Eliminar base de datos de producción (si existe)
if [ -f "$USER_DATA_DIR/facturacion.db" ]; then
    echo "🗑️  Eliminando base de datos de producción..."
    rm "$USER_DATA_DIR/facturacion.db"
    echo "✅ Base de datos de producción eliminada"
fi

# Limpiar localStorage y Session Storage
echo "🧹 Limpiando almacenamiento local..."
rm -rf "$USER_DATA_DIR/Local Storage" 2>/dev/null
rm -rf "$USER_DATA_DIR/Session Storage" 2>/dev/null

echo ""
echo "✨ ¡Listo! La aplicación se reiniciará desde cero"
echo ""
echo "Ahora ejecuta:"
echo "  npm run dev"
echo ""
echo "La app mostrará:"
echo "  1. Pantalla de selección de rol (Contador/Cliente)"
echo "  2. Pantalla de registro"
echo ""
echo "Si necesitas restaurar el backup:"
echo "  cp $BACKUP_DIR/facturacion.dev.db $USER_DATA_DIR/"
