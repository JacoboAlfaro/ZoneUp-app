import { buscarReservas, getResumenReservas } from "@/src/api";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { AccionReserva, ejecutarAccionReserva } from "@/src/components/reservas/accionesReserva";
import { tituloZona } from "@/src/formato";
import { EstadoReserva, ReservaDeZona, ResumenReservas } from "@/src/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { type CargarPagina, useListaPaginada } from "../useListaPaginada";

type Filtro = 'todas' | EstadoReserva;

const filtros: { valor: Filtro; label: string }[] = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'pendiente', label: 'Pendientes' },
  { valor: 'activa', label: 'Activas' },
  { valor: 'completada', label: 'Completadas' },
  { valor: 'cancelada', label: 'Canceladas' },
];

/** El nombre de la zona viene con cada reserva: ya no hace falta descargar todas las zonas. */
const tituloDe = (item: ReservaDeZona) =>
  tituloZona(item.zona?.indicaciones, item.reserva.id_zona);

/**
 * Lógica de "Gestión de reservas" del encargado. El servidor busca, filtra por
 * estado, ordena (primero lo que necesita atención) y pagina: antes se pedían
 * las reservas zona por zona y se filtraban en el teléfono.
 */
export function useGestion_reserva() {
  const alerta = useAlerta();
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [resumen, setResumen] = useState<ResumenReservas | null>(null);
  /** Id de la reserva que se está actualizando, para bloquear sus botones. */
  const [procesando, setProcesando] = useState<number | null>(null);

  // Cambiar el filtro vuelve a pedir la primera página al servidor.
  const cargar = useCallback<CargarPagina<ReservaDeZona>>(
    (consulta) => buscarReservas({ ...consulta, estado: filtro === 'todas' ? undefined : filtro }),
    [filtro],
  );
  const lista = useListaPaginada(cargar, (item) => item.reserva.id);

  /** Los números de los filtros: cuántas reservas hay en cada estado. */
  const cargarResumen = useCallback(() => {
    getResumenReservas()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, []);

  useFocusEffect(cargarResumen);

  const contar = (valor: Filtro) =>
    resumen ? (valor === 'todas' ? resumen.total : resumen[valor]) : '…';

  /** Deslizar hacia abajo: primera página y conteos de nuevo. */
  const refrescar = () => {
    void lista.recargar(true);
    cargarResumen();
  };

  const ejecutar = async (accion: AccionReserva, item: ReservaDeZona) => {
    if (procesando !== null) return;
    setProcesando(item.reserva.id);

    try {
      const actualizada = await ejecutarAccionReserva(accion, item.reserva, alerta);
      if (actualizada) {
        // Si ya no cumple el filtro (p. ej. se aceptó estando en "Pendientes"), sale de la lista.
        const sigueEnFiltro = filtro === 'todas' || actualizada.estado === filtro;
        lista.setItems((actuales) =>
          sigueEnFiltro
            ? actuales.map((actual) =>
                actual.reserva.id === actualizada.id ? { ...actual, reserva: actualizada } : actual,
              )
            : actuales.filter((actual) => actual.reserva.id !== actualizada.id),
        );
        if (!sigueEnFiltro) lista.setTotal((total) => total - 1);
        cargarResumen();
      }
    } catch (cause) {
      void alerta.mostrar({
        tipo: 'error',
        titulo: 'No se pudo actualizar la reserva',
        mensaje: (cause as Error).message,
      });
    } finally {
      setProcesando(null);
    }
  };

  const abrirDetalle = (item: ReservaDeZona) =>
    router.push({
      pathname: '/controlador/(reservas)/reserva/[id]',
      params: { id: String(item.reserva.id) },
    });

  return {
    ...lista,
    filtro,
    setFiltro,
    filtros,
    contar,
    refrescar,
    procesando,
    ejecutar,
    abrirDetalle,
    tituloDe,
  };
}
