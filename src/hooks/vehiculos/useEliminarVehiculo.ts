import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { deleteVehiculo } from "@/src/api/vehiculos";
import { useSession } from "@/src/session/context";
import type { Vehiculo } from "@/src/types";

/**
 * Lógica para eliminar un vehículo: pide confirmación, llama al servidor,
 * maneja el estado "eliminando" y el error, y al terminar vuelve a la lista.
 *
 * @param vehiculo El vehículo a eliminar (null mientras carga).
 */
export function useEliminarVehiculo(vehiculo: Vehiculo | null) {
  const { user } = useSession();
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const eliminar = () => {
    if (!user || !vehiculo || eliminando) return;

    const documento = user.documento_identidad;
    const placa = vehiculo.placa;

    Alert.alert(
      "Eliminar vehículo",
      `La placa ${placa} se eliminará de forma permanente.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setEliminando(true);
            setErrorEliminar(null);
            try {
              await deleteVehiculo(documento, placa);
              Alert.alert(
                "Vehículo eliminado",
                "El vehículo fue eliminado correctamente.",
                [
                  {
                    text: "Aceptar",
                    onPress: () => router.replace("/conductor/(vehiculos)"),
                  },
                ],
              );
            } catch (cause) {
              setErrorEliminar((cause as Error).message);
              setEliminando(false);
            }
          },
        },
      ],
    );
  };

  return { eliminando, errorEliminar, eliminar };
}
