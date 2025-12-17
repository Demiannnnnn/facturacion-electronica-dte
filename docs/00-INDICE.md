# 📚 ÍNDICE MAESTRO DE DOCUMENTACIÓN
## Sistema de Facturación Electrónica B2B

**Versión:** 1.0.0
**Última actualización:** 16 de Diciembre, 2025
**Estado del proyecto:** 75-80% Completado

---

## 🎯 Inicio Rápido

- **¿Eres usuario final?** → Comienza con [08-MANUAL_USUARIO.md](./08-MANUAL_USUARIO.md)
- **¿Eres desarrollador?** → Lee [01-VISION_GENERAL.md](./01-VISION_GENERAL.md) y [07-MANUAL_TECNICO.md](./07-MANUAL_TECNICO.md)
- **¿Quieres saber qué falta?** → Ve a [09-ROADMAP.md](./09-ROADMAP.md)
- **¿Buscas referencia de API?** → Consulta [04-API_IPC.md](./04-API_IPC.md)

---

## 📖 Documentación Completa

### Documentos Principales (Orden de lectura recomendado)

| # | Documento | Descripción | Audiencia |
|---|-----------|-------------|-----------|
| **01** | [VISION_GENERAL.md](./01-VISION_GENERAL.md) | Visión general del proyecto, stack tecnológico, objetivos | Todos |
| **02** | [ARQUITECTURA.md](./02-ARQUITECTURA.md) | Arquitectura del sistema, diagramas, componentes | Desarrolladores |
| **03** | [BASE_DE_DATOS.md](./03-BASE_DE_DATOS.md) | Esquema completo de base de datos SQLite | Desarrolladores |
| **04** | [API_IPC.md](./04-API_IPC.md) | Referencia completa de handlers IPC | Desarrolladores |
| **05** | [FLUJOS.md](./05-FLUJOS.md) | Diagramas de flujo de procesos clave | Todos |
| **06** | [FUNCIONALIDADES.md](./06-FUNCIONALIDADES.md) | Lista detallada de funcionalidades implementadas | Todos |
| **07** | [MANUAL_TECNICO.md](./07-MANUAL_TECNICO.md) | Manual técnico para desarrolladores | Desarrolladores |
| **08** | [MANUAL_USUARIO.md](./08-MANUAL_USUARIO.md) | Manual de usuario final | Usuarios |
| **09** | [ROADMAP.md](./09-ROADMAP.md) | Roadmap: completado vs pendiente | Product Owners |
| **10** | [SERVIDOR.md](./10-SERVIDOR.md) | Documentación del servidor backend | Desarrolladores |

### Documentos Adicionales

| Documento | Descripción |
|-----------|-------------|
| [CHANGELOG.md](./CHANGELOG.md) | Historial de cambios por versión |
| [latex.pdf](./latex.pdf) | Documentación técnica original en PDF |

---

## 🗂️ Organización de Carpetas

```
docs/
├── 00-INDICE.md                    # Este archivo - Índice maestro
├── 01-VISION_GENERAL.md            # Overview del proyecto
├── 02-ARQUITECTURA.md              # Arquitectura del sistema
├── 03-BASE_DE_DATOS.md             # Esquema de BD
├── 04-API_IPC.md                   # Referencia de API
├── 05-FLUJOS.md                    # Diagramas de flujo
├── 06-FUNCIONALIDADES.md           # Lista de features
├── 07-MANUAL_TECNICO.md            # Manual para devs
├── 08-MANUAL_USUARIO.md            # Manual para usuarios
├── 09-ROADMAP.md                   # Roadmap del proyecto
├── 10-SERVIDOR.md                  # Docs del servidor
├── CHANGELOG.md                    # Historial de cambios
├── latex.pdf                       # PDF técnico original
└── old/                            # Documentación antigua (archivo)
    ├── ESTADO_PROYECTO.txt
    ├── GUIA_IA.txt
    ├── COMANDOS_RAPIDOS.txt
    ├── ANALISIS_FACTURACION.md
    ├── DASHBOARD_MODERNO.md
    ├── DOCUMENTACION_TECNICA.md
    └── ROADMAP_PRODUCCION.md
```

