/**
 * Cliente HTTP: el ÚNICO archivo de la app que sabe usar `fetch`.
 *
 * Todo lo demás (pantallas, contexto de sesión) llama a funciones con nombre de
 * negocio en `src/api/*.ts`. Si mañana cambia la forma de hablar con el
 * servidor, se cambia aquí y nada más.
 *
 * El backend son microservicios NestJS sin prefijo global. Los endpoints de
 * cada uno están documentados en su archivo: `./auth`, `./users`,
 * `./vehiculos`, `./zonas` y `./reservas`.
 *
 * En el dispositivo se habla con UN gateway (ver `.env`: EXPO_PUBLIC_API_URL,
 * puerto 3003) que reenvía cada prefijo a su servicio. Sin gateway, define las
 * variables por servicio y `request` elige la base según el prefijo del path.
 */

// La URL se lee del archivo .env. Tiene que escribirse EXACTAMENTE así, con
// notación de punto: Expo busca ese texto en el código y lo reemplaza por el
// valor al compilar. Guardarlo en una variable intermedia no funcionaría.
function sinBarraFinal(url: string): string {
  return url.replace(/\/+$/, '');
}

function baseDeEnv(valor: string | undefined, porDefecto: string): string {
  const limpio = (valor ?? '').trim();
  return sinBarraFinal(limpio === '' ? porDefecto : limpio);
}

const GATEWAY_URL = baseDeEnv(process.env.EXPO_PUBLIC_API_URL, 'http://localhost:3003');
const AUTH_URL = baseDeEnv(process.env.EXPO_PUBLIC_AUTH_URL, GATEWAY_URL);
const USERS_URL = baseDeEnv(process.env.EXPO_PUBLIC_USERS_URL, GATEWAY_URL);
const ZONAS_URL = baseDeEnv(process.env.EXPO_PUBLIC_ZONAS_URL, GATEWAY_URL);
const RESERVAS_URL = baseDeEnv(process.env.EXPO_PUBLIC_RESERVAS_URL, GATEWAY_URL);

/** A qué servicio pertenece cada llamada. Se infiere del prefijo del path. */
export type ApiBase = 'auth' | 'users' | 'zonas' | 'reservas';

/** Base efectiva para un servicio (útil para depurar a dónde apunta la app). */
export function getBaseUrl(base: ApiBase = 'auth'): string {
  if (base === 'users') return USERS_URL;
  if (base === 'zonas') return ZONAS_URL;
  if (base === 'reservas') return RESERVAS_URL;
  return AUTH_URL;
}

function baseDeRuta(path: string): ApiBase {
  if (path === '/users' || path.startsWith('/users/')) return 'users';
  if (path === '/zonas' || path.startsWith('/zonas/')) return 'zonas';
  if (path === '/reservas' || path.startsWith('/reservas/')) return 'reservas';
  return 'auth';
}

/**
 * Token JWT de la sesión activa.
 *
 * Vive en memoria: al cerrar la app se pierde y hay que volver a entrar.
 * ponytail: sin almacenamiento persistente. Para que la sesión sobreviva al
 * cierre, instalar `expo-secure-store` y guardarlo/leerlo aquí.
 */
let token: string | null = null;

/** La llama el contexto de sesión al entrar (token) y al salir (null). */
export function setToken(value: string | null): void {
  token = value;
}

/** El token actual, por si alguna pantalla lo necesita (p. ej. para depurar). */
export function getToken(): string | null {
  return token;
}

/**
 * Error con el mensaje legible del servidor y el estado HTTP.
 * Las pantallas muestran `error.message`; pueden ramificar por `error.status`
 * (401 credenciales, 404 no existe, 409 duplicado...) o, mejor, por `codigo`
 * cuando el servidor lo manda (p. ej. `ZONA_SIN_CUPO`, `VEHICULO_CON_RESERVA`).
 */
export class ApiError extends Error {
  readonly status: number;
  /** Código del caso, si el servidor lo manda: `{ statusCode, error, codigo, message }`. */
  readonly codigo?: string;

