import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import type { Pagina } from '@/src/types';

/** Cuánto se espera después de la última tecla antes de buscar en el servidor. */
const ESPERA_BUSQUEDA_MS = 500;
const POR_PAGINA = 20;

export type CargarPagina<T> = (consulta: {
  q: string;
  limit: number;
  offset: number;
  signal: AbortSignal;
}) => Promise<Pagina<T>>;

/**
 * Un listado que busca y pagina en el servidor, para que la app nunca descargue
 * la tabla completa ni filtre en el teléfono.
 *
 * - La búsqueda se manda cuando el usuario deja de escribir (500 ms sin
 *   teclear), no en cada letra. `buscarAhora` (tecla "buscar" del teclado) y
 *   `limpiarBusqueda` no esperan.
 * - Si llega una búsqueda nueva, la anterior se cancela: una respuesta lenta
 *   nunca pisa a la más reciente.
 * - Trae 20 elementos; `cargarMas` pide los siguientes.
 * - Se recarga al volver a la pantalla, como el resto de listados.
 *
 * @param cargar Pide una página. Si depende de filtros (estado, orden...),
 *   memorízala con `useCallback`: al cambiar, el listado vuelve a la primera página.
 * @param clave Identifica cada elemento, para no repetirlo si la lista se
 *   corrió entre página y página.
 */
export function useListaPaginada<T>(cargar: CargarPagina<T>, clave: (item: T) => string | number) {
  const alerta = useAlerta();
  const [busqueda, setBusqueda] = useState('');
  /** Lo que de verdad se buscó en el servidor (el texto ya "asentado"). */
  const [termino, setTermino] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const peticion = useRef<AbortController | null>(null);

  // Espera a que el usuario termine de escribir antes de buscar.
  useEffect(() => {
    const limpio = busqueda.trim();
    if (limpio === termino) return;
    const espera = setTimeout(() => setTermino(limpio), ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(espera);
  }, [busqueda, termino]);

  /** Empieza una petición y cancela la que estuviera en curso. */
  const nuevaPeticion = () => {
    peticion.current?.abort();
    const controller = new AbortController();
    peticion.current = controller;
    return controller;
  };

  const recargar = useCallback(
    async (refresh = false) => {
      const controller = nuevaPeticion();
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const pagina = await cargar({
          q: termino,
          limit: POR_PAGINA,
          offset: 0,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setItems(pagina.items);
        setTotal(pagina.total);
      } catch (cause) {
        if (!controller.signal.aborted) setError((cause as Error).message);
      } finally {
        if (peticion.current === controller) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [cargar, termino],
  );

  // Al enfocar la pantalla, y cada vez que cambia lo buscado o los filtros.
  useFocusEffect(
    useCallback(() => {
      void recargar();
      return () => peticion.current?.abort();
    }, [recargar]),
  );

  const hayMas = items.length < total;

  const cargarMas = async () => {
    if (!hayMas || loading || cargandoMas) return;
    const controller = nuevaPeticion();
    setCargandoMas(true);

    try {
      const pagina = await cargar({
        q: termino,
        limit: POR_PAGINA,
        offset: items.length,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setItems((actuales) => {
        const vistos = new Set(actuales.map(clave));
        return [...actuales, ...pagina.items.filter((item) => !vistos.has(clave(item)))];
      });
      setTotal(pagina.total);
    } catch (cause) {
      if (!controller.signal.aborted) {
        void alerta.mostrar({
          tipo: 'error',
          titulo: 'No se pudieron cargar más resultados',
          mensaje: (cause as Error).message,
        });
      }
    } finally {
      if (peticion.current === controller) setCargandoMas(false);
    }
  };

  /** Busca ya, sin esperar (tecla "buscar" del teclado). */
  const buscarAhora = () => setTermino(busqueda.trim());

  /** Borra la búsqueda y vuelve al listado completo sin esperar. */
  const limpiarBusqueda = () => {
    setBusqueda('');
    setTermino('');
  };

  return {
    items,
    /** Para reflejar un cambio hecho desde la pantalla sin recargar todo. */
    setItems,
    total,
    setTotal,
    busqueda,
    setBusqueda,
    termino,
    buscarAhora,
    limpiarBusqueda,
    loading,
    refreshing,
    cargandoMas,
    error,
    recargar,
    cargarMas,
    hayMas,
  };
}
