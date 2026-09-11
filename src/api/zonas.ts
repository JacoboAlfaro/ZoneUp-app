/**
 * Zonas azules (zones-service).
 *
 * Endpoints reales:
 * - POST   /zonas     (ADMIN)   -> zona creada
 * - GET    /zonas     (público) -> lista de zonas
 * - GET    /zonas/:id (público) -> una zona | 404 "Zona no encontrada"
 * - PATCH  /zonas/:id (ADMIN)   -> zona actualizada | 404
 * - DELETE /zonas/:id (ADMIN)   -> { message: "Zona eliminada" } | 404
 *
 * Las lecturas son públicas: el mapa puede usarlas sin sesión.
 * La escritura exige token de ADMIN (el de conductor devuelve 403).
 */

import type { CreateZonaDto, DeleteZonaResponse, UpdateZonaDto, ZonaAzul } from '../types';
import { request } from './client';

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

/** GET /zonas -> todas las zonas azules. Sin token. */
export async function listZonas(): Promise<ZonaAzul[]> {
  const zonas = await request<ZonaResponse[]>('/zonas');
  return zonas.map(toZona);
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
