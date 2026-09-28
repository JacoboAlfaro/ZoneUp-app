/**
 * Puerta de entrada a la API: importa desde aquí en pantallas y contextos.
 *
 *   import { login, listZonas, addVehiculo } from '../api';
 *
 * Cada recurso vive en su archivo (auth, users, vehiculos, zonas, reservas); este índice
 * solo los reexporta para no memorizar rutas internas.
 */

export { ApiError, getBaseUrl, getToken, request, setToken } from './client';
export type { ApiBase, HttpMethod, RequestOptions } from './client';

export { login, register, toRegisterDto, toUser } from './auth';
export type { UserResponse } from './auth';

export { createUser, getUserByEmail, listUsers, updateUser } from './users';

export { addVehiculo, getVehiculos, toVehiculo } from './vehiculos';
export type { VehiculoResponse } from './vehiculos';

export { createZona, deleteZona, getZona, listZonas, toZona, updateZona } from './zonas';
export type { ZonaResponse } from './zonas';

export {
  aceptarReserva,
  cancelarReserva,
  CARGO_RESERVA,
  confirmarLlegada,
  createReserva,
  estaEnCamino,
  extendReserva,
  getReserva,
  HORAS_MAX,
  HORAS_MIN,
  horasEntre,
  limiteLlegada,
  listReservasConductor,
  listReservasDeZonas,
  listReservasZona,
  MINUTOS_PARA_LLEGAR,
  precioEstimado,
  TARIFA_HORA,
  toReserva,
  updateReservaEstado,
} from './reservas';
export type { ReservaResponse } from './reservas';
