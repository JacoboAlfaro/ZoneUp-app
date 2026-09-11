/**
 * Puerta de entrada a la API: importa desde aquí en pantallas y contextos.
 *
 *   import { login, listZonas, addVehiculo } from '../api';
 *
 * Cada recurso vive en su archivo (auth, users, vehiculos, zonas); este índice
 * solo los reexporta para no memorizar rutas internas.
 */

export { ApiError, getBaseUrl, getToken, request, setToken } from './client';
export type { ApiBase, HttpMethod, RequestOptions } from './client';

export { login, register, toRegisterDto, toUser } from './auth';
export type { UserResponse } from './auth';

export { createUser, getUserByEmail, listUsers, updateUser } from './users';

export { addVehiculo, getVehiculos } from './vehiculos';
export type { VehiculoResponse } from './vehiculos';

export { createZona, deleteZona, getZona, listZonas, toZona, updateZona } from './zonas';
export type { ZonaResponse } from './zonas';
