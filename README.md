# ZoneUp — App de zonas azules

App con **Expo + React Native** para reservar cupos de parqueo en **zonas azules** (caso inicial: Manizales). El mismo código corre en Android, iOS y web.

- Los **conductores** se registran, gestionan su perfil y sus vehículos, y reservan cupos por horas.
- Los **encargados de zona** (`controlador`) aceptan o rechazan las solicitudes y verifican la placa cuando llega el vehículo.
- Los **administradores** gestionan usuarios y zonas azules (ubicación, indicaciones y capacidad).

La documentación completa de la app está en [`docs/app-zoneup.md`](docs/app-zoneup.md).

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Expo SDK 58 (`expo ^58.0.19`), React Native `0.88.0`, React `19.3.0` |
| Ruteo | `expo-router ~58.0.26` (ruteo por archivos, `typedRoutes`) |
| Formularios | `react-hook-form ^7.87.0` |
| Estilos | `tailwindcss ^4.3.3` + `uniwind ^1.12.0` (clases `zu-*` en `global.css`) |
| Íconos y mapa | `lucide-react-native`, `react-native-maps` |
| Lenguaje | TypeScript `~6.0` en modo estricto (`expo/tsconfig.base`) |

Antes de programar, lee la documentación de la versión exacta de Expo (lo pide `AGENTS.md`): https://docs.expo.dev/versions/v58.0.0/

## Backend

La app no tiene servidor propio. Habla con **un gateway** (`https://zoneup.online` en producción) que reenvía cada prefijo a un microservicio NestJS:

| Prefijo | Servicio |
|---|---|
| `/auth` | auth: registro e inicio de sesión (JWT) |
| `/users` | users: usuarios y vehículos |
| `/zonas` | zones: zonas azules y sus cupos disponibles |
| `/reservas` | reservations: reservas, llegada y vencimiento |

Los endpoints de cada servicio están documentados en el archivo correspondiente de `src/api/`. El backend vive en otro repositorio (`back-parknear`).

## Cómo funciona una reserva

1. **El conductor reserva** (`POST /reservas { id_zona, id_vehiculo, horas }`) → `pendiente`.
   - El servidor toma al conductor del token y calcula el fin (`ahora + horas`) y el precio (`horas × $3.500 + $5.000`).
   - En una sola transacción revisa que el vehículo sea del conductor, que **no tenga otra reserva en curso** (una por vehículo) y que **la zona tenga cupo**. Dos personas no pueden tomar el mismo último cupo.
   - Desde ese momento el conductor tiene **15 minutos para llegar**.
2. **El encargado acepta** dentro de esos 15 minutos → `activa`.
3. **Llega el vehículo**: el encargado verifica la placa (`POST /reservas/:id/llegada`). Se registra la hora de llegada (`fecha_real_inicio`) y la reserva **sigue `activa`**.
4. **Termina el tiempo** (`fecha_fin`): el servidor la pasa sola a `completada`.

Además:
- Si nadie confirma la llegada en 15 minutos, el servidor la **cancela** y cobra solo el cargo de reserva ($5.000).
- Rechazar o cancelar antes de la llegada también deja solo el cargo.
- El conductor puede **extender** una reserva en curso (`PATCH /reservas/:id/extend { horas }`) sin pasar de 24 horas desde que la creó.

Los **cupos disponibles** (`zona.capacidad`) los calcula el servidor: capacidad total menos las reservas en curso. El admin solo define la capacidad total.

Los errores propios del servidor traen un `codigo`, que la app lee en `ApiError.codigo` para mostrar el aviso adecuado. Por ejemplo: `ZONA_SIN_CUPO`, `VEHICULO_CON_RESERVA`, `LLEGADA_VENCIDA` o `CAPACIDAD_MENOR_A_OCUPADOS`.

## Funcionalidades

### Sin sesión (`app/(auth)/`)
- `login.tsx`: correo y contraseña. Los errores se muestran con una alerta. Las cuentas `inactivo` o `eliminado` no entran.
- `register.tsx`: registro de conductor. Entra directo, porque el backend devuelve el JWT con el usuario.

### Conductor (`app/conductor/`, un Drawer con un Stack en `(panel)/`)
- `(panel)/index.tsx`: mapa centrado en Manizales y botón para abrir el menú.
- `(panel)/(usuarios)/`: ver y editar mi perfil.
- `(panel)/(vehiculos)/`: mis vehículos; nuevo, editar y eliminar.
- `(panel)/(reservas)/zonas.tsx`: zonas con su disponibilidad (con cupos, pocos o sin cupo), primero las que tienen cupo.
- `(panel)/(reservas)/nueva-reserva.tsx`: elegir vehículo y horas (1 a 24) y ver el costo. Los vehículos con una reserva en curso salen deshabilitados.
- `(panel)/(reservas)/reservas.tsx`: historial con un contador de 15 minutos por cada reserva en camino.
- `(panel)/(reservas)/reserva/[id].tsx`: detalle, hora de llegada y extensión de horas.

