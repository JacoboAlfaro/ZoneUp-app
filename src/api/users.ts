/**
 * Usuarios (users-service).
 *
 * Endpoints reales:
 * - POST  /users                  (ADMIN)    -> usuario creado
 * - GET   /users?q&estado&limit&offset (ADMIN) -> una página de usuarios (busca y filtra en el servidor)
 * - GET   /users/resumen          (ADMIN)    -> { total, activos }
 * - GET   /users/:email           (ADMIN)    -> un usuario | 404
 * - PATCH /users/:documento       (ADMIN, o el propio CONDUCTOR) -> usuario actualizado
 *   | 404 | 409 email repetido | 403 sin permiso | 400 tipo o estado inválido
 *   (los vehículos viven en `./vehiculos` aunque cuelguen de esta ruta base)
 *
 */

import type {
  ConsultaPagina,
  CreateUserDto,
  EstadoUsuario,
  Pagina,
  ResumenUsuarios,
  UpdateUserDto,
  User,
} from '../types';
import { toUser } from './auth';
import type { UserResponse } from './auth';
import { conParametros, request } from './client';

/**
 * POST /users -> el usuario creado (201). Requiere token de ADMIN.
 * Pide lo mismo que el registro; para el formulario con `nombres/apellidos`
 * usa `register` de `./auth`, que además devuelve la sesión.
 */
export async function createUser(dto: CreateUserDto): Promise<User> {
  return toUser(await request<UserResponse>('/users', dto));
}

/**
 * GET /users -> una página de usuarios, los más recientes primero. Requiere
 * token de ADMIN. `q` busca en nombre, documento y correo; `estado` deja solo
 * ese estado. Ambos filtros los aplica el servidor.
 */
export async function listUsers({
  q,
  estado,
  limit,
  offset,
  signal,
}: ConsultaPagina & { estado?: EstadoUsuario } = {}): Promise<Pagina<User>> {
  const pagina = await request<Pagina<UserResponse>>(
    conParametros('/users', { q, estado, limit, offset }),
    undefined,
    { signal },
  );
  return { ...pagina, items: pagina.items.map(toUser) };
}

/** GET /users/resumen -> cuántos usuarios hay y cuántos están activos. Requiere token de ADMIN. */
export async function getResumenUsuarios(): Promise<ResumenUsuarios> {
  return request<ResumenUsuarios>('/users/resumen');
}

/**
 * GET /users/:email -> un usuario. Requiere token de ADMIN.
 * El parámetro de la ruta es el correo (se codifica: el `@` viaja como %40).
 */
export async function getUserByEmail(email: string): Promise<User> {
  const limpio = email.trim().toLowerCase();
  return toUser(await request<UserResponse>(`/users/${encodeURIComponent(limpio)}`));
}

/**
 * PATCH /users/:documento -> usuario actualizado. Un admin edita a cualquiera;
 * un conductor solo a sí mismo y sin tocar `tipo_usuario` ni `estado`.
 * Solo manda los campos definidos; `contrasena` no vacía se guarda hasheada.
 * Cambiar `tipo_usuario` reemplaza el tipo anterior (sus vehículos y reservas
 * se conservan). Errores: 404 si el documento no existe, 409 si el email choca,
 * 403 sin permiso, 400 si un admin intenta cambiar su propio tipo.
 */
export async function updateUser(documento: string, dto: UpdateUserDto): Promise<User> {
  const limpio = documento.trim();
  return toUser(
    await request<UserResponse>(`/users/${encodeURIComponent(limpio)}`, dto, { method: 'PATCH' }),
  );
}
