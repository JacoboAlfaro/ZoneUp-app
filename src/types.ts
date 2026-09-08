/**
 * El vocabulario de la app, en inglés.
 *
 * El backend habla español (`nombre`, `correo`, `clave`...). Esa traducción
 * ocurre en un solo sitio, `src/api/`, y de ahí para acá todo se llama igual.
 * Así, si el servidor renombra un campo, solo cambia el archivo que traduce.
 *
 * Los VALORES de las listas (SOLICITANTE, ALTA, RED...) sí van en español:
 * no son nombres de código, son los datos que el servidor guarda y devuelve.
 */

/** Roles del sistema. El backend asigna SOLICITANTE por defecto al registrarse. */
export const ROLES = ['SOLICITANTE', 'AGENTE', 'COORDINADOR', 'ADMINISTRADOR'] as const;
export type Role = (typeof ROLES)[number];

export const ESTADOS_USUARIO = ['activo', 'inactivo'] as const;
export type EstadoUsuario = (typeof ESTADOS_USUARIO)[number];

export const TIPOS_USUARIO = ['conductor', 'controlador'] as const;
export type TipoUsuario = (typeof TIPOS_USUARIO)[number];

/**
 * Lo que el usuario escribe en el formulario: un solo campo para los nombres y
 * otro para los apellidos. `src/api/auth.ts` los parte antes de enviarlos.
 */
export interface Register {
  documento_identidad: string;
  nombres: string;
  apellidos: string;
  email: string;
  contrasena: string;
  celular: string;
  estado?: EstadoUsuario;
  tipo_usuario?: TipoUsuario;
}

export interface RegisterDto {
  documento_identidad: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  contrasena: string;
  celular: string;
  estado?: EstadoUsuario;
  tipo_usuario?: TipoUsuario;
}

/** Usuario de la sesión. Nunca incluye la contraseña ni su hash. */
export interface User {
  id: string;
  documento_identidad: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  name: string;
  email: string;
  celular: string;
  estado: EstadoUsuario;
  tipo_usuario: TipoUsuario;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

