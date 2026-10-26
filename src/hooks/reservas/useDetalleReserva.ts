import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

import { ApiError } from '@/src/api/client';
import {
  estaEnCamino,
  estaParqueada,
  extendReserva,
  getReserva,
  HORAS_MAX,
  horasEntre,
  TARIFA_HORA,
} from '@/src/api/reservas';
import { getZona } from '@/src/api/zonas';
import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import { detalleZona, formatMomento, formatPesos, tituloZona } from '@/src/formato';
import { useSession } from '@/src/session/context';
import type { Reserva, ZonaAzul } from '@/src/types';

const MS_POR_HORA = 60 * 60 * 1000;

/**
 * Lógica de la pantalla "Detalle de la reserva" del conductor: lee el id de la
 * ruta, carga la reserva y su zona, pone el número como título del encabezado,
 * lleva la referencia de "ahora" para el contador de llegada y permite extender
 * la reserva unas horas más.
 */
export function useDetalleReserva() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { user } = useSession();
  const alerta = useAlerta();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [extendiendo, setExtendiendo] = useState(false);
  const [horasExtra, setHorasExtra] = useState<number | null>(null);
  /** Error al cargar la reserva. Los demás errores se muestran en una alerta. */
  const [error, setError] = useState<string | null>(null);
  // Referencia de "ahora" para el contador; se renueva al cargar y cuando llega a 0:00.
  const [ahora, setAhora] = useState(() => new Date());

  const idNumerico = id ? Number(id) : NaN;

  const cargar = useCallback(
    async (refresh = false) => {
      if (!Number.isInteger(idNumerico)) {
        setError('Identificador de reserva inválido.');
        setLoading(false);
        return;
      }

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await getReserva(idNumerico);
        setReserva(data);
        setAhora(new Date());
        // La zona solo aporta nombre e indicaciones: si falla, la reserva se muestra igual.
        if (data.id_zona !== null) {
          setZona(await getZona(data.id_zona).catch(() => null));
        }
      } catch (cause) {
        const mensaje = (cause as Error).message;
        // Al recargar, la reserva ya está en pantalla y el error no se vería: se avisa.
        if (refresh) {
          void alerta.mostrar({ tipo: 'error', titulo: 'No se pudo actualizar la reserva', mensaje });
        } else {
          setError(mensaje);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idNumerico, alerta],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: reserva ? `Reserva #${reserva.id}` : 'Detalle de la reserva',
    });
  }, [navigation, reserva]);

  const alTerminarLlegada = useCallback(() => setAhora(new Date()), []);

  const enCamino = reserva !== null && estaEnCamino(reserva, ahora);
  const titulo = tituloZona(zona?.indicaciones, reserva?.id_zona ?? null);
  const extra = detalleZona(zona?.indicaciones);
  // La ventana va desde que se hizo la reserva hasta su fin.
  const duracion = reserva?.fecha_fin
    ? horasEntre(reserva.fecha_creacion, new Date(reserva.fecha_fin))
    : null;

  // Se puede extender mientras la reserva sigue en curso: en camino o parqueada.
  // Las horas se suman al fin actual, sin pasar de HORAS_MAX desde la creación.
  const extensible =
    reserva !== null && reserva.fecha_fin !== null && (enCamino || estaParqueada(reserva, ahora));
  const finConExtra = (horas: number) =>
    reserva?.fecha_fin ? new Date(new Date(reserva.fecha_fin).getTime() + horas * MS_POR_HORA) : null;
  const superaMaximo = (horas: number) => {
    const fin = finConExtra(horas);
    return reserva === null || fin === null || horasEntre(reserva.fecha_creacion, fin) > HORAS_MAX;
  };
  const nuevoFin = horasExtra ? finConExtra(horasExtra) : null;
  const nuevoPrecio = reserva && horasExtra ? reserva.precio + horasExtra * TARIFA_HORA : null;

  const extender = async () => {
    if (!reserva || !horasExtra || !nuevoFin || nuevoPrecio === null || extendiendo) return;

    const confirmado = await alerta.confirmar({
      titulo: 'Extender reserva',
      mensaje: `Nuevo fin: ${formatMomento(nuevoFin)}.\nNuevo total estimado: ${formatPesos(nuevoPrecio)}.`,
      textoConfirmar: 'Extender',
    });
    if (!confirmado) return;

    setExtendiendo(true);
    try {
      const actualizada = await extendReserva(reserva.id, horasExtra);
      setReserva(actualizada);
      setHorasExtra(null);
      void alerta.mostrar({
        tipo: 'exito',
        titulo: 'Reserva extendida',
        mensaje: `Nuevo fin: ${formatMomento(actualizada.fecha_fin ?? nuevoFin)}.`,
      });
    } catch (cause) {
      // 409 RESERVA_TERMINADA: la reserva terminó o se canceló mientras tanto.
      const terminada = cause instanceof ApiError && cause.status === 409;
      void alerta.mostrar({
        tipo: terminada ? 'advertencia' : 'error',
        titulo: 'No se pudo extender la reserva',
        mensaje: (cause as Error).message,
      });
      if (terminada) {
        setHorasExtra(null);
        void cargar(true);
      }
    } finally {
      setExtendiendo(false);
    }
  };

  return {
    user,
    reserva,
    loading,
    refreshing,
    error,
    cargar,
    alTerminarLlegada,
    enCamino,
    titulo,
    extra,
    duracion,
    extensible,
    horasExtra,
    setHorasExtra,
    superaMaximo,
    nuevoFin,
    nuevoPrecio,
    extendiendo,
    extender,
  };
}
