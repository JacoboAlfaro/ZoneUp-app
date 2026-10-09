import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";

import { getVehiculos } from "@/src/api/vehiculos";
import { useSession } from "@/src/session/context";
import type { Vehiculo } from "@/src/types";

/**
 * Lógica de carga de la pantalla "Detalle del vehículo": lee la placa de la
 * ruta, busca el vehículo entre los del conductor en sesión y pone la placa
 * como título del encabezado.
 */
export function useDetalleVehiculo() {
  const { placa } = useLocalSearchParams<{ placa: string }>();
  const navigation = useNavigation();
  const { user } = useSession();

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cargaError, setCargaError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !placa) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setCargaError(null);

    // No hay endpoint para un solo vehículo: se busca en la lista del conductor.
    getVehiculos(user.documento_identidad)
      .then((vehiculos) => {
        const encontrado = vehiculos.find((v) => v.placa === placa);
        if (!encontrado) {
          setCargaError("No se encontró el vehículo.");
          return;
        }
        setVehiculo(encontrado);
      })
      .catch((cause) => setCargaError((cause as Error).message))
      .finally(() => setLoading(false));
  }, [placa, user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: vehiculo ? vehiculo.placa : "Detalle del vehículo",
    });
  }, [navigation, vehiculo]);

  return { user, vehiculo, setVehiculo, loading, cargaError };
}
