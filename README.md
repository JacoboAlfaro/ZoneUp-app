# ZoneUp — App móvil de zonas azules

App móvil con **Expo + React Native** para gestionar el estacionamiento en **zonas azules** (caso inicial: Manizales).

- Los **conductores** se registran, gestionan su perfil y sus vehículos.
- Los **administradores** gestionan usuarios y zonas azules (ubicación, indicaciones y cupos).
- Se conecta a un backend de **3 microservicios NestJS** a través de un único gateway HTTP.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime móvil | Expo `~57.0.20`, React Native `0.86.3`, React `19.2.3` |
| Ruteo | `expo-router ~57.0.19` (ruteo por archivos, `typedRoutes`) |
| Formularios | `react-hook-form ^7.87.0` |
| Estilos | `tailwindcss ^4.3.3` + `uniwind ^1.12.0` |
| Lenguaje | TypeScript  (`expo/tsconfig.base`) |
| Plataformas | Android y iOS |

## Backend

La app no tiene backend propio. Habla con diferentes microservicios NestJS, detrás de **un gateway**.

## Funcionalidades

### Pública (sin sesión)
- `app/login.tsx`: login con email + contraseña. Los errores del servidor se muestran como error `root` del formulario.
- `app/register.tsx`: registro de conductor (nombres, apellidos, documento, celular, email, contraseña + confirmación). Al registrarse se entra directo porque el backend ya devuelve JWT.

### Sesión y navegación protegida
- `src/session/context.tsx`: `SessionProvider` con `user, signIn, signUp, updateCurrentUser, signOut`. El JWT vive **solo en memoria** (`src/api/client.ts`); al cerrar la app hay que volver a entrar.
- `app/_layout.tsx`: usa `Stack.Protected`:
  - sin `user` → solo `login` / `register` existen como rutas;
  - `user` no-admin → `conductor` + `index`;
  - `user.tipo_usuario === 'admin'` → `admin`.

### Panel conductor (`app/conductor/`)
- `index.tsx`: bienvenida + accesos a perfil, vehículos y cerrar sesión.
- `(usuarios)/index.tsx` + `(usuarios)/edition.tsx`: ver y editar mi perfil.
- `(vehiculos)/index.tsx`: listar mis vehículos (`GET /users/:documento/vehiculos`).
- `(vehiculos)/nuevo-vehiculo.tsx`: agregar vehículo (placa normalizada a mayúsculas).
- `(vehiculos)/vehiculo/[placa].tsx`: detalle / edición del vehículo.

### Panel admin (`app/admin/`)
- `index.tsx`: dashboard con contadores (`listUsers`, `listZonas`) y tarjetas a Usuarios y Zonas azules.
- `(usuarios)/usuarios.tsx`: lista de usuarios.
- `(usuarios)/nuevo-usuario.tsx`: crear usuario.
- `(usuarios)/usuario/[email].tsx`: detalle y edición (`PATCH /users/:documento`: estado, tipo, datos).
- `(zonas)/zonas.tsx`: lista con buscador (insensible a tildes), stats de zonas y cupos, pull-to-refresh.
- `(zonas)/nueva-zona.tsx`: crear zona (lat/long, indicaciones, capacidad).
- `(zonas)/zona/[id].tsx`: detalle, edición y borrado.

## Estructura del proyecto

```text
app/                    # Ruteo por archivos (expo-router)
  _layout.tsx           # SessionProvider + Stack.Protected por rol
  index.tsx
  login.tsx / register.tsx
  conductor/_layout.tsx # Stack: index, (usuarios), (vehiculos)
  conductor/(usuarios)/ conductor/(vehiculos)/
  admin/_layout.tsx     # Stack: index, (usuarios)/..., (zonas)/...
  admin/(usuarios)/ admin/(zonas)/
src/
  api/
    client.ts           # Único fetch, selección de base por prefijo, ApiError
    auth.ts             # login/register, toUser, toRegisterDto
    users.ts            # CRUD usuarios
    vehiculos.ts        # GET/POST (+PATCH/DELETE) vehículos
    zonas.ts            # CRUD zonas, toZona (decimal string -> number)
    index.ts            # Barrel público
  session/context.tsx   # Estado global de sesión
  types.ts              # Vocabulario: User, ZonaAzul, Vehiculo, DTOs
  components/
    Button.tsx Field.tsx FormError.tsx Select.tsx
    ParkingMap.tsx      # MapView centrado en Manizales
    NoSessionState.tsx TabOne.tsx TabTwo.tsx
    admin/              # DashboardStat, DashboardNavTile
global.css              # Tokens Tailwind: zu-navy, zu-sky-*, zu-slogan, ...
app.json                # Expo: slug zone-up-app, scheme zoneupapp, splash, router
```

Capa API: las pantallas nunca usan `fetch`; llaman a funciones de negocio (`login`, `listZonas`, `addVehiculo`…). `request<T>(path, body?, { method, base })` adjunta `Bearer` si hay token y normaliza errores NestJS (`{ message, error, statusCode }`) a `ApiError(message, status)`.

## Configuración

Variables leídas con `process.env.EXPO_PUBLIC_*` (ver `src/api/client.ts`):

| Variable |  Uso |
|---|---|
| `EXPO_PUBLIC_API_URL` | Gateway que reenvía `/auth`, `/users`, `/zonas` |


## Puesta en marcha

Requisitos: Node LTS + npm, app **Expo Go** en el móvil (mismo Wi-Fi) o emulador.

```bash
npm install
npm start        # expo start: QR + menú (a/i/w)
npm run android  # expo start --android
npm run ios      # expo start --ios
npm run web      # expo start --web
```

Flujo típico:

1. Enciende el backend o el gateway y ajusta `.env`.
2. `npm start`, abre con Expo Go.
3. Regístrate como conductor o entra con un usuario admin para ver el panel administrativo.


## Licencia

MIT (ver `LICENSE`). Plantilla inicial de Expo.
