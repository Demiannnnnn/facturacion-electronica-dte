# 🧪 Testing Profiles

Este archivo contiene las credenciales de los perfiles de desarrollo pre-configurados.

## 📋 Comandos Disponibles

```bash
npm run seed:all        # Crear/resetear todos los perfiles
npm run dev:contador    # Iniciar app en modo CONTADOR
npm run dev:empresa     # Iniciar app en modo EMPRESA
npm run dev:personaA    # Iniciar app en modo PERSONA NATURAL (Honorarios)
npm run dev:personaB    # Iniciar app en modo PERSONA NATURAL (Comerciante)
```

---

## 👤 Credenciales de Acceso

### 1️⃣ Perfil CONTADOR
```
Usuario:    contador
Contraseña: contador123
Email:      contador@test.cl

Rol:        Contador
RUT:        12.345.678-9
Empresa:    Contador Test SpA
```

### 2️⃣ Perfil EMPRESA
```
Usuario:    empresa
Contraseña: empresa123
Email:      empresa@test.cl

Rol:        Empresa
RUT:        76.123.456-7
Razón Social: Empresa Test Ltda
Nombre Fantasía: Test Company
Giro:       Comercio al por mayor
```

### 3️⃣ Perfil PERSONA NATURAL A (Honorarios - Segunda Categoría)
```
Usuario:    honorarios
Contraseña: honorarios123
Email:      honorarios@test.cl

Rol:        Persona Natural
Subtipo:    Honorarios (Segunda categoría)
RUT:        18.765.432-1
Nombre:     Juan Pérez González
Nombre Fantasía: Consultorías JP
Giro:       Servicios profesionales de consultoría
```

### 4️⃣ Perfil PERSONA NATURAL B (Comerciante - Primera Categoría)
```
Usuario:    comerciante
Contraseña: comerciante123
Email:      comerciante@test.cl

Rol:        Persona Natural
Subtipo:    Comerciante (Primera categoría Pro-Pyme)
RUT:        19.876.543-2
Nombre:     María González López
Nombre Fantasía: Emprendimientos MG
Giro:       Comercio menor de productos varios
```

---

## 🔧 Uso

1. **Primera vez - Crear todos los perfiles:**
   
   **Opción A - Desde la UI:**
   - Ejecuta cualquier perfil: `npm run dev:contador` (o empresa, personaA, personaB)
   - En la pantalla de selección de rol, haz clic en el botón verde "🌱 Seed All Profiles (DEV)" (esquina superior derecha)
   - Espera a que se creen todos los perfiles
   - Cierra la app (Ctrl+C)
   - Reinicia con el perfil que quieras testear
   
   **Opción B - Script eliminado (incompatibilidad de Node.js)**
   - ~~`npm run seed:all`~~ (Ya no disponible)

2. **Iniciar perfil específico:**
   ```bash
   npm run dev:contador
   # o
   npm run dev:empresa
   # o
   npm run dev:personaA
   # o
   npm run dev:personaB
   ```

3. **Cambiar de perfil:**
   - Detener el servidor actual (Ctrl+C)
   - Ejecutar el comando del nuevo perfil

---

## 📁 Ubicación de las Bases de Datos

Cada perfil tiene su propia base de datos independiente:

```
~/.config/sistema-facturacion-contador/facturacion.dev.db
~/.config/sistema-facturacion-empresa/facturacion.dev.db
~/.config/sistema-facturacion-personaA/facturacion.dev.db
~/.config/sistema-facturacion-personaB/facturacion.dev.db
```

---

## ⚠️ Notas Importantes

- ✅ **Aislamiento total:** Cada perfil es completamente independiente
- ✅ **Datos persistentes:** Los datos NO se borran al cambiar de perfil
- ✅ **Sin contaminación:** El código de producción no se ve afectado
- 🔄 **Reset selectivo:** Ejecuta `npm run seed:all` para resetear todos los perfiles
- 🚀 **Producción:** Estos perfiles solo existen en desarrollo, NO afectan el build final
