/**
 * Avisos push (auth-service): qué teléfono recibe los avisos del usuario en sesión.
 *
 * Endpoints (con sesión; el servidor toma al usuario del token, nunca del cuerpo):
 * - PUT    /auth/token-push { token } -> 204 | 400 formato inválido
 * - DELETE /auth/token-push { token } -> 204 (solo lo quita si el teléfono es del usuario)
 *
 * La app no decide qué avisar ni a quién: eso lo hace reservations-service cuando cambia
 * una reserva. La app solo dice "este teléfono es mío" y reacciona al tocar un aviso.
 */

import { request } from './client';

/** Este teléfono recibe los avisos del usuario en sesión (si era de otra cuenta, pasa a esta). */
export async function registrarTelefono(token: string): Promise<void> {
  await request<unknown>('/auth/token-push', { token }, { method: 'PUT' });
}

/** Este teléfono deja de recibir los avisos del usuario en sesión. */
export async function quitarTelefono(token: string): Promise<void> {
  await request<unknown>('/auth/token-push', { token }, { method: 'DELETE' });
}
