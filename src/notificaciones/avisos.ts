/**
 * Qué trae un aviso y a qué pantalla lleva. Solo funciones puras: no habla con
 * `expo-notifications` ni con el servidor.
 *
 * El servidor manda en cada aviso unos datos ocultos `{ tipo, reservaId, para }`
 * (reservations-service, `src/reservas/avisos.ts`). Con ellos la app arma la ruta: el
 * backend no conoce las rutas de la app.
 */

import type { Href } from 'expo-router';

import type { TipoUsuario } from '../types';

/** Para quién es el aviso. */
export type DestinatarioAviso = 'conductor' | 'controlador';

/** Los datos ocultos de un aviso de ZoneUp. */
export interface DatosAviso {
  /** Qué pasó: 'recordatorio_llegada', 'nueva_reserva', 'llegada_confirmada'... */
  tipo: string;
  reservaId: string;
  para: DestinatarioAviso;
}

/** Los datos de un aviso, o null si no es de ZoneUp o vienen incompletos. */
export function leerDatosAviso(data: unknown): DatosAviso | null {
  if (data === null || typeof data !== 'object') return null;
  const { tipo, reservaId, para } = data as Record<string, unknown>;

  if (typeof tipo !== 'string' || typeof reservaId !== 'string' || !/^\d+$/.test(reservaId)) {
    return null;
  }
  if (para !== 'conductor' && para !== 'controlador') return null;

  return { tipo, reservaId, para };
}

/**
 * La sección de la app de cada rol, con el mismo criterio que `Stack.Protected` en
 * `app/_layout.tsx`: todo el que no es admin ni encargado es conductor. El admin no
 * recibe avisos.
 */
export function seccionDelRol(rol: TipoUsuario | null): '/conductor' | '/controlador' | null {
  if (rol === 'admin') return null;
  return rol === 'controlador' ? '/controlador' : '/conductor';
}

/**
 * La pantalla que abre el aviso al tocarlo: el detalle de su reserva. null si el aviso es
 * para otro rol (p. ej. uno viejo en un teléfono compartido): así nadie abre lo de otro.
 */
export function destinoDeAviso(datos: DatosAviso, rol: TipoUsuario | null): Href | null {
  const seccion = seccionDelRol(rol);
  const params = { id: datos.reservaId };

  if (datos.para === 'controlador' && seccion === '/controlador') {
    return { pathname: '/controlador/(reservas)/reserva/[id]', params };
  }
  if (datos.para === 'conductor' && seccion === '/conductor') {
    return { pathname: '/conductor/(panel)/(reservas)/reserva/[id]', params };
  }
  return null;
}
