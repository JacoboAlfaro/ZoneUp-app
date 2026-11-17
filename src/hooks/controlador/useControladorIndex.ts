import { getResumenReservas } from "@/src/api";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { usePermisoAvisos } from "@/src/notificaciones/usePermisoAvisos";
import { useSession } from "@/src/session/context";
import { ResumenReservas } from "@/src/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

/**
 * Panel del encargado: cuántas reservas hay en cada estado. Los cuenta el
 * servidor; antes se descargaban todas las reservas de todas las zonas.
 * Al abrirlo se ofrece activar los avisos de reservas nuevas (una vez por sesión).
 */
export function useControladorIndex() {
  const { user, signOut } = useSession();
  const alerta = useAlerta();
  const { pedirEnContexto } = usePermisoAvisos();
  const [resumen, setResumen] = useState<ResumenReservas | null>(null);

  // El encargado tiene 15 minutos para aceptar cada reserva: aquí se explica por qué
  // conviene recibir avisos. Si ya dio permiso, no pregunta nada.
  useFocusEffect(
    useCallback(() => {
      void pedirEnContexto('encargado');
    }, [pedirEnContexto]),
  );

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
