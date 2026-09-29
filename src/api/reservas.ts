/**
 * Reservas (reservations-service).
 *
 * Endpoints reales que usa el conductor:
 * - POST  /reservas            (CONDUCTOR)        -> reserva creada, estado `pendiente`
 *   | 400 conductor, vehículo o zona no existe | 400 fecha inválida
 * - GET   /reservas/:id        (ADMIN, CONDUCTOR) -> una reserva | 404 "Reserva no encontrada"
 * - GET   /reservas/user/:id   (ADMIN, CONDUCTOR) -> reservas del conductor (uuid), la más
 *   reciente primero ([] si no tiene)
 * - PATCH /reservas/:id/extend (CONDUCTOR)        -> reserva con nueva `fecha_fin` y precio
 *   | 400 si no es suya, si ya terminó o si la nueva hora no es mayor a la actual
 *
 * Endpoints reales que usa el encargado (controlador):
 * - GET   /reservas/zona/:idZona (ADMIN, CONTROLADOR) -> reservas de la zona con su
 *   conductor y vehículo, la más reciente primero
 * - PUT   /reservas/:id/state    (ADMIN, CONTROLADOR) -> reserva con el nuevo estado | 404
 *
 * El servidor pone el inicio (ahora), calcula el precio y descuenta un cupo de
 * la zona al crear. OJO: no valida que queden cupos; eso lo revisa la app.
 * Al pasar a `completada` o `cancelada` devuelve el cupo a la zona.
 *
 * No hay GET /reservas (lista global) ni endpoint que diga qué zonas tiene
 * asignadas un controlador: el encargado consulta zona por zona.
 */

import type {
  ConductorDeReserva,
  CreateReservaDto,
  EstadoReserva,
  Reserva,
  ReservaDeZona,
  UpdateReservaEstadoDto,
} from '../types';
import { request } from './client';
import { toVehiculo, type VehiculoResponse } from './vehiculos';

/**
 * Reserva tal como la manda el servidor: `precio` llega como texto porque en
 * Postgres es `decimal(7,2)`. Aquí se convierte a número.
 */
