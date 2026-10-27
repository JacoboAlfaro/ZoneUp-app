/**
 * El vocabulario de la app.
 *
 *
 * Mapa real del backend (microservicios NestJS detrás de un gateway, sin prefijo global):
 * - auth  :3000 -> POST /auth/register, POST /auth/login (ver src/api/auth.ts)
 * - users :3001 -> POST /users, GET /users?q&estado, GET /users/resumen, GET /users/:email,
 *                  POST /users/:documento/vehiculo, GET /users/:documento/vehiculos,
 *                  PATCH /users/:documento
 *                  (ver src/api/users.ts y src/api/vehiculos.ts)
 * - zonas :3002 -> POST /zonas, GET /zonas, GET /zonas/resumen, GET /zonas/:id,
 *                  PATCH /zonas/:id, DELETE /zonas/:id (ver src/api/zonas.ts)
 * - reservas :3004 -> POST /reservas, GET /reservas, GET /reservas/resumen,
 *                  GET /reservas/:id, GET /reservas/:id/completa, GET /reservas/user/:id,
 *                  GET /reservas/user/:id/resumen, PUT /reservas/:id/state,
 *                  POST /reservas/:id/llegada, PATCH /reservas/:id/extend
 *                  (ver src/api/reservas.ts)
 *
 * Los listados (GET /users, /zonas, /reservas y /reservas/user/:id) buscan y
 * paginan en el servidor: devuelven una `Pagina`, nunca la tabla completa.
 */

/** Una página de un listado del servidor y cuántos elementos coinciden en total. */
export interface Pagina<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/** Lo que se le pide al servidor para traer una página de un listado. */
export interface ConsultaPagina {
  /** Texto buscado. El servidor ignora tildes y mayúsculas. */
  q?: string;
  /** Elementos por página (el servidor pone 20 por defecto y máximo 50). */
  limit?: number;
  /** Cuántos elementos saltar: el largo de lo que ya se mostró. */
  offset?: number;
  signal?: AbortSignal;
}

/**
 * Estados de `estado_usuario` en Postgres. El registro crea al usuario como
 * `inactivo` si no se manda otro.
 */
export const ESTADOS_USUARIO = ['activo', 'no_verificado', 'inactivo', 'eliminado'] as const;
export type EstadoUsuario = (typeof ESTADOS_USUARIO)[number];

/**
 * Subtablas de `usuarios` (`conductores`, `controladores` o `admin`): cada
 * persona tiene un solo tipo vigente, o ninguno (null). El registro siempre
 * crea `conductor`; un administrador puede cambiarlo después (el tipo anterior
 * queda marcado como eliminado en el servidor y su historial se conserva).
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

/** Zona azul. En la app latitud/longitud son número. */
export interface ZonaAzul {
  id: number;
  latitud: number;
  longitud: number;
  /** null cuando la zona se creó sin indicaciones (columna nullable). */
  indicaciones: string | null;
  /**
   * Cupos disponibles ahora, calculados por el servidor: capacidad total menos
   * las reservas en curso. Solo lectura.
   */
  capacidad: number;
  /** Cupos físicos de la zona. Es lo único que define el admin. */
  capacidad_total: number;
}

/**
 * Cuerpo de POST /zonas. Acepta número o texto para las coordenadas. Los
 * disponibles no se mandan: los calcula el servidor.
 */
export interface CreateZonaDto {
  latitud: number | string;
  longitud: number | string;
  indicaciones: string;
  capacidad_total: number;
}

/** Cuerpo de PATCH /zonas/:id. Todo opcional. */
export interface UpdateZonaDto {
  latitud?: number | string;
  longitud?: number | string;
  indicaciones?: string;
  /** 409 `CAPACIDAD_MENOR_A_OCUPADOS` si queda por debajo de las reservas en curso. */
  capacidad_total?: number;
}

/** Lo que devuelve DELETE /zonas/:id cuando borra. */
export interface DeleteZonaResponse {
  message: string;
}

/**
 * Estados de `estado_reserva` en Postgres. Toda reserva nace `pendiente`; el
 * encargado la pasa a `activa` (acepta) o `cancelada` (rechaza o cancela).
 * Verificar la placa registra la llegada y la deja `activa`. El servidor la
 * pasa solo a `completada` cuando termina su tiempo, o a `cancelada` si el
 * conductor no llegó en 15 minutos.
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
  /** Llegada confirmada por el encargado (placa verificada). null = aún no llega. */
  fecha_real_inicio: string | null;
  /**
   * Fin de la reserva: creación + horas reservadas (más las extensiones).
   * null solo en datos viejos rotos.
   */
  fecha_fin: string | null;
  /**
   * COP, calculado en el servidor: horas × 3.500 + 5.000. Si se cancela sin
   * llegada, queda solo el cargo de reserva (5.000).
   */
  precio: number;
  estado: EstadoReserva;
  /** Cuándo se hizo la reserva. La ventana empieza aquí y de aquí cuentan los 15 minutos para llegar. */
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

/** Lo justo de la zona para mostrar su nombre junto a una reserva. */
export interface ZonaDeReserva {
  id: number;
  indicaciones: string | null;
}

/** Fila del historial del conductor (GET /reservas/user/:id): la reserva y su zona. */
export interface ReservaConZona {
  reserva: Reserva;
  /** null si la zona se borró. */
  zona: ZonaDeReserva | null;
}

/** Fila de GET /reservas: la reserva con su conductor, su vehículo y su zona. */
export interface ReservaDeZona extends ReservaConZona {
  /** null si la reserva quedó sin conductor. */
  conductor: ConductorDeReserva | null;
  /** null si el vehículo se borró después de reservar. */
  vehiculo: Vehiculo | null;
}

/** GET /users/resumen. */
export interface ResumenUsuarios {
  total: number;
  activos: number;
}

/** GET /zonas/resumen. */
export interface ResumenZonas {
  total: number;
  con_cupo: number;
  cupos_disponibles: number;
}

/** GET /reservas/resumen y GET /reservas/user/:id/resumen: cuántas hay en cada estado. */
export interface ResumenReservas {
  total: number;
  pendiente: number;
  activa: number;
  completada: number;
  cancelada: number;
}

/**
 * Cuerpo de PUT /reservas/:id/state: `activa` = aceptar una pendiente,
 * `cancelada` = rechazar o cancelar. `completada` no se pide: la pone el servidor.
 */
export interface UpdateReservaEstadoDto {
  estado: 'activa' | 'cancelada';
}

/**
 * Cuerpo de POST /reservas. El conductor sale del token; el servidor calcula el
 * fin (ahora + horas) con su reloj y el precio.
 */
export interface CreateReservaDto {
  id_zona: number;
  /** Placa de un vehículo registrado a nombre del conductor (máx. 10). */
  id_vehiculo: string;
  /** Horas enteras, de 1 a 24. */
  horas: number;
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
