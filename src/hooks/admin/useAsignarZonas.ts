import { asignarZona, desasignarZona, listZonasDeControlador } from '@/src/api';
import { useAlerta } from '@/src/components/alerta/AlertaProvider';
import type { ZonaDeControlador } from '@/src/types';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';

import { type CargarPagina, useListaPaginada } from '../useListaPaginada';

/**
 * Lógica de "Zonas asignadas" (admin): lista todas las zonas, primero las del
 * controlador, y asigna o quita cada una. La búsqueda y la paginación las hace
 * el servidor (ver `useListaPaginada`).
 */
export function useAsignarZonas() {
  const { id, nombre } = useLocalSearchParams<{ id: string; nombre?: string }>();
  const navigation = useNavigation();
  const alerta = useAlerta();
  const [asignadas, setAsignadas] = useState<number | null>(null);
  /** Id de la zona que se está guardando, para bloquear la lista mientras tanto. */
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargar = useCallback<CargarPagina<ZonaDeControlador>>(
    async (consulta) => {
      const pagina = await listZonasDeControlador(id, consulta);
      setAsignadas(pagina.total_asignadas);
      return pagina;
    },
    [id],
  );
  const lista = useListaPaginada(cargar, (zona) => zona.id);
  const { setItems } = lista;

  useLayoutEffect(() => {
    if (nombre) navigation.setOptions({ title: `Zonas de ${nombre}` });
  }, [navigation, nombre]);

  const alternar = async (zona: ZonaDeControlador) => {
    if (procesando !== null) return;
    setProcesando(zona.id);

    try {
      if (zona.asignada) await desasignarZona(zona.id, id);
      else await asignarZona(zona.id, id);

      // La zona se queda en su lugar hasta recargar: así no salta bajo el dedo.
      setItems((actuales) =>
        actuales.map((actual) =>
          actual.id === zona.id ? { ...actual, asignada: !zona.asignada } : actual,
        ),
      );
      setAsignadas((total) => (total === null ? null : total + (zona.asignada ? -1 : 1)));
    } catch (cause) {
      void alerta.mostrar({
        tipo: 'error',
        titulo: zona.asignada ? 'No se pudo quitar la zona' : 'No se pudo asignar la zona',
        mensaje: (cause as Error).message,
      });
    } finally {
      setProcesando(null);
    }
  };

  return { ...lista, asignadas, procesando, alternar };
}
