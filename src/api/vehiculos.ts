/**
 * Vehículos (users-service, bajo la ruta de usuarios).
 *
 * Endpoints reales:
 * - POST /users/:documento/vehiculo  (ADMIN o CONDUCTOR) -> usuario + vehículos
 *   | 404 si el documento no existe | 400 si no es conductor | 409 placa repetida
 * - GET  /users/:documento/vehiculos (ADMIN o CONDUCTOR) -> vehículos []
 *   | 404 si el documento no existe (un no-conductor devuelve [])
 */

import type { AddVehiculoDto, UserWithVehiculos, Vehiculo } from '../types';
import { toUser } from './auth';
import type { UserResponse } from './auth';
import { request } from './client';

/** Vehículo tal como lo manda el servidor (marca/color pueden ser null). */
export interface VehiculoResponse {
  placa: string;
  id_conductor: string | null;
  marca: string | null;
  color: string | null;
}

interface UserWithVehiculosResponse extends UserResponse {
  vehiculos: VehiculoResponse[];
}

function toVehiculo(data: VehiculoResponse): Vehiculo {
  return {
    placa: data.placa,
    id_conductor: data.id_conductor,
    marca: data.marca,
    color: data.color,
  };
}

/**
 * GET /users/:documento/vehiculos -> los vehículos del conductor ([] si no
 * tiene ninguno). Requiere sesión (ADMIN o CONDUCTOR). 404 si el documento
 * no existe.
 */
export async function getVehiculos(documento: string): Promise<Vehiculo[]> {
  const path = `/users/${encodeURIComponent(documento.trim())}/vehiculos`;
  const data = await request<VehiculoResponse[]>(path);
  return data.map(toVehiculo);
}

/**
 * Registra un vehículo al conductor con ese documento y devuelve el usuario
 * con su lista completa de vehículos. Requiere sesión (ADMIN o CONDUCTOR).
 * La placa se normaliza a mayúsculas sin espacios, como en una tarjeta de
 * propiedad (el servidor la recorta a 10 caracteres).
 */
export async function addVehiculo(documento: string, dto: AddVehiculoDto): Promise<UserWithVehiculos> {
  const path = `/users/${encodeURIComponent(documento.trim())}/vehiculo`;
  const body = {
    placa: dto.placa.trim().toUpperCase(),
    marca: dto.marca.trim(),
    color: dto.color.trim(),
  };
  const data = await request<UserWithVehiculosResponse>(path, body);
  return { ...toUser(data), vehiculos: data.vehiculos.map(toVehiculo) };
}
