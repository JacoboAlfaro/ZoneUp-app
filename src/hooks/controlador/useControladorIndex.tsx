import { listReservasDeZonas, listZonas } from "@/src/api";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { useSession } from "@/src/session/context";
import { ReservaDeZona } from "@/src/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useControladorIndex() {
  const { user, signOut } = useSession();
  const alerta = useAlerta();
  const [items, setItems] = useState<ReservaDeZona[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      // No hay lista global de reservas: se consultan todas las zonas.
      listZonas()
        .then((zonas) => listReservasDeZonas(zonas.map((zona) => zona.id)))
        .then((reservas) => {
          if (active) setItems(reservas);
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

  const contar = (estado: ReservaDeZona['reserva']['estado']) =>
    items ? items.filter((item) => item.reserva.estado === estado).length : '…';
  const porRevisar = contar('pendiente');

  return {user, items, porRevisar, contar, signOut }
}