export interface ReservaResponse {
  id: number;
  id_conductor: string | null;
  id_zona: number | null;
  id_vehiculo: string | null;
  fecha_real_inicio: string;
  fecha_fin: string | null;
  precio: string | number;
  estado: EstadoReserva;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

/** El único lugar donde se convierte la respuesta del servidor al tipo de la app. */
export function toReserva(data: ReservaResponse): Reserva {
  return {
    id: data.id,
    id_conductor: data.id_conductor,
    id_zona: data.id_zona,
    id_vehiculo: data.id_vehiculo,
    fecha_real_inicio: data.fecha_real_inicio,
    fecha_fin: data.fecha_fin,
    precio: typeof data.precio === 'number' ? data.precio : Number(data.precio),
    estado: data.estado,
    fecha_creacion: data.fecha_creacion,
    fecha_actualizacion: data.fecha_actualizacion,
  };
}

/**
 * POST /reservas -> reserva creada en estado `pendiente`. Requiere token de
 * CONDUCTOR. La placa se normaliza a mayúsculas, como en `./vehiculos`.
 */
export async function createReserva(dto: CreateReservaDto): Promise<Reserva> {
  const body: CreateReservaDto = {
    id_conductor: dto.id_conductor,
    id_zona: dto.id_zona,
    id_vehiculo: dto.id_vehiculo.trim().toUpperCase(),
    fecha_fin: dto.fecha_fin,
  };
  return toReserva(await request<ReservaResponse>('/reservas', body));
}

/** GET /reservas/:id -> una reserva. Requiere token (ADMIN o CONDUCTOR). 404 si no existe. */
export async function getReserva(id: number): Promise<Reserva> {
  return toReserva(await request<ReservaResponse>(`/reservas/${id}`));
}

/**
 * GET /reservas/user/:id -> las reservas del conductor, la más reciente primero.
 * El parámetro es el `id` (uuid) del usuario, no su documento.
 */
export async function listReservasConductor(idConductor: string): Promise<Reserva[]> {
  const reservas = await request<ReservaResponse[]>(
    `/reservas/user/${encodeURIComponent(idConductor.trim())}`,
  );
  return reservas.map(toReserva);
}

/**
 * PATCH /reservas/:id/extend -> reserva con la nueva `fecha_fin` y el precio
 * recalculado. Solo el conductor dueño de la reserva, y solo si sigue
 * `pendiente` o `activa`.
 */
export async function extendReserva(id: number, fechaFin: string): Promise<Reserva> {
  return toReserva(
    await request<ReservaResponse>(
      `/reservas/${id}/extend`,
      { fecha_fin: fechaFin },
      { method: 'PATCH' },
    ),
  );
}

/**
 * Conductor tal como llega en GET /reservas/zona/:idZona. El servidor manda la
 * fila completa de `usuarios` (incluido el hash de la contraseña): aquí solo
 * se declaran y copian los datos que la app necesita.
 */
interface ConductorResponse {
  id: string;
  documento_identidad: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  email: string;
  celular: string;
}

interface ReservaDeZonaResponse {
  reserva: ReservaResponse;
  conductor: ConductorResponse | null;
  vehiculo: VehiculoResponse | null;
}

function toConductorDeReserva(data: ConductorResponse): ConductorDeReserva {
  return {
    id: data.id,
    documento_identidad: data.documento_identidad,
    name: [data.primer_nombre, data.segundo_nombre, data.primer_apellido, data.segundo_apellido]
      .filter(Boolean)
      .join(' '),
    email: data.email,
    celular: data.celular,
  };
}

function toReservaDeZona(data: ReservaDeZonaResponse): ReservaDeZona {
  return {
    reserva: toReserva(data.reserva),
    conductor: data.conductor ? toConductorDeReserva(data.conductor) : null,
    vehiculo: data.vehiculo ? toVehiculo(data.vehiculo) : null,
  };
}

/**
 * GET /reservas/zona/:idZona -> reservas de la zona con su conductor y
 * vehículo, la más reciente primero. Requiere token de ADMIN o CONTROLADOR.
 */
export async function listReservasZona(idZona: number): Promise<ReservaDeZona[]> {
  const filas = await request<ReservaDeZonaResponse[]>(`/reservas/zona/${idZona}`);
  return filas.map(toReservaDeZona);
}

/**
 * Las reservas de varias zonas juntas: una petición por zona, en paralelo,
 * porque el servidor no tiene una lista global.
 */
export async function listReservasDeZonas(idsZona: number[]): Promise<ReservaDeZona[]> {
  const porZona = await Promise.all(idsZona.map((idZona) => listReservasZona(idZona)));
  return porZona.flat();
}

/**
 * PUT /reservas/:id/state -> reserva con el nuevo estado. Requiere token de
 * ADMIN o CONTROLADOR. Mejor usar las funciones de abajo, que ya saben qué
 * estado corresponde a cada acción del encargado.
 */
export async function updateReservaEstado(
  id: number,
  dto: UpdateReservaEstadoDto,
): Promise<Reserva> {
  return toReserva(
    await request<ReservaResponse>(`/reservas/${id}/state`, dto, { method: 'PUT' }),
  );
}

/**
 * El encargado acepta una solicitud `pendiente` -> `activa`. El servidor
 * reinicia la ventana desde este momento y conserva su duración.
 */
export async function aceptarReserva(id: number): Promise<Reserva> {
  return updateReservaEstado(id, { estado: 'activa' });
}

/** Rechaza una solicitud `pendiente` o anula una `activa` -> `cancelada`. Libera el cupo. */
export async function cancelarReserva(id: number): Promise<Reserva> {
  return updateReservaEstado(id, { estado: 'cancelada' });
}

/**
 * La placa del vehículo coincide con la de la reserva -> `completada`.
 * Se reenvía el fin actual: sin él, el servidor cortaría la ventana en "ahora"
 * y el historial del conductor mostraría una duración que no reservó.
 */
export async function confirmarLlegada(reserva: Reserva): Promise<Reserva> {
  return updateReservaEstado(reserva.id, {
    estado: 'completada',
    ...(reserva.fecha_fin ? { fecha_fin: reserva.fecha_fin } : {}),
  });
}

/*
 * Reglas del servicio que la app replica para mostrar valores antes de
 * enviar. El servidor sigue siendo quien decide el precio final.
 */

/** Tarifa por hora de parqueo (COP). */
export const TARIFA_HORA = 3500;
/** Cargo fijo por crear la reserva (COP). */
export const CARGO_RESERVA = 5000;
/** Horas enteras que se pueden reservar. */
export const HORAS_MIN = 1;
export const HORAS_MAX = 24;
/** Tiempo que tiene el conductor para llegar a la zona después de reservar. */
export const MINUTOS_PARA_LLEGAR = 15;

const MS_POR_HORA = 60 * 60 * 1000;

/** Mismo cálculo que el servidor: horas × tarifa + cargo de reserva. */
export function precioEstimado(horas: number): number {
  return Math.max(0, horas) * TARIFA_HORA + CARGO_RESERVA;
}

/** Horas (con decimales) entre el inicio de la reserva y un fin dado. */
export function horasEntre(inicioIso: string, fin: Date): number {
  return (fin.getTime() - new Date(inicioIso).getTime()) / MS_POR_HORA;
}

/** Hasta cuándo tiene el conductor para llegar a la zona. */
export function limiteLlegada(reserva: Reserva): Date {
  return new Date(new Date(reserva.fecha_creacion).getTime() + MINUTOS_PARA_LLEGAR * 60 * 1000);
}

/**
 * La reserva está "en camino": sigue pendiente o activa y aún corren los 15
 * minutos para llegar. Mientras exista una así, el conductor no puede reservar
 * otra zona.
 */
export function estaEnCamino(reserva: Reserva, ahora: Date = new Date()): boolean {
  if (reserva.estado !== 'pendiente' && reserva.estado !== 'activa') return false;
  return ahora.getTime() < limiteLlegada(reserva).getTime();
}
