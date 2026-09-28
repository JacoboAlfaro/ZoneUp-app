/**
 * El vocabulario de la app.
 *
 *
 * Mapa real del backend (3 microservicios NestJS, sin prefijo global):
 * - auth  :3000 -> POST /auth/register, POST /auth/login (ver src/api/auth.ts)
 * - users :3001 -> POST /users, GET /users, GET /users/:email,
 *                  POST /users/:documento/vehiculo, GET /users/:documento/vehiculos,
 *                  PATCH /users/:documento
 *                  (ver src/api/users.ts y src/api/vehiculos.ts)
 * - zonas :3002 -> POST /zonas, GET /zonas, GET /zonas/:id, PATCH /zonas/:id,
 *                  DELETE /zonas/:id (ver src/api/zonas.ts)
 * - reservas :3004 -> POST /reservas, GET /reservas/:id, GET /reservas/user/:id,
 *                  GET /reservas/zona/:idZona, PUT /reservas/:id/state,
 *                  PATCH /reservas/:id/extend (ver src/api/reservas.ts)
 */

/**
 * Estados de `estado_usuario` en Postgres. El registro crea al usuario como
 * `inactivo` si no se manda otro.
 */
export const ESTADOS_USUARIO = ['activo', 'no_verificado', 'inactivo', 'eliminado'] as const;
export type EstadoUsuario = (typeof ESTADOS_USUARIO)[number];

/**
 * Subtablas de `usuarios`: cada persona puede tener fila en una sola
 * (`conductores`, `controladores` o `admin`) o en ninguna (null).
 * La app registra `conductor`; el resto lo asigna un administrador.
 */
export const TIPOS_USUARIO = ['conductor', 'controlador', 'admin'] as const;
export type TipoUsuario = (typeof TIPOS_USUARIO)[number];

/**
 * Lo que el usuario escribe en el formulario: un solo campo para los nombres y
 * otro para los apellidos. `src/api/auth.ts` los parte antes de enviarlos.
 */
export interface Register {
  documento_identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  contrasena: string;
  celular: string;
  estado?: EstadoUsuario;
  tipo_usuario?: 'conductor' | 'controlador';
}

/** Cuerpo que esperan POST /auth/register y POST /users. */
export interface RegisterDto {
  documento_identidad: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  contrasena: string;
  celular: string;
  estado?: EstadoUsuario;
  tipo_usuario?: 'conductor' | 'controlador';
}

/** Cuerpo de POST /auth/login. */
export interface LoginDto {
  email: string;
  contrasena: string;
}

/** Lo que devuelven login y register junto al usuario. */
export interface AuthSession {
  token: string;
  user: User;
}

