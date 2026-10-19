import { getResumenReservas } from "@/src/api";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { useSession } from "@/src/session/context";
import { ResumenReservas } from "@/src/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

/**
 * Panel del encargado: cuántas reservas hay en cada estado. Los cuenta el
 * servidor; antes se descargaban todas las reservas de todas las zonas.
 */
export function useControladorIndex() {
  const { user, signOut } = useSession();
  const alerta = useAlerta();
  const [resumen, setResumen] = useState<ResumenReservas | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      getResumenReservas()
        .then((conteos) => {
          if (active) setResumen(conteos);
        })
        .catch((cause) => {
          if (!active) return;
          void alerta.mostrar({
            tipo: 'error',
            titulo: 'No se pudieron cargar las reservas',
            mensaje: (cause as Error).message,
          });
        });

      return () => {
        active = false;
      };
    }, [alerta]),
  );

  return { user, resumen, porRevisar: resumen?.pendiente ?? '…', signOut };
}
