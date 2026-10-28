import { listTodasLasZonas } from '@/src/api/zonas';
import { useSession } from '@/src/session/context';
import type { ZonaAzul } from '@/src/types';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useState } from 'react';

export function useConductorIndex() {
  const { user } = useSession();
  // El index está DENTRO del Stack; openDrawer vive en el layout padre.
  const navigation = useNavigation('/conductor');
  const [zonas, setZonas] = useState<ZonaAzul[]>([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaAzul | null>(null);

  const abrirDrawer = () => {
    (navigation as { openDrawer?: () => void }).openDrawer?.();
  };

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void listTodasLasZonas(controller.signal)
        .then((items) => {
          setZonas(items);
          setZonaSeleccionada((actual) =>
            actual ? items.find((zona) => zona.id === actual.id) ?? null : null,
          );
        })
        .catch(() => {
          if (!controller.signal.aborted) setZonas([]);
        });
      return () => controller.abort();
    }, []),
  );

  return {
    user,
    abrirDrawer,
    zonas,
    zonaSeleccionada,
    seleccionarZona: setZonaSeleccionada,
    cerrarZona: () => setZonaSeleccionada(null),
  };
}
