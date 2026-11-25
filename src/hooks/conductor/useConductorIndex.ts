import {
  estaEnCamino,
  estaParqueada,
  listReservasConductor,
} from '@/src/api/reservas';
import { listTodasLasZonas } from '@/src/api/zonas';
import { deadlineReserva } from '@/src/components/ReservaTiempoChip';
import { useAlRecibirAviso } from '@/src/notificaciones/useAlRecibirAviso';
import { useSession } from '@/src/session/context';
import type { ReservaConZona, ZonaAzul } from '@/src/types';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useState } from 'react';

import { useUbicacion } from './useUbicacion';

function esReservaViva(fila: ReservaConZona, ahora: Date): boolean {
  return estaEnCamino(fila.reserva, ahora) || estaParqueada(fila.reserva, ahora);
}

function elegirReservaActiva(filas: ReservaConZona[], ahora: Date): ReservaConZona | null {
  const vivas = filas.filter((fila) => esReservaViva(fila, ahora));
  if (vivas.length === 0) return null;

  return vivas.reduce((mejor, fila) => {
    const a = deadlineReserva(mejor.reserva, ahora)?.getTime() ?? Number.POSITIVE_INFINITY;
    const b = deadlineReserva(fila.reserva, ahora)?.getTime() ?? Number.POSITIVE_INFINITY;
    return b < a ? fila : mejor;
  });
}

export function useConductorIndex() {
  const { user } = useSession();
  // El index está DENTRO del Stack; openDrawer vive en el layout padre.
  const navigation = useNavigation('/conductor');
  const ubicacion = useUbicacion();
  const [zonas, setZonas] = useState<ZonaAzul[]>([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaAzul | null>(null);
  const [reservaActiva, setReservaActiva] = useState<ReservaConZona | null>(null);
  const [panelReservaAbierto, setPanelReservaAbierto] = useState(false);

  const abrirDrawer = () => {
    (navigation as { openDrawer?: () => void }).openDrawer?.();
  };

  const cargarReservaActiva = useCallback(
    async (signal?: AbortSignal) => {
      if (!user) {
        setReservaActiva(null);
        return;
      }
      try {
        const pagina = await listReservasConductor(user.id, {
          enCurso: true,
          limit: 20,
          signal,
        });
        if (signal?.aborted) return;
        const ahora = new Date();
        const elegida = elegirReservaActiva(pagina.items, ahora);
        setReservaActiva(elegida);
        if (!elegida) setPanelReservaAbierto(false);
      } catch {
        if (!signal?.aborted) setReservaActiva(null);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void listTodasLasZonas(controller.signal)
        .then((items) => {
          setZonas(items);
          setZonaSeleccionada((actual) =>
            actual ? items.find((zona) => zona.id === actual.id) ?? null : null,
          );
        })
        .catch(() => {
          if (!controller.signal.aborted) setZonas([]);
        });
      void cargarReservaActiva(controller.signal);
      return () => controller.abort();
    }, [cargarReservaActiva]),
  );

  const alTerminarTiempo = useCallback(() => {
    void cargarReservaActiva();
  }, [cargarReservaActiva]);

  // Si el encargado acepta/cancela, el chip del mapa se actualiza.
  useAlRecibirAviso(() => {
    void cargarReservaActiva();
  });

  const abrirPanelReserva = () => {
    setZonaSeleccionada(null);
    setPanelReservaAbierto(true);
  };

  const cerrarPanelReserva = () => setPanelReservaAbierto(false);

  const seleccionarZona = (zona: ZonaAzul | null) => {
    setPanelReservaAbierto(false);
    setZonaSeleccionada(zona);
  };

  return {
    user,
    abrirDrawer,
    zonas,
    zonaSeleccionada,
    seleccionarZona,
    cerrarZona: () => setZonaSeleccionada(null),
    reservaActiva,
    panelReservaAbierto,
    abrirPanelReserva,
    cerrarPanelReserva,
    refrescarReservaActiva: () => void cargarReservaActiva(),
    alTerminarTiempo,
    ubicacionConcedida: ubicacion.concedido,
    miUbicacion: ubicacion.coordenada,
    ubicacionListo: ubicacion.listo,
  };
}