/**
 * Usuarios (users-service).
 *
 * Endpoints reales:
 * - POST  /users                  (público)  -> usuario creado (sin token)
 * - GET   /users                  (ADMIN)    -> lista de usuarios
 * - GET   /users/:email           (ADMIN)    -> un usuario | 404
 * - PATCH /users/:documento       (ADMIN)    -> usuario actualizado | 404 | 409
 *   (los vehículos viven en `./vehiculos` aunque cuelguen de esta ruta base)
 *
 */

import type { CreateUserDto, UpdateUserDto, User } from '../types';
import { toUser } from './auth';
import type { UserResponse } from './auth';
import { request } from './client';

/**
 * POST /users -> el usuario creado (201, sin token).
 * Pide lo mismo que el registro; para el formulario con `nombres/apellidos`
 * usa `register` de `./auth`, que además devuelve la sesión.
 */
export async function createUser(dto: CreateUserDto): Promise<User> {
  return toUser(await request<UserResponse>('/users', dto));
}

/** GET /users -> todos los usuarios. Requiere token de ADMIN. */
export async function listUsers(): Promise<User[]> {
  const users = await request<UserResponse[]>('/users');
  return users.map(toUser);
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
 * PATCH /users/:documento -> usuario actualizado. Requiere token de ADMIN.
 * Solo manda los campos definidos; `contrasena` no vacía se guarda hasheada.
 * Errores: 404 si el documento no existe, 409 si el email choca o el tipo de
 * usuario ya estaba asignado (solo se puede asignar una vez).
 */
export async function updateUser(documento: string, dto: UpdateUserDto): Promise<User> {
  const limpio = documento.trim();
  return toUser(
    await request<UserResponse>(`/users/${encodeURIComponent(limpio)}`, dto, { method: 'PATCH' }),
  );
}
