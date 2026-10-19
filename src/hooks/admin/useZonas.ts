import { getResumenZonas, listZonas } from "@/src/api";
import { ResumenZonas } from "@/src/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useListaPaginada } from "../useListaPaginada";

/**
 * Título y detalle derivados de `indicaciones`, igual que en la parte visual
 * de referencia: la primera línea es el título, el resto es el detalle.
 */
function tituloDesdeIndicaciones(indicaciones: string | null, id: number): string {
    const linea = indicaciones?.trim().split('\n')[0]?.trim();
    return linea && linea.length > 0 ? linea : `Zona #${id}`;
  }
  
  function detalleDesdeIndicaciones(indicaciones: string | null): string | null {
    const lineas = (indicaciones ?? '')
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean);
    if (lineas.length <= 1) return null;
    return lineas.slice(1).join('\n');
  }
  
/**
 * Lógica de "Zonas azules" (admin). La búsqueda y la paginación las hace el
 * servidor (ver `useListaPaginada`), y los totales de las tarjetas también.
 */
export function useZonas() {
  const lista = useListaPaginada(listZonas, (zona) => zona.id);
  const [resumen, setResumen] = useState<ResumenZonas | null>(null);

  const cargarResumen = useCallback(() => {
    getResumenZonas()
      .then(setResumen)
      .catch(() => setResumen(null));
  }, []);

  useFocusEffect(cargarResumen);

  /** Deslizar hacia abajo: primera página y totales de nuevo. */
  const refrescar = () => {
    void lista.recargar(true);
    cargarResumen();
  };

  return { ...lista, resumen, refrescar, tituloDesdeIndicaciones, detalleDesdeIndicaciones };
}
