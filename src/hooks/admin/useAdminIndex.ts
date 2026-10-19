import { getResumenUsuarios, getResumenZonas } from "@/src/api";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { useSession } from "@/src/session/context";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useAdminIndex() {
  const { user, signOut } = useSession();
  const alerta = useAlerta();
  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);
  const [totalZonas, setTotalZonas] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      // Los totales los cuenta el servidor: no se descargan las listas completas.
      // Se espera a las dos para avisar una sola vez si alguna falla.
      void Promise.allSettled([getResumenUsuarios(), getResumenZonas()]).then(([users, zonas]) => {
        if (!active) return;
        setTotalUsuarios(users.status === 'fulfilled' ? users.value.total : null);
        setTotalZonas(zonas.status === 'fulfilled' ? zonas.value.total : null);

        const fallo = users.status === 'rejected' ? users : zonas.status === 'rejected' ? zonas : null;
        if (fallo) {
          void alerta.mostrar({
            tipo: 'error',
            titulo: 'No se pudieron cargar las estadísticas',
            mensaje: (fallo.reason as Error).message,
          });
        }
      });

      return () => {
        active = false;
      };
    }, [alerta]),
  );
  return { user, signOut, totalUsuarios, totalZonas }
}
