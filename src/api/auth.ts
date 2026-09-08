/**
 * Endpoints de autenticación (prefijo /api/auth) y la traducción entre el
 * español del servidor y el inglés de la app.
 */

import type { Register, RegisterDto, Role, User } from '../types';
import { request } from './client';

/** Forma EXACTA en que el backend devuelve un usuario. No cambiar a la ligera. */
interface UserResponse {
  id: string;
  nombre: string;
  correo: string;
  rol: Role;
  activo: boolean;
}

interface SessionResponse {
  token: string;
  usuario: UserResponse;
}

/** El único lugar donde se convierte la respuesta del servidor al tipo de la app. */
function toUser(data: UserResponse): User {
  return {
    id: data.id,
    name: data.nombre,
    email: data.correo,
    role: data.rol,
    active: data.activo,
  };
}

/** POST /auth/login -> token de sesión y usuario que entró. */
export async function login(email: string, contrasena: string) {
  const session = await request<SessionResponse>('/auth/login', {
    correo: email,
    clave: contrasena,
  });
  return { token: session.token, user: toUser(session.usuario) };
}

function splitEnDos(value: string): [string, string?] {
  const [primero = '', ...resto] = value.trim().split(/\s+/);
  const segundo = resto.join(' ');

  return segundo === '' ? [primero] : [primero, segundo];
}

/** Traduce el formulario al cuerpo que espera el backend. */
export function toRegisterDto(form: Register): RegisterDto {
  const [primer_nombre, segundo_nombre] = splitEnDos(form.nombres);
  const [primer_apellido, segundo_apellido] = splitEnDos(form.apellidos);

  return {
    documento_identidad: form.documento_identidad.trim(),
    primer_nombre,
    ...(segundo_nombre ? { segundo_nombre } : {}),
    primer_apellido,
    ...(segundo_apellido ? { segundo_apellido } : {}),
    email: form.email.trim().toLowerCase(),
    contrasena: form.contrasena,
    celular: form.celular.trim(),
    ...(form.estado ? { estado: form.estado } : {}),
    ...(form.tipo_usuario ? { tipo_usuario: form.tipo_usuario } : {}),
  };
}

/** POST /auth/register -> el usuario creado (201). Ojo: NO devuelve token. */
export async function register(form: Register): Promise<User> {
  return toUser(await request<UserResponse>('/auth/register', toRegisterDto(form)));
}

/** GET /auth/perfil -> el usuario de la sesión actual. Requiere token. */
export async function profile(): Promise<User> {
  return toUser(await request<UserResponse>('/auth/perfil'));
}
