import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { estaEnCamino, listReservasConductor } from '@/src/api/reservas';
import { listZonas } from '@/src/api/zonas';
import { tituloZona } from '@/src/formato';
import { useSession } from '@/src/session/context';
import type { Reserva, ZonaAzul } from '@/src/types';

/**
 * Lógica de la pantalla "Mis reservas": trae las reservas del conductor en
 * sesión junto con las zonas (para mostrar sus nombres), maneja los estados de
 * carga, recarga (pull to refresh) y error, y calcula la reserva en curso y los
 * totales. Se vuelve a cargar cada vez que la pantalla gana el foco.
 */
export function useMisReservas() {
  const { user } = useSession();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [zonas, setZonas] = useState<Map<number, ZonaAzul>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Referencia de "ahora" para saber qué reserva sigue en camino; se renueva al
  // cargar y cuando el contador llega a 0:00.
  const [ahora, setAhora] = useState(() => new Date());

  const cargarReservas = useCallback(
    async (refresh = false) => {
      if (!user) return;

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        // Las zonas solo se usan para mostrar el nombre de cada una.
        const [misReservas, todasLasZonas] = await Promise.all([
          listReservasConductor(user.id),
          listZonas(),
        ]);
        setReservas(misReservas);
        setZonas(new Map(todasLasZonas.map((zona) => [zona.id, zona])));
        setAhora(new Date());
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void cargarReservas();
    }, [cargarReservas]),
  );

  const alTerminarLlegada = useCallback(() => setAhora(new Date()), []);

  const tituloDe = (reserva: Reserva) =>
    tituloZona(
      reserva.id_zona === null ? null : zonas.get(reserva.id_zona)?.indicaciones,
      reserva.id_zona,
    );

  const abrirDetalle = (reserva: Reserva) =>
    router.push({
      pathname: '/conductor/(reservas)/reserva/[id]',
      params: { id: String(reserva.id) },
    });

  const enCamino = reservas.find((reserva) => estaEnCamino(reserva, ahora)) ?? null;
  const completadas = reservas.filter((reserva) => reserva.estado === 'completada').length;

  return {
    user,
    reservas,
    loading,
    refreshing,
    error,
    cargarReservas,
    alTerminarLlegada,
    tituloDe,
    abrirDetalle,
    enCamino,
    completadas,
  };
}
