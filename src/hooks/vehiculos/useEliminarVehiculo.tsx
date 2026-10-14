import { router } from "expo-router";
import { useState } from "react";

import { deleteVehiculo } from "@/src/api/vehiculos";
import { useAlerta } from "@/src/components/alerta/AlertaProvider";
import { useSession } from "@/src/session/context";
import type { Vehiculo } from "@/src/types";

/**
 * Lógica para eliminar un vehículo: pide confirmación, llama al servidor,
 * maneja el estado "eliminando", avisa si algo falla y al terminar vuelve a la lista.
 *
 * @param vehiculo El vehículo a eliminar (null mientras carga).
 */
export function useEliminarVehiculo(vehiculo: Vehiculo | null) {
  const { user } = useSession();
  const alerta = useAlerta();
  const [eliminando, setEliminando] = useState(false);

  const eliminar = async () => {
    if (!user || !vehiculo || eliminando) return;

    const documento = user.documento_identidad;
    const placa = vehiculo.placa;

    const confirmado = await alerta.confirmar({
      titulo: "Eliminar vehículo",
      mensaje: `La placa ${placa} se eliminará de forma permanente.`,
      textoConfirmar: "Eliminar",
      destructiva: true,
    });
    if (!confirmado) return;

    setEliminando(true);
    try {
      await deleteVehiculo(documento, placa);
      await alerta.mostrar({
        tipo: "exito",
        titulo: "Vehículo eliminado",
        mensaje: "El vehículo fue eliminado correctamente.",
      });
      router.replace("/conductor/(vehiculos)");
    } catch (cause) {
      void alerta.mostrar({
        tipo: "error",
        titulo: "No se pudo eliminar el vehículo",
        mensaje: (cause as Error).message,
      });
      setEliminando(false);
    }
  };

  return { eliminando, eliminar };
}
