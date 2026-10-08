import { listReservasDeZonas, listZonas } from "@/src/api";
import { useSession } from "@/src/session/context";
import { ReservaDeZona } from "@/src/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useControladorIndex() {
  const { user, signOut } = useSession();
  const [items, setItems] = useState<ReservaDeZona[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setError(null);

      // No hay lista global de reservas: se consultan todas las zonas.
      listZonas()
        .then((zonas) => listReservasDeZonas(zonas.map((zona) => zona.id)))
        .then((reservas) => {
          if (active) setItems(reservas);
        })
        .catch((cause) => {
          if (active) setError((cause as Error).message);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const contar = (estado: ReservaDeZona['reserva']['estado']) =>
    items ? items.filter((item) => item.reserva.estado === estado).length : '…';
  const porRevisar = contar('pendiente');

  return {user, items, error, porRevisar, contar, signOut }
}
