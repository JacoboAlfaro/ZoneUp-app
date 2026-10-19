/**
 * Zonas azules (zones-service).
 *
 * Endpoints reales:
 * - POST   /zonas     (ADMIN)   -> zona creada
 * - GET    /zonas?q&orden&limit&offset (público) -> una página de zonas (busca en el servidor)
 * - GET    /zonas/resumen (público) -> { total, con_cupo, cupos_disponibles }
 * - GET    /zonas/:id (público) -> una zona | 404 "Zona no encontrada"
 * - PATCH  /zonas/:id (ADMIN)   -> zona actualizada | 404
 * - DELETE /zonas/:id (ADMIN)   -> { message: "Zona eliminada" } | 404
 *
 * Las lecturas son públicas: el mapa puede usarlas sin sesión.
 * La escritura exige token de ADMIN (el de conductor devuelve 403).
 */

import type {
  ConsultaPagina,
  CreateZonaDto,
  DeleteZonaResponse,
  Pagina,
  ResumenZonas,
  UpdateZonaDto,
  ZonaAzul,
} from '../types';
import { conParametros, request } from './client';

/**
 * Zona tal como la manda el servidor: `latitud/longitud` llegan como texto
 * porque en Postgres son `decimal(9,6)`. Aquí se convierten a número.
 */
export interface ZonaResponse {
  id: number;
  latitud: string | number;
  longitud: string | number;
  indicaciones: string | null;
  capacidad: number;
  capacidad_total: number;
}

/** El único lugar donde se convierte la respuesta del servidor al tipo de la app. */
export function toZona(data: ZonaResponse): ZonaAzul {
  return {
    id: data.id,
    latitud: typeof data.latitud === 'number' ? data.latitud : Number(data.latitud),
    longitud: typeof data.longitud === 'number' ? data.longitud : Number(data.longitud),
    indicaciones: data.indicaciones,
    capacidad: data.capacidad,
    capacidad_total: data.capacidad_total,
  };
}

/**
 * GET /zonas -> una página de zonas azules. Sin token. `q` busca en las
 * indicaciones o por número ("12", "#12", "zona 12"). `orden: 'disponibles'`
 * pone primero las que tienen cupo; por defecto van por número.
 */
export async function listZonas({
  q,
  limit,
  offset,
  signal,
  orden,
}: ConsultaPagina & { orden?: 'id' | 'disponibles' } = {}): Promise<Pagina<ZonaAzul>> {
  const pagina = await request<Pagina<ZonaResponse>>(
    conParametros('/zonas', { q, orden, limit, offset }),
    undefined,
    { signal },
  );
  return { ...pagina, items: pagina.items.map(toZona) };
}

/** GET /zonas/resumen -> total de zonas, cuántas tienen cupo y cupos libres en total. Sin token. */
export async function getResumenZonas(): Promise<ResumenZonas> {
  return request<ResumenZonas>('/zonas/resumen');
}

/** GET /zonas/:id -> una zona. Sin token. 404 si no existe. */
export async function getZona(id: number): Promise<ZonaAzul> {
  return toZona(await request<ZonaResponse>(`/zonas/${id}`));
}

/** POST /zonas -> zona creada. Requiere token de ADMIN. */
export async function createZona(dto: CreateZonaDto): Promise<ZonaAzul> {
  return toZona(await request<ZonaResponse>('/zonas', dto));
}

/** PATCH /zonas/:id -> zona actualizada. Requiere token de ADMIN. 404 si no existe. */
export async function updateZona(id: number, dto: UpdateZonaDto): Promise<ZonaAzul> {
  return toZona(await request<ZonaResponse>(`/zonas/${id}`, dto, { method: 'PATCH' }));
}

/** DELETE /zonas/:id -> { message: "Zona eliminada" }. Requiere token de ADMIN. */
export async function deleteZona(id: number): Promise<DeleteZonaResponse> {
  return request<DeleteZonaResponse>(`/zonas/${id}`, undefined, { method: 'DELETE' });
}
