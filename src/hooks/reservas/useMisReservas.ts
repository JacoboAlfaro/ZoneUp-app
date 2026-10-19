import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  estaEnCamino,
  getResumenReservasConductor,
  listReservasConductor,
} from '@/src/api/reservas';
import { tituloZona } from '@/src/formato';
import { useSession } from '@/src/session/context';
import type { Reserva, ReservaConZona, ResumenReservas } from '@/src/types';
import { type CargarPagina, useListaPaginada } from '../useListaPaginada';

/**
 * Lógica de la pantalla "Mis reservas": el historial del conductor en sesión,
 * paginado en el servidor y con el nombre de la zona en cada reserva (ya no se
 * descargan todas las zonas). Los totales también los cuenta el servidor.
 * Calcula la reserva en curso y se vuelve a cargar cada vez que gana el foco.
 */
export function useMisReservas() {
  const { user } = useSession();
  const [resumen, setResumen] = useState<ResumenReservas | null>(null);
  // Referencia de "ahora" para saber qué reserva sigue en camino; se renueva al
  // cargar y cuando el contador llega a 0:00.
  const [ahora, setAhora] = useState(() => new Date());

  const cargar = useCallback<CargarPagina<ReservaConZona>>(
    async (consulta) => {
      if (!user) return { items: [], total: 0, limit: consulta.limit, offset: consulta.offset };
      const pagina = await listReservasConductor(user.id, consulta);
      setAhora(new Date());
      return pagina;
    },
    [user],
  );
  const lista = useListaPaginada(cargar, (fila) => fila.reserva.id);

  const cargarResumen = useCallback(() => {
    if (!user) return;
    getResumenReservasConductor(user.id)
      .then(setResumen)
      .catch(() => setResumen(null));
  }, [user]);

  useFocusEffect(cargarResumen);

  /** Deslizar hacia abajo: primera página y totales de nuevo. */
  const refrescar = () => {
    void lista.recargar(true);
    cargarResumen();
  };

  const alTerminarLlegada = useCallback(() => setAhora(new Date()), []);

  const tituloDe = (fila: ReservaConZona) =>
    tituloZona(fila.zona?.indicaciones, fila.reserva.id_zona);

  const abrirDetalle = (reserva: Reserva) =>
    router.push({
      pathname: '/conductor/(reservas)/reserva/[id]',
      params: { id: String(reserva.id) },
    });

  // La reserva en curso es de las más recientes: siempre llega en la primera página.
  const enCamino = lista.items.find((fila) => estaEnCamino(fila.reserva, ahora)) ?? null;

  return {
    user,
    ...lista,
    resumen,
    refrescar,
    alTerminarLlegada,
    tituloDe,
    abrirDetalle,
    enCamino,
  };
}
