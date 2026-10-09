import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { listZonas } from '@/src/api/zonas';
import type { ZonaAzul } from '@/src/types';

function normalizarBusqueda(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/**
 * Lógica de la pantalla "Reservar zona azul": trae las zonas, maneja los
 * estados de carga, recarga (pull to refresh) y error, filtra por la búsqueda
 * y calcula los totales de cupos.
 */
export function useZonasParaReservar() {
  const [zonas, setZonas] = useState<ZonaAzul[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarZonas = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setZonas(await listZonas());
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Al volver de una reserva los cupos cambiaron: se recargan al enfocar.
  useFocusEffect(
    useCallback(() => {
      void cargarZonas();
    }, [cargarZonas]),
  );

  const zonasConCupo = zonas.filter((zona) => zona.capacidad > 0).length;
  const cuposDisponibles = zonas.reduce((total, zona) => total + Math.max(0, zona.capacidad), 0);

  // Primero las zonas con cupo: son las únicas donde se puede reservar.
  const zonasFiltradas = useMemo(() => {
    const termino = normalizarBusqueda(busqueda.trim());
    const filtradas = termino
      ? zonas.filter((zona) =>
          [`Zona ${zona.id}`, `#${zona.id}`, zona.indicaciones ?? ''].some((value) =>
            normalizarBusqueda(value).includes(termino),
          ),
        )
      : zonas;

    return [...filtradas].sort((a, b) => Number(b.capacidad > 0) - Number(a.capacidad > 0));
  }, [busqueda, zonas]);

  return {
    zonas,
    busqueda,
    setBusqueda,
    loading,
    refreshing,
    error,
    cargarZonas,
    zonasConCupo,
    cuposDisponibles,
    zonasFiltradas,
  };
}
