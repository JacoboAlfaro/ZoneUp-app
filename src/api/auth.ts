/**
 * Auth (auth-service): entrar y registrarse.
 *
 * Endpoints reales (públicos, sin token):
 * - POST /auth/login    -> { user, access_token } | 401 "Credenciales invalidas"
 * - POST /auth/register -> { user, access_token } | 400 faltan campos | 409 ya existe
 *
 * El backend NO tiene GET /auth/perfil: para leer un usuario usa
 * `getUserByEmail` de `./users` (requiere token de ADMIN).
 */

import type { AuthSession, EstadoUsuario, Register, RegisterDto, TipoUsuario, User } from '../types';
import { request } from './client';

/** Usuario tal como lo manda el servidor (sin `name`: se deriva aquí). */
export interface UserResponse {
  id: string;
  documento_identidad: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  email: string;
  celular: string;
  estado: EstadoUsuario;
  tipo_usuario: TipoUsuario | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface SessionResponse {
  user: UserResponse;
  access_token: string;
}

/** El único lugar donde se convierte la respuesta del servidor al tipo de la app. */
export function toUser(data: UserResponse): User {
  return {
    id: data.id,
    documento_identidad: data.documento_identidad,
    primer_nombre: data.primer_nombre,
    segundo_nombre: data.segundo_nombre,
    primer_apellido: data.primer_apellido,
    segundo_apellido: data.segundo_apellido,
    name: [data.primer_nombre, data.segundo_nombre, data.primer_apellido, data.segundo_apellido]
      .filter(Boolean)
      .join(' '),
    email: data.email,
    celular: data.celular,
    estado: data.estado,
    tipo_usuario: data.tipo_usuario,
    fecha_creacion: data.fecha_creacion,
    fecha_actualizacion: data.fecha_actualizacion,
  };
}

/** POST /auth/login -> token de sesión y usuario que entró. */
export async function login(email: string, contrasena: string): Promise<AuthSession> {
  const session = await request<SessionResponse>('/auth/login', {
    email: email.trim().toLowerCase(),
    contrasena: contrasena,
  });
  return { token: session.access_token, user: toUser(session.user) };
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

/**
 * POST /auth/register -> sesión completa (usuario + token).
 * El servidor firma el JWT al crear la cuenta, así que NO hace falta un login
 * extra después: el contexto de sesión entra directo con lo devuelto aquí.
 */
export async function register(form: Register): Promise<AuthSession> {
  const session = await request<SessionResponse>('/auth/register', toRegisterDto(form));
  return { token: session.access_token, user: toUser(session.user) };
}
