/**
 * Reservas (reservations-service).
 *
 * Flujo: el conductor reserva (`pendiente`) y tiene 15 minutos para llegar,
 * contados desde `fecha_creacion`. El encargado acepta (`activa`) y, cuando el
 * vehículo llega, verifica la placa: eso registra la llegada en
 * `fecha_real_inicio` y la reserva sigue `activa`. El servidor la pasa solo a
 * `completada` cuando llega `fecha_fin`, o a `cancelada` si nadie confirmó la
 * llegada en los 15 minutos. Ninguna acción mueve las fechas, salvo extender.
 *
 * Los cupos los controla el servidor: una reserva ocupa un cupo desde que se
 * crea, y lo suelta al cancelarse, al vencer los 15 minutos sin llegada o al
 * terminar su tiempo. Cada vehículo puede tener una sola reserva en curso.
 *
 * Endpoints que usa el conductor:
 * - POST  /reservas { id_zona, id_vehiculo, horas } (CONDUCTOR) -> reserva `pendiente`
 *   | 403 VEHICULO_AJENO | 409 VEHICULO_CON_RESERVA | 404 ZONA_NO_EXISTE | 409 ZONA_SIN_CUPO
 * - GET   /reservas/:id        (ADMIN, CONDUCTOR dueño) -> una reserva | 404 | 403 RESERVA_AJENA
 * - GET   /reservas/user/:id?limit&offset&en_curso (ADMIN, el propio CONDUCTOR) -> una
 *   página del historial del conductor (uuid), la más reciente primero, cada una
 *   con su zona. Con `en_curso=true`, solo las que ocupan un cupo ahora mismo.
 * - GET   /reservas/user/:id/resumen (ADMIN, el propio CONDUCTOR) -> conteo por estado
 * - PATCH /reservas/:id/extend { horas } (CONDUCTOR dueño) -> reserva con `fecha_fin` + horas
 *   | 403 RESERVA_AJENA | 409 RESERVA_TERMINADA | 400 DURACION_MAXIMA (más de 24 h)
 *
 * Endpoints que usa el encargado (controlador):
 * - GET   /reservas?q&estado&limit&offset (ADMIN, CONTROLADOR) -> una página de las
 *   reservas de todas las zonas con su conductor, vehículo y zona; primero las
 *   pendientes, luego las activas. Busca en el servidor.
 * - GET   /reservas/resumen      (ADMIN, CONTROLADOR) -> conteo por estado
 * - GET   /reservas/:id/completa (ADMIN, CONTROLADOR) -> una reserva con su conductor,
 *   vehículo y zona | 404
 * - PUT   /reservas/:id/state { estado: 'activa' | 'cancelada' } (ADMIN, CONTROLADOR)
 *   -> reserva | 404 | 409 LLEGADA_VENCIDA | 409 TRANSICION_INVALIDA
 * - POST  /reservas/:id/llegada (ADMIN, CONTROLADOR) -> reserva con la llegada
 *   | 409 RESERVA_NO_ACEPTADA | 409 LLEGADA_YA_CONFIRMADA | 409 LLEGADA_VENCIDA
 *
 * Los errores propios traen `codigo` (lo expone `ApiError.codigo`) y un
 * `message` listo para mostrar.
 */

import type {
  ConductorDeReserva,
  ConsultaPagina,
  CreateReservaDto,
  EstadoReserva,
  Pagina,
  Reserva,
  ReservaConZona,
  ReservaDeZona,
  ResumenReservas,
  UpdateReservaEstadoDto,
  ZonaDeReserva,
} from '../types';
import { conParametros, request } from './client';
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
  fecha_real_inicio: string | null;
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
 * CONDUCTOR: el servidor toma al conductor del token, calcula el fin (ahora +
 * horas) y el precio, y revisa en una sola transacción que el vehículo sea suyo,
 * que no tenga otra reserva en curso y que la zona tenga cupo. La placa se
 * normaliza a mayúsculas, como en `./vehiculos`.
 */
export async function createReserva(dto: CreateReservaDto): Promise<Reserva> {
  const body: CreateReservaDto = {
    id_zona: dto.id_zona,
    id_vehiculo: dto.id_vehiculo.trim().toUpperCase(),
    horas: dto.horas,
  };
  return toReserva(await request<ReservaResponse>('/reservas', body));
}

/** GET /reservas/:id -> una reserva. Requiere token (ADMIN o CONDUCTOR). 404 si no existe. */
export async function getReserva(id: number): Promise<Reserva> {
  return toReserva(await request<ReservaResponse>(`/reservas/${id}`));
}

interface ReservaConZonaResponse {
  reserva: ReservaResponse;
  zona: ZonaDeReserva | null;
}

/**
 * GET /reservas/user/:id -> una página del historial del conductor, la más
 * reciente primero, cada reserva con su zona. El parámetro es el `id` (uuid)
 * del usuario, no su documento. Con `enCurso`, solo las reservas que ocupan un
 * cupo ahora mismo (como máximo una por vehículo).
 */
export async function listReservasConductor(
  idConductor: string,
  { limit, offset, signal, enCurso }: ConsultaPagina & { enCurso?: boolean } = {},
): Promise<Pagina<ReservaConZona>> {
  const pagina = await request<Pagina<ReservaConZonaResponse>>(
    conParametros(`/reservas/user/${encodeURIComponent(idConductor.trim())}`, {
      limit,
      offset,
      en_curso: enCurso ? 'true' : undefined,
    }),
    undefined,
    { signal },
  );
  return {
    ...pagina,
    items: pagina.items.map((fila) => ({ reserva: toReserva(fila.reserva), zona: fila.zona })),
  };
}

