import * as Notifications from 'expo-notifications';
import { router, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';

import type { User } from '../types';
import { destinoDeAviso, leerDatosAviso, seccionDelRol, type DatosAviso } from './avisos';
import { registrarEsteTelefono } from './dispositivo';

/**
 * Los avisos push de la sesión. Se usa una sola vez, en el layout raíz:
 *
 * 1. Al iniciar sesión, si el usuario ya había dado permiso, registra este teléfono en el
 *    servidor. El permiso NO se pide aquí: se pide en contexto (`usePermisoAvisos`).
 * 2. Al tocar un aviso abre el detalle de su reserva, también si la app estaba cerrada:
 *    la app arranca en el login (la sesión vive en memoria), el aviso queda pendiente y se
 *    abre cuando el usuario ya está dentro de la sección de su rol. Esperar a eso evita
 *    competir con la redirección de `app/index.tsx` justo después del login.
 */
export function useAvisosPush(user: User | null): void {
  const idUsuario = user?.id ?? null;
  const rol = user?.tipo_usuario ?? null;
  const pathname = usePathname();
  const [pendiente, setPendiente] = useState<DatosAviso | null>(null);

  useEffect(() => {
    if (idUsuario === null || seccionDelRol(rol) === null) return;
    registrarEsteTelefono().catch(() => {
      // Sin red o sin Google Play no hay token: la app sigue sin avisos.
    });
  }, [idUsuario, rol]);

  // Cubre la app abierta, en segundo plano y cerrada: el último aviso tocado queda guardado.
  const respuesta = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!respuesta || respuesta.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }
    // Se consume una sola vez: si no, se volvería a abrir en el próximo inicio de sesión.
    Notifications.clearLastNotificationResponse();
    setPendiente(leerDatosAviso(respuesta.notification.request.content.data));
  }, [respuesta]);

  useEffect(() => {
    if (pendiente === null || idUsuario === null) return;

    const destino = destinoDeAviso(pendiente, rol);
    if (destino === null) {
      setPendiente(null); // el aviso es de otro rol
      return;
    }
    // Todavía en el login o redirigiendo al panel: se espera a estar dentro.
    const seccion = seccionDelRol(rol);
    if (seccion === null || !pathname.startsWith(seccion)) return;

    setPendiente(null);
    router.push(destino);
  }, [pendiente, idUsuario, rol, pathname]);
}
