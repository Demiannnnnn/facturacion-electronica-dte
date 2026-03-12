#!/usr/bin/env bash
# Borra la base de datos de la ruta userData por defecto (sin perfil)
DB_PATH="$HOME/Library/Application Support/sistema-facturacion"
if [ -d "$DB_PATH" ]; then
  echo "Eliminando $DB_PATH"
  rm -rf "$DB_PATH"
else
  echo "No existe $DB_PATH, saltando."
fi
echo "Base de datos principal eliminada."
