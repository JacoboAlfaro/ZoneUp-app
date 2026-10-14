import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ReservaDeZona, ZonaAzul } from '@/src/types';
import { estaEnCamino, getZona, horasEntre, listReservasZona } from '@/src/api';
import { detalleZona, tituloZona } from '@/src/formato';
import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import { AccionReserva, ejecutarAccionReserva } from '@/src/components/reservas/accionesReserva';

export default function useDetalle_reserva() {
  const { id, idZona } = useLocalSearchParams<{ id: string; idZona: string }>();
  const navigation = useNavigation();
  const alerta = useAlerta();
  const [item, setItem] = useState<ReservaDeZona | null>(null);
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [procesando, setProcesando] = useState(false);
  /** Error al cargar la reserva. Los demás errores se muestran en una alerta. */
  const [error, setError] = useState<string | null>(null);

  const idNumerico = id ? Number(id) : NaN;
  const idZonaNumerico = idZona ? Number(idZona) : NaN;

  // El controlador no tiene GET /reservas/:id: la reserva se busca en las de su zona.
  const cargar = useCallback(
    async (refresh = false) => {
      if (!Number.isInteger(idNumerico) || !Number.isInteger(idZonaNumerico)) {
        setError('Identificador de reserva inválido.');
        setLoading(false);
        return;
      }

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const [reservasZona, zonaActual] = await Promise.all([
          listReservasZona(idZonaNumerico),
          // La zona solo aporta nombre e indicaciones: si falla, la reserva se muestra igual.
          getZona(idZonaNumerico).catch(() => null),
        ]);
        const encontrada = reservasZona.find((fila) => fila.reserva.id === idNumerico);
        setItem(encontrada ?? null);
        setZona(zonaActual);
        if (!encontrada) setError('No se encontró la reserva.');
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
    [idNumerico, idZonaNumerico, alerta],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: item ? `Reserva #${item.reserva.id}` : 'Detalle de la reserva',
    });
  }, [navigation, item]);


  if(!item){
    return {item: null, reserva: null, loading, error}
  }
  const { reserva, conductor, vehiculo } = item;
  const placa = reserva.id_vehiculo ?? '—';
  const titulo = tituloZona(zona?.indicaciones, reserva.id_zona);
  const extra = detalleZona(zona?.indicaciones);
  const porAtender = reserva.estado === 'pendiente' || reserva.estado === 'activa';
  const enCamino = estaEnCamino(reserva);
  const duracion = reserva.fecha_fin
    ? horasEntre(reserva.fecha_real_inicio, new Date(reserva.fecha_fin))
    : null;

  const ejecutar = async (accion: AccionReserva) => {
    if (procesando) return;
    setProcesando(true);

    try {
      const actualizada = await ejecutarAccionReserva(accion, reserva, alerta);
      if (actualizada) setItem({ ...item, reserva: actualizada });
    } catch (cause) {
      void alerta.mostrar({
        tipo: 'error',
        titulo: 'No se pudo actualizar la reserva',
        mensaje: (cause as Error).message,
      });
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
    item, setZona, loading, refreshing, procesando, error, cargar,
    reserva, conductor, vehiculo, placa, titulo, extra, porAtender, enCamino, duracion, ejecutar, placaNoCoincide
  }
}