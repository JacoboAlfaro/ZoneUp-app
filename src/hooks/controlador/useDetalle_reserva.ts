import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ReservaDeZona } from '@/src/types';
import {
  ApiError,
  estaEnCamino,
  estaParqueada,
  getReservaCompleta,
  horasEntre,
  limiteLlegada,
  llegadaVencida,
  llego,
} from '@/src/api';
import { detalleZona, tituloZona } from '@/src/formato';
import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import { AccionReserva, ejecutarAccionReserva } from '@/src/components/reservas/accionesReserva';

export default function useDetalle_reserva() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const alerta = useAlerta();
  const [item, setItem] = useState<ReservaDeZona | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => new Date());   // Referencia para saber si el conductor sigue a tiempo de llegar.

  const idNumerico = id ? Number(id) : NaN;

  // Una sola petición: la reserva con su conductor, su vehículo y su zona.
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
        setItem(await getReservaCompleta(idNumerico));
        setAhora(new Date());
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
      title: item ? `Reserva #${item.reserva.id}` : 'Detalle de la reserva',
    });
  }, [navigation, item]);

  // Cuando vencen los 15 minutos se renueva "ahora", y la pantalla deja de
  // ofrecer la verificación de placa.
  const limite = item && estaEnCamino(item.reserva, ahora) ? limiteLlegada(item.reserva).getTime() : null;
  useEffect(() => {
    if (limite === null) return;
    const espera = setTimeout(() => setAhora(new Date()), Math.max(0, limite - Date.now()) + 500);
    return () => clearTimeout(espera);
  }, [limite]);

  if(!item){
    return {item: null, reserva: null, loading, error}
  }
  const { reserva, conductor, vehiculo } = item;
  const placa = reserva.id_vehiculo ?? '—';
  const titulo = tituloZona(item.zona?.indicaciones, reserva.id_zona);
  const extra = detalleZona(item.zona?.indicaciones);
  const llegada = llego(reserva);
  const enCamino = estaEnCamino(reserva, ahora);
  const vencida = llegadaVencida(reserva, ahora);
  const parqueada = estaParqueada(reserva, ahora);
  // La ventana va desde que se hizo la reserva hasta su fin.
  const duracion = reserva.fecha_fin
    ? horasEntre(reserva.fecha_creacion, new Date(reserva.fecha_fin))
    : null;

  const ejecutar = async (accion: AccionReserva) => {
    if (procesando) return;
    setProcesando(true);

    try {
      const actualizada = await ejecutarAccionReserva(accion, reserva, alerta);
      if (actualizada) setItem({ ...item, reserva: actualizada });
    } catch (cause) {
      // 409: la reserva cambió entretanto (otro encargado, o venció el tiempo para llegar).
      const conflicto = cause instanceof ApiError && cause.status === 409;
      void alerta.mostrar({
        tipo: conflicto ? 'advertencia' : 'error',
        titulo: 'No se pudo actualizar la reserva',
        mensaje: (cause as Error).message,
      });
      if (conflicto) void cargar(true);
    } finally {
      setProcesando(false);
    }
  };

  const placaNoCoincide = () =>
    void alerta.mostrar({
      tipo: 'advertencia',
      titulo: 'La placa no coincide',
      mensaje:
        'No confirmes la llegada. Habla con el conductor y atiende el caso según las normas de operación. Si el vehículo de la reserva no se presenta, puedes cancelar la reserva para liberar el cupo.',
      textoBoton: 'Entendido',
    });
  return {
    item, loading, refreshing, procesando, error, cargar,
    reserva, conductor, vehiculo, placa, titulo, extra, llegada, enCamino, vencida, parqueada, duracion, ejecutar, placaNoCoincide
  }
}