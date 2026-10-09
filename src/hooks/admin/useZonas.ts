import { listZonas } from "@/src/api";
import { ZonaAzul } from "@/src/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

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
  
  function normalizarBusqueda(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

export function useZonas() {
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

  useFocusEffect(
    useCallback(() => {
      void cargarZonas();
    }, [cargarZonas]),
  );

  const cuposDisponibles = zonas.reduce((total, zona) => total + zona.capacidad, 0);
  const zonasFiltradas = useMemo(() => {
    const termino = normalizarBusqueda(busqueda.trim());
    if (!termino) return zonas;

    return zonas.filter((zona) =>
      [`Zona ${zona.id}`, `#${zona.id}`, zona.indicaciones ?? ''].some((value) =>
        normalizarBusqueda(value).includes(termino),
      ),
    );
  }, [busqueda, zonas]);

  return { zonas, busqueda, setBusqueda, loading, refreshing, error, cuposDisponibles, zonasFiltradas, cargarZonas, tituloDesdeIndicaciones, detalleDesdeIndicaciones }
}