---

## 🎯 Guías por Rol

### Para Usuarios Finales (PyMEs)

1. **Instalación y Configuración Inicial**
   - [08-MANUAL_USUARIO.md](./08-MANUAL_USUARIO.md) → Sección 1-3

2. **Gestión Diaria**
   - Crear clientes → Manual Usuario § 4
   - Crear productos → Manual Usuario § 5
   - Emitir facturas → Manual Usuario § 6

3. **Reportes y Análisis**
   - Dashboard → Manual Usuario § 8
   - Reportes → Manual Usuario § 9

### Para Desarrolladores

1. **Onboarding**
   - [01-VISION_GENERAL.md](./01-VISION_GENERAL.md)
   - [02-ARQUITECTURA.md](./02-ARQUITECTURA.md)
   - [07-MANUAL_TECNICO.md](./07-MANUAL_TECNICO.md)

2. **Desarrollo**
   - [03-BASE_DE_DATOS.md](./03-BASE_DE_DATOS.md) - Schema de BD
   - [04-API_IPC.md](./04-API_IPC.md) - API Reference
   - [05-FLUJOS.md](./05-FLUJOS.md) - Flujos de datos

3. **Extensión**
   - [07-MANUAL_TECNICO.md](./07-MANUAL_TECNICO.md) § "Agregar nueva feature"
   - [09-ROADMAP.md](./09-ROADMAP.md) - Funcionalidades pendientes

### Para Product Owners / Gerencia

1. **Estado del Proyecto**
   - [06-FUNCIONALIDADES.md](./06-FUNCIONALIDADES.md)
   - [09-ROADMAP.md](./09-ROADMAP.md)

2. **Decisiones Técnicas**
   - [01-VISION_GENERAL.md](./01-VISION_GENERAL.md)
   - [02-ARQUITECTURA.md](./02-ARQUITECTURA.md)

---

## 📝 Convenciones de Documentación

### Símbolos Utilizados

- ✅ - Implementado y funcional
- ⚠️ - Parcialmente implementado
- ❌ - No implementado
- 🔴 - Prioridad alta
- 🟡 - Prioridad media
- 🟢 - Prioridad baja
- 📝 - Nota importante
- 🚨 - Advertencia crítica
- 💡 - Tip o sugerencia

### Formato de Código

```javascript
// Ejemplos de código están marcados con sintaxis highlighting
const ejemplo = "como este";
```

### Formato de Rutas

- Rutas absolutas: `/Users/usuario/proyecto/archivo.js`
- Rutas relativas al proyecto: `electron-app/src/main/main.js`
- Rutas de IPC: `auth:login`, `clientes:create`

---

## 🔄 Mantenimiento de Documentación

### Cuándo Actualizar

1. **Después de cada release**
   - Actualizar [CHANGELOG.md](./CHANGELOG.md)
   - Revisar [09-ROADMAP.md](./09-ROADMAP.md)

2. **Al agregar funcionalidad**
   - Actualizar [06-FUNCIONALIDADES.md](./06-FUNCIONALIDADES.md)
   - Agregar a [04-API_IPC.md](./04-API_IPC.md) si hay nuevos handlers
   - Actualizar [08-MANUAL_USUARIO.md](./08-MANUAL_USUARIO.md)

3. **Al cambiar arquitectura**
   - Actualizar [02-ARQUITECTURA.md](./02-ARQUITECTURA.md)
   - Revisar [05-FLUJOS.md](./05-FLUJOS.md)

### Responsable

**Desarrollador principal:** Demian Maturana

---

## 📞 Contacto y Soporte

**Desarrollador:** Demian Maturana
**Email:** dmaturana22@alumnos.utalca.cl
**Repositorio:** [GitHub] (si aplica)

---

## 📄 Licencia

UNLICENSED - Uso privado

---

**Última revisión:** 16 de Diciembre, 2025
**Versión del índice:** 1.0