### Encargado (`app/controlador/`)
El backend no limita a los encargados a ciertas zonas: ven las reservas de todas, en una búsqueda paginada.
- `index.tsx`: contadores (por revisar, aceptadas, total) y acceso a la gestión.
- `(reservas)/reservas.tsx`: búsqueda por placa, conductor, documento o zona; filtro por estado; **Aceptar / Rechazar** en la tarjeta.
- `(reservas)/reserva/[id].tsx`: placa en grande y datos del conductor y la zona.
  - Pendiente: aceptar o rechazar.
  - Activa sin llegada: **Sí, coincide** confirma la llegada; **No, es otra placa** muestra indicaciones.
  - Activa con llegada: "Llegó a las… · parqueado hasta…".
  - Activa (con o sin llegada): cancelar.

### Admin (`app/admin/`)
- `index.tsx`: contadores (de `/users/resumen` y `/zonas/resumen`) y tarjetas a Usuarios y Zonas.
- `(usuarios)/`: lista con buscador y filtro de estado, crear usuario, detalle (tipo y estado).
- `(zonas)/`: lista con buscador; crear y editar zona (indicaciones, latitud, longitud y **capacidad total**); borrar.

## Estructura del proyecto

```text
app/                         Rutas (expo-router). Archivos delgados: solo montan una pantalla.
  _layout.tsx                Proveedores (alertas, sesión) + Stack.Protected por rol
  index.tsx                  "/" → redirige al panel de cada rol (o a /login)
  (auth)/                    login, register
  conductor/                 _layout (Drawer) → (panel)/ (Stack) → (usuarios)/ (vehiculos)/ (reservas)/
  controlador/               index, (reservas)/reservas, (reservas)/reserva/[id]
  admin/                     index, (usuarios)/…, (zonas)/…
src/
  api/                       Hablar con el backend: una función por endpoint
    client.ts                El ÚNICO fetch: URL base, token, ApiError (status + codigo)
    auth.ts users.ts vehiculos.ts zonas.ts reservas.ts
    index.ts                 Reexporta todo
  components/
    screens/<rol>/           Pantallas (solo JSX) de auth, conductor, controlador y admin
    alerta/                  Alertas propias (useAlerta), en lugar de Alert.alert
    reservas/                EstadoReservaBadge, DisponibilidadBadge, ContadorLlegada, accionesReserva
    Button Field Select SelectFiltro CampoBusqueda CargarMas DashboardStat DashboardNavTile ParkingMap
  hooks/<área>/              Lógica de cada pantalla (cargar, guardar, validar, navegar)
    useListaPaginada.tsx     Listados con búsqueda en el servidor + paginación
  session/context.tsx        Usuario y token de la sesión
  types.ts                   Vocabulario: User, ZonaAzul, Vehiculo, Reserva, DTOs
  formato.ts                 Pesos, fechas, horas y títulos de zona
docs/app-zoneup.md           Documentación detallada de la app
global.css                   Tailwind + Uniwind + paleta zu-*
```

Las pantallas nunca usan `fetch`: llaman a hooks, y los hooks a funciones de `src/api` con nombre de negocio (`createReserva`, `listZonas`…). `request<T>(path, body?, { method, base, signal })` adjunta `Bearer <token>` si hay sesión y convierte los errores del servidor (`{ statusCode, error, codigo?, message }`) en `ApiError(message, status, codigo)`.

## Configuración

Variables en `.env` (Expo solo las incrusta si empiezan por `EXPO_PUBLIC_`; ver `src/api/client.ts`):

| Variable | Uso | Por defecto |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Gateway que reenvía `/auth`, `/users`, `/zonas` y `/reservas` | `http://localhost:3003` |
| `EXPO_PUBLIC_AUTH_URL`, `EXPO_PUBLIC_USERS_URL`, `EXPO_PUBLIC_ZONAS_URL`, `EXPO_PUBLIC_RESERVAS_URL` | Opcionales: hablar con un servicio sin pasar por el gateway | la del gateway |

```bash
# .env
EXPO_PUBLIC_API_URL=https://zoneup.online
# o, con el backend local en tu PC (desde un teléfono usa la IP de la PC, no localhost):
# EXPO_PUBLIC_API_URL=http://192.168.1.10:3003
```

## Puesta en marcha

Requisitos: Node 22.13 o superior + npm, y la app **Expo Go** en el teléfono (misma red Wi-Fi), un emulador o el navegador.

```bash
npm install
npm start        # expo start: QR + menú (a = Android, i = iOS, w = web)
npm run android
npm run ios
npm run web      # puerto 8081
npx tsc --noEmit # revisar tipos (incluye las rutas tipadas)
```

Flujo típico:
1. Ajusta `.env` para que apunte al gateway.
2. `npm start` y abre la app con Expo Go o en el navegador.
3. Regístrate como conductor, o entra con un usuario admin o encargado.

Para compilar instalables se usa EAS (`eas.json`): `eas build -p android --profile preview` genera un APK; `--profile production`, un AAB para Google Play.

## Licencia

MIT (ver `LICENSE`).
