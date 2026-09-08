/**
 * Endpoints de autenticación (prefijo /api/auth) y la traducción entre el
 * español del servidor y el inglés de la app.
 */

import type { Register, RegisterDto, EstadoUsuario, TipoUsuario, User } from '../types';
import { request } from './client';

/** Forma EXACTA en que el backend devuelve un usuario. No cambiar a la ligera. */
interface UserResponse {
  id: string;
  documento_identidad: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  email: string;
  celular: string;
  estado: EstadoUsuario;
  tipo_usuario: TipoUsuario;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

interface SessionResponse {
  user: UserResponse;
  access_token: string;
}

/** El único lugar donde se convierte la respuesta del servidor al tipo de la app. */
function toUser(data: UserResponse): User {
  return {
    id: data.id,
    documento_identidad: data.documento_identidad,
    primer_nombre: data.primer_nombre,
    segundo_nombre: data.segundo_nombre,
    primer_apellido: data.primer_apellido,
    segundo_apellido: data.segundo_apellido,
    name: [
      data.primer_nombre,
      data.segundo_nombre,
      data.primer_apellido,
      data.segundo_apellido,
    ]
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
export async function login(email: string, contrasena: string) {
  const session = await request<SessionResponse>('/auth/login', {
    email: email,
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

/** POST /auth/register -> el usuario creado (201). Ojo: NO devuelve token. */
export async function register(form: Register): Promise<User> {
  return toUser(await request<UserResponse>('/auth/register', toRegisterDto(form)));
}

/** GET /auth/perfil -> el usuario de la sesión actual. Requiere token. */
export async function profile(): Promise<User> {
  return toUser(await request<UserResponse>('/auth/perfil'));
}
