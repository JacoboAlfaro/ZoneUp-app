import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getResumenZonas, listZonas } from '@/src/api/zonas';
import type { ResumenZonas, ZonaAzul } from '@/src/types';
import { type CargarPagina, useListaPaginada } from '../useListaPaginada';

/** Primero las zonas con cupo: son las únicas donde se puede reservar. El servidor las ordena. */
const cargarZonas: CargarPagina<ZonaAzul> = (consulta) =>
  listZonas({ ...consulta, orden: 'disponibles' });

/**
 * Lógica de la pantalla "Reservar zona azul". La búsqueda, el orden y la
 * paginación los hace el servidor (ver `useListaPaginada`), y los totales de
 * cupos también: al volver de una reserva los cupos cambiaron y se recargan.
 */
export function useZonasParaReservar() {
  const lista = useListaPaginada(cargarZonas, (zona) => zona.id);
  const [resumen, setResumen] = useState<ResumenZonas | null>(null);

  const cargarResumen = useCallback(() => {
    getResumenZonas()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, []);

  useFocusEffect(cargarResumen);

  /** Deslizar hacia abajo: primera página y cupos de nuevo. */
  const refrescar = () => {
    void lista.recargar(true);
    cargarResumen();
  };

  return { ...lista, resumen, refrescar };
}