  constructor(message: string, status: number, codigo?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions {
  /** Por defecto: GET sin `body`, POST con `body`. PATCH/DELETE hay que pedirlos. */
  method?: HttpMethod;
  /** Por defecto se infiere del prefijo del path (/auth, /users, /zonas, /reservas). */
  base?: ApiBase;
  /**
   * Para cancelar la petición. Las búsquedas cancelan la anterior cuando el
   * usuario cambia el texto, así una respuesta vieja nunca pisa a la nueva.
   */
  signal?: AbortSignal;
}

/**
 * El path con su query string, omitiendo los valores vacíos:
 * `conParametros('/users', { q: 'ana', limit: 20 })` -> `/users?q=ana&limit=20`.
 */
export function conParametros(
  path: string,
  parametros: Record<string, string | number | null | undefined>,
): string {
  const query = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(String(valor))}`)
    .join('&');

  return query ? `${path}?${query}` : path;
}

/**
 * Hace una petición a la API y devuelve el JSON ya tipado.
 *
 * - Si hay sesión activa, adjunta la cabecera `Authorization: Bearer <token>`.
 * - Si el servidor responde con error, lanza un `ApiError` con SU mensaje.
 *   NestJS responde `{ message, error, statusCode }`, donde `message` puede ser
 *   texto o lista; aquí se normaliza a un solo texto para la pantalla.
 *
 * @param path Ruta relativa a la API, empezando por "/". Ej: "/zonas/3".
 * @param body Cuerpo JSON. Solo se envía si se pasa (aunque sea `{}`).
 * @param options.method Para PATCH/PUT/DELETE. @param options.base Para forzar
 *   un servicio cuando el path no empieza por su prefijo.
 */
export async function request<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
  const method: HttpMethod = options?.method ?? (body === undefined ? 'GET' : 'POST');
  const base = getBaseUrl(options?.base ?? baseDeRuta(path));
  const url = `${base}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        // Solo se declara JSON cuando se envía cuerpo: un GET no lo necesita.
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        // Sintaxis de "propagación condicional": si no hay token, no se añade
        // la cabecera en lugar de mandarla vacía.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options?.signal,
    });
  } catch (cause) {
    // Cancelada a propósito (llegó una búsqueda más nueva): quien la canceló la ignora.
    if (options?.signal?.aborted) throw cause;
    // `fetch` solo falla así cuando no hubo respuesta: servidor apagado, URL
    // equivocada o el dispositivo no alcanza esa dirección (ver "Configuración" en el README).
    throw new ApiError(`No se pudo conectar con ${base}. ¿Está encendido el servidor?`, 0);
  }

  // Se lee como texto primero: un 204 o un gateway caído pueden no traer JSON,
  // y `response.json()` reventaría en vez de dejar decidir aquí.
  const text = await response.text().catch(() => '');
  let data: unknown = {};
  try {
    if (text.trim() !== '') data = JSON.parse(text) as unknown;
  } catch {
    // No es JSON (p. ej. la página HTML de un proxy caído): se reporta como error HTTP.
    if (response.ok) throw new ApiError(`Respuesta inválida del servidor en ${path}`, response.status);
  }

  if (!response.ok) {
    throw new ApiError(mensajeDeError(data, response.status, path), response.status, codigoDeError(data));
  }

  return data as T;
}

/** El `codigo` que manda el servidor en sus errores propios, si es texto. */
function codigoDeError(data: unknown): string | undefined {
  if (data === null || typeof data !== 'object') return undefined;
  const codigo = (data as Record<string, unknown>)['codigo'];
  return typeof codigo === 'string' && codigo !== '' ? codigo : undefined;
}

/** Saca el mensaje legible del formato de error de NestJS. */
function mensajeDeError(data: unknown, status: number, path: string): string {
  if (data !== null && typeof data === 'object') {
    const rec = data as Record<string, unknown>;
    const message = rec['message'];
    if (typeof message === 'string' && message.trim() !== '') return message;
    if (Array.isArray(message)) {
      const junto = message.filter((m): m is string => typeof m === 'string' && m.trim() !== '').join(', ');
      if (junto !== '') return junto;
    }
    // Algunos proxies responden `{ error: "texto" }`: también sirve.
    const error = rec['error'];
    if (typeof error === 'string' && error.trim() !== '') return error;
  }
  return `Error ${status} al llamar ${path}`;
}
