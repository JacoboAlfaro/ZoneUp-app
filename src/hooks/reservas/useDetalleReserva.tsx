import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  estaEnCamino,
  extendReserva,
  getReserva,
  HORAS_MAX,
  horasEntre,
  precioEstimado,
} from '@/src/api/reservas';
import { getZona } from '@/src/api/zonas';
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
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [extendiendo, setExtendiendo] = useState(false);
  const [horasExtra, setHorasExtra] = useState<number | null>(null);
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
        setError((cause as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idNumerico],
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
  const duracion = reserva?.fecha_fin
    ? horasEntre(reserva.fecha_real_inicio, new Date(reserva.fecha_fin))
    : null;

  // El servidor solo extiende reservas pendientes o activas. Las horas se suman
  // al fin actual, o a este momento si ese fin ya pasó.
  const extensible = reserva?.estado === 'pendiente' || reserva?.estado === 'activa';
  const baseExtension = Math.max(
    reserva?.fecha_fin ? new Date(reserva.fecha_fin).getTime() : 0,
    Date.now(),
  );
  const finConExtra = (horas: number) => new Date(baseExtension + horas * MS_POR_HORA);
  const superaMaximo = (horas: number) =>
    reserva !== null && horasEntre(reserva.fecha_real_inicio, finConExtra(horas)) > HORAS_MAX;
  const nuevoFin = horasExtra ? finConExtra(horasExtra) : null;
  const nuevoPrecio =
    reserva && nuevoFin ? precioEstimado(horasEntre(reserva.fecha_real_inicio, nuevoFin)) : null;

  const extender = () => {
    if (!reserva || !nuevoFin || nuevoPrecio === null || extendiendo) return;

    Alert.alert(
      'Extender reserva',
      `Nuevo fin: ${formatMomento(nuevoFin)}.\nNuevo total estimado: ${formatPesos(nuevoPrecio)}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Extender',
          onPress: async () => {
            setExtendiendo(true);
            setError(null);
            try {
              const actualizada = await extendReserva(reserva.id, nuevoFin.toISOString());
              setReserva(actualizada);
              setHorasExtra(null);
              Alert.alert(
                'Reserva extendida',
                `Nuevo fin: ${formatMomento(actualizada.fecha_fin ?? nuevoFin)}.`,
              );
            } catch (cause) {
              setError((cause as Error).message);
            } finally {
              setExtendiendo(false);
            }
          },
        },
      ],
    );
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