/** Usuario de la sesión. Nunca incluye la contraseña ni su hash. */
export interface User {
  id: string;
  documento_identidad: string;
  primer_nombre: string;
  /** null cuando el backend no lo guardó (columna nullable). */
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  /** Nombre completo, derivado en `src/api/` uniendo las 4 partes. */
  name: string;
  email: string;
  celular: string;
  estado: EstadoUsuario;
  /** null = persona sin fila en conductoras/controladores/admin. */
  tipo_usuario: TipoUsuario | null;
  /** ISO 8601 (el backend usa `timestamp`, llega serializado como texto). */
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/** Alias del DTO de creación del users-service: es idéntico al de registro. */
export type CreateUserDto = RegisterDto;

/** Cuerpo de PATCH /users/:documento. Todo opcional; `contrasena` se hashea. */
export interface UpdateUserDto {
  primer_nombre?: string;
  segundo_nombre?: string | null;
  primer_apellido?: string;
  segundo_apellido?: string | null;
  email?: string;
  contrasena?: string;
  celular?: string;
  estado?: EstadoUsuario;
  tipo_usuario?: TipoUsuario;
}

/** Fila de `vehiculos` (PK `placa`, cada uno cuelga de un conductor). */
export interface Vehiculo {
  placa: string;
  id_conductor: string | null;
  marca: string | null;
  color: string | null;
}

/** Cuerpo de POST /users/:documento/vehiculo. */
export interface AddVehiculoDto {
  placa: string;
  marca: string;
  color: string;
}

export interface UpdateVehiculoDto {
  marca?: string;
  color?: string;
}

/** Usuario más sus vehículos: lo que devuelve POST /users/:documento/vehiculo. */
export interface UserWithVehiculos extends User {
  vehiculos: Vehiculo[];
}

/** Fila de `zonas_azules`. En la app latitud/longitud son número. */
export interface ZonaAzul {
  id: number;
  latitud: number;
  longitud: number;
  /** null cuando la zona se creó sin indicaciones (columna nullable). */
  indicaciones: string | null;
  capacidad: number;
  capacidad_total: number;
}

/** Cuerpo de POST /zonas. Acepta número o texto para las coordenadas. */
export interface CreateZonaDto {
  latitud: number | string;
  longitud: number | string;
  indicaciones: string;
  capacidad: number;
  capacidad_total: number;
}

/** Cuerpo de PATCH /zonas/:id. Todo opcional. */
export interface UpdateZonaDto {
  latitud?: number | string;
  longitud?: number | string;
  indicaciones?: string;
  capacidad?: number;
  capacidad_total?: number;
}

/** Lo que devuelve DELETE /zonas/:id cuando borra. */
export interface DeleteZonaResponse {
  message: string;
}

/**
 * Estados de `estado_reserva` en Postgres. Toda reserva nace `pendiente`; el
 * encargado la pasa a `activa` (acepta) o `cancelada` (rechaza), y a
 * `completada` cuando verifica la placa en la zona.
 */
export const ESTADOS_RESERVA = ['pendiente', 'activa', 'cancelada', 'completada'] as const;
export type EstadoReserva = (typeof ESTADOS_RESERVA)[number];

/** Fila de `reservas`. En la app `precio` es número y las fechas texto ISO. */
export interface Reserva {
  id: number;
  /** Id (uuid) del conductor que reservó. */
  id_conductor: string | null;
  id_zona: number | null;
  /** Placa del vehículo (FK a `vehiculos.placa`). null si el vehículo se borró. */
  id_vehiculo: string | null;
  /** Inicio de la ventana. El servidor lo reinicia cuando el encargado acepta. */
  fecha_real_inicio: string;
  /** Fin de la ventana de parqueo. */
  fecha_fin: string | null;
  /** COP, calculado en el servidor: horas × 3.500 + 5.000. */
  precio: number;
  estado: EstadoReserva;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/** Conductor que hizo una reserva, tal como lo ve el encargado de la zona. */
export interface ConductorDeReserva {
  id: string;
  documento_identidad: string;
  /** Nombre completo, derivado en `src/api/` uniendo las 4 partes. */
  name: string;
  email: string;
  celular: string;
}

/** Fila de GET /reservas/zona/:idZona: la reserva con su conductor y su vehículo. */
export interface ReservaDeZona {
  reserva: Reserva;
  /** null si la reserva quedó sin conductor. */
  conductor: ConductorDeReserva | null;
  /** null si el vehículo se borró después de reservar. */
  vehiculo: Vehiculo | null;
}

/** Cuerpo de PUT /reservas/:id/state. */
export interface UpdateReservaEstadoDto {
  estado: EstadoReserva;
  /**
   * ISO 8601. Si no se manda al completar o cancelar, el servidor pone "ahora"
   * como fin de la reserva.
   */
  fecha_fin?: string;
}

/** Cuerpo de POST /reservas. El servidor pone el inicio (ahora) y el precio. */
export interface CreateReservaDto {
  /** Id (uuid) del conductor: el `id` del usuario en sesión. */
  id_conductor: string;
  id_zona: number;
  /** Placa de un vehículo registrado a nombre del conductor (máx. 10). */
  id_vehiculo: string;
  /** ISO 8601, posterior a ahora. */
  fecha_fin: string;
}

/**
 * Fila de `horario_zona` (PK id_zona + id_controlador + fecha).
 * OJO: hoy solo existe la tabla en el zones-service, SIN endpoints:
 * no hay GET/POST/PATCH/DELETE para horarios todavía.
 */
export interface HorarioZona {
  /** Id de la zona azul asignada. */
  id_zona: number;
  /** Id (uuid) del controlador asignado. */
  id_controlador: string;
  /** Día del turno, formato YYYY-MM-DD. */
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}
