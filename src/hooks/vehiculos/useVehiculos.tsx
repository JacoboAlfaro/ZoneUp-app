import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { getVehiculos } from "@/src/api/vehiculos";
import { useSession } from "@/src/session/context";
import type { Vehiculo } from "@/src/types";

/**
 * Lógica de la pantalla "Mis vehículos": trae los vehículos del conductor en
 * sesión y maneja los estados de carga, recarga (pull to refresh) y error.
 * Se vuelve a cargar cada vez que la pantalla gana el foco, para que al volver
 * de crear, editar o eliminar un vehículo la lista esté actualizada.
 */
export function useVehiculos() {
  const { user } = useSession();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarVehiculos = useCallback(
    async (refresh = false) => {
      if (!user) return;

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        setVehiculos(await getVehiculos(user.documento_identidad));
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void cargarVehiculos();
    }, [cargarVehiculos]),
  );

  return { user, vehiculos, loading, refreshing, error, cargarVehiculos };
}
