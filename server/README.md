# Mock Server - Simulación de Backend

Este servidor simula las respuestas de Railway + ChileAPI para desarrollo local sin costos.

## Uso

```bash
# Desarrollo (mock)
cd server
npm run dev:mock

# O simplemente no lo corras, el cliente usa respuestas locales
```

## Estructura

```
server/
├── mock/
│   ├── data/           # Datos simulados
│   ├── responses/      # Respuestas predefinidas
│   └── server.js       # Servidor Express simulado
└── src/
    └── index.js        # Servidor real (para producción)
```

## Migración a Producción

Cambiar en `.env`:
```
API_MODE=mock       →  API_MODE=production
```

Listo. Todo funciona igual.