/** GET /reservas/user/:id/resumen -> cuántas reservas tiene el conductor en cada estado. */
export async function getResumenReservasConductor(idConductor: string): Promise<ResumenReservas> {
  return request<ResumenReservas>(
    `/reservas/user/${encodeURIComponent(idConductor.trim())}/resumen`,
  );
}

/**
 * PATCH /reservas/:id/extend -> reserva con `fecha_fin` + `horas` y el precio
 * + horas × 3.500. Solo el conductor dueño, solo si sigue en curso y sin pasar
 * de 24 horas desde que se creó.
 */
export async function extendReserva(id: number, horas: number): Promise<Reserva> {
  return toReserva(
    await request<ReservaResponse>(`/reservas/${id}/extend`, { horas }, { method: 'PATCH' }),
  );
}

/** Conductor tal como llega junto a la reserva (sin contraseña). */
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
  zona: ZonaDeReserva | null;
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
    zona: data.zona,
  };
}

/**
 * GET /reservas -> una página de las reservas de todas las zonas, primero las
 * pendientes y luego las activas. Requiere token de ADMIN o CONTROLADOR. `q`
 * busca en el servidor por placa, conductor (nombre o documento), indicaciones
 * de la zona, "#12" (número de reserva) o "zona 3".
 */
export async function buscarReservas({
  q,
  estado,
  limit,
  offset,
  signal,
}: ConsultaPagina & { estado?: EstadoReserva } = {}): Promise<Pagina<ReservaDeZona>> {
  const pagina = await request<Pagina<ReservaDeZonaResponse>>(
    conParametros('/reservas', { q, estado, limit, offset }),
    undefined,
    { signal },
  );
  return { ...pagina, items: pagina.items.map(toReservaDeZona) };
}

/** GET /reservas/resumen -> cuántas reservas hay en cada estado. Requiere ADMIN o CONTROLADOR. */
export async function getResumenReservas(): Promise<ResumenReservas> {
  return request<ResumenReservas>('/reservas/resumen');
}

/**
 * GET /reservas/:id/completa -> la reserva con su conductor, vehículo y zona
 * (el detalle que ve el encargado). Requiere ADMIN o CONTROLADOR. 404 si no existe.
 */
export async function getReservaCompleta(id: number): Promise<ReservaDeZona> {
  return toReservaDeZona(await request<ReservaDeZonaResponse>(`/reservas/${id}/completa`));
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
 * El encargado acepta una solicitud `pendiente` -> `activa`. No cambia las
 * fechas. 409 `LLEGADA_VENCIDA` si ya pasaron los 15 minutos (el servidor la
 * cancela en ese momento).
 */
export async function aceptarReserva(id: number): Promise<Reserva> {
  return updateReservaEstado(id, { estado: 'activa' });
}

/**
 * Rechaza una solicitud `pendiente` o anula una `activa` -> `cancelada`. Libera
 * el cupo. Sin llegada, el precio queda en el cargo de reserva.
 */
export async function cancelarReserva(id: number): Promise<Reserva> {
  return updateReservaEstado(id, { estado: 'cancelada' });
}

/**
 * POST /reservas/:id/llegada -> la placa del vehículo coincide: registra la
 * llegada (`fecha_real_inicio` = ahora). La reserva sigue `activa` y conserva
 * su cupo hasta `fecha_fin`. Requiere ADMIN o CONTROLADOR. Con cuerpo `{}`,
 * `request` usa POST.
 */
export async function confirmarLlegada(id: number): Promise<Reserva> {
  return toReserva(await request<ReservaResponse>(`/reservas/${id}/llegada`, {}));
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

/**
 * Horas (con decimales) entre un inicio y un fin. La ventana de una reserva va
 * de `fecha_creacion` a `fecha_fin`.
 */
export function horasEntre(inicioIso: string, fin: Date): number {
  return (fin.getTime() - new Date(inicioIso).getTime()) / MS_POR_HORA;
}

/** Hasta cuándo tiene el conductor para llegar a la zona. */
export function limiteLlegada(reserva: Reserva): Date {
  return new Date(new Date(reserva.fecha_creacion).getTime() + MINUTOS_PARA_LLEGAR * 60 * 1000);
}

/** El encargado ya confirmó la llegada (verificó la placa). */
export function llego(reserva: Reserva): boolean {
  return reserva.fecha_real_inicio !== null;
}

/**
 * La reserva está "en camino": sigue pendiente o activa, nadie ha confirmado
 * la llegada y aún corren los 15 minutos. Es cuando se muestra el contador.
 */
export function estaEnCamino(reserva: Reserva, ahora: Date = new Date()): boolean {
  if (reserva.estado !== 'pendiente' && reserva.estado !== 'activa') return false;
  return !llego(reserva) && ahora.getTime() < limiteLlegada(reserva).getTime();
}

/** El vehículo llegó y su tiempo no ha terminado: está parqueado en la zona. */
export function estaParqueada(reserva: Reserva, ahora: Date = new Date()): boolean {
  if (reserva.estado !== 'activa' || !llego(reserva) || !reserva.fecha_fin) return false;
  return ahora.getTime() < new Date(reserva.fecha_fin).getTime();
}

/**
 * El tiempo para llegar venció sin que se confirmara la llegada. El servidor
 * la cancela en menos de un minuto; mientras tanto ya no ocupa el cupo.
 */
export function llegadaVencida(reserva: Reserva, ahora: Date = new Date()): boolean {
  if (reserva.estado !== 'pendiente' && reserva.estado !== 'activa') return false;
  return !llego(reserva) && ahora.getTime() >= limiteLlegada(reserva).getTime();
}
