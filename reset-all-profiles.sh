#!/usr/bin/env bash
# Script para borrar todas las bases de datos de perfiles de Sistema de Facturación
# Uso: ./reset-all-profiles.sh

set -e

DB_PATHS=(
  "$HOME/.config/sistema-facturacion-contador/facturacion.dev.db"
  "$HOME/.config/sistema-facturacion-empresa/facturacion.dev.db"
  "$HOME/.config/sistema-facturacion-personaA/facturacion.dev.db"
  "$HOME/.config/sistema-facturacion-personaB/facturacion.dev.db"
)

for db in "${DB_PATHS[@]}"; do
  if [ -f "$db" ]; then
    echo "Eliminando $db"
    rm "$db"
  else
    echo "No existe $db, saltando."
  fi
done

echo "Todas las bases de datos de perfiles han sido eliminadas."
