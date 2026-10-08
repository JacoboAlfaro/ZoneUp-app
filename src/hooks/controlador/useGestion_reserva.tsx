import { listReservasDeZonas, listZonas } from "@/src/api";
import { AccionReserva, ejecutarAccionReserva } from "@/src/components/reservas/accionesReserva";
import { tituloZona } from "@/src/formato";
import { EstadoReserva, ReservaDeZona, ZonaAzul } from "@/src/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

type Filtro = 'todas' | EstadoReserva;

const filtros: { valor: Filtro; label: string }[] = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'pendiente', label: 'Pendientes' },
  { valor: 'activa', label: 'Activas' },
  { valor: 'completada', label: 'Completadas' },
  { valor: 'cancelada', label: 'Canceladas' },
];

/** Primero lo que requiere atención: pendientes, luego activas, luego el resto. */
const prioridad: Record<EstadoReserva, number> = {
  pendiente: 0,
  activa: 1,
  completada: 2,
  cancelada: 2,
};

function normalizarBusqueda(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function useGestion_reserva() {
  const [items, setItems] = useState<ReservaDeZona[]>([]);
  const [zonas, setZonas] = useState<Map<number, ZonaAzul>>(new Map());
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Id de la reserva que se está actualizando, para bloquear sus botones. */
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargarReservas = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // No hay lista global de reservas: se consultan todas las zonas.
      const todasLasZonas = await listZonas();
      setItems(await listReservasDeZonas(todasLasZonas.map((zona) => zona.id)));
      setZonas(new Map(todasLasZonas.map((zona) => [zona.id, zona])));
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Al volver del detalle el estado pudo cambiar: se recarga al enfocar.
  useFocusEffect(
    useCallback(() => {
      void cargarReservas();
    }, [cargarReservas]),
  );

  const tituloDe = useCallback(
    (item: ReservaDeZona) =>
      tituloZona(
        item.reserva.id_zona === null ? null : zonas.get(item.reserva.id_zona)?.indicaciones,
        item.reserva.id_zona,
      ),
    [zonas],
  );

  const contar = (valor: Filtro) =>
    valor === 'todas' ? items.length : items.filter((item) => item.reserva.estado === valor).length;

  const itemsFiltrados = useMemo(() => {
    const termino = normalizarBusqueda(busqueda.trim());

    return items
      .filter((item) => filtro === 'todas' || item.reserva.estado === filtro)
      .filter(
        (item) =>
          !termino ||
          [
            item.reserva.id_vehiculo ?? '',
            item.conductor?.name ?? '',
            item.conductor?.documento_identidad ?? '',
            tituloDe(item),
            `#${item.reserva.id}`,
          ].some((value) => normalizarBusqueda(value).includes(termino)),
      )
      .sort(
        (a, b) =>
          prioridad[a.reserva.estado] - prioridad[b.reserva.estado] || b.reserva.id - a.reserva.id,
      );
  }, [busqueda, filtro, items, tituloDe]);

  const ejecutar = async (accion: AccionReserva, item: ReservaDeZona) => {
    if (procesando !== null) return;
    setProcesando(item.reserva.id);

    try {
      const actualizada = await ejecutarAccionReserva(accion, item.reserva);
      if (actualizada) {
        setItems((actuales) =>
          actuales.map((actual) =>
            actual.reserva.id === actualizada.id ? { ...actual, reserva: actualizada } : actual,
          ),
        );
      }
    } catch (cause) {
      Alert.alert('No se pudo actualizar la reserva', (cause as Error).message);
    } finally {
      setProcesando(null);
    }
  };

  const abrirDetalle = (item: ReservaDeZona) =>
    router.push({
      pathname: '/controlador/(reservas)/reserva/[id]',
      params: { id: String(item.reserva.id), idZona: String(item.reserva.id_zona ?? '') },
    });
  return { items, busqueda, setBusqueda, filtro, setFiltro, loading, refreshing, error, procesando, itemsFiltrados, contar, ejecutar, abrirDetalle, cargarReservas, filtros, tituloDe }
}
