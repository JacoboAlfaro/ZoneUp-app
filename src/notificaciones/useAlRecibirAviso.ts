import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

import { leerDatosAviso, type DatosAviso } from './avisos';

/**
 * Llama a `alRecibir` cada vez que llega un aviso de ZoneUp con la app abierta. Lo usan
 * las pantallas de reservas para recargarse solas: así el conductor ve que el encargado
 * aceptó o confirmó su llegada sin tener que deslizar para refrescar.
 */
export function useAlRecibirAviso(alRecibir: (datos: DatosAviso) => void): void {
  // En un ref para no volver a suscribirse cada vez que la pantalla crea la función.
  const alRecibirRef = useRef(alRecibir);
  useEffect(() => {
    alRecibirRef.current = alRecibir;
  }, [alRecibir]);

  useEffect(() => {
    const suscripcion = Notifications.addNotificationReceivedListener((aviso) => {
      const datos = leerDatosAviso(aviso.request.content.data);
      if (datos) alRecibirRef.current(datos);
    });
    return () => suscripcion.remove();
  }, []);
}
