import { useEffect } from "react";
import { useForm, type RegisterOptions } from "react-hook-form";
import { Alert } from "react-native";

import { updateVehiculo } from "@/src/api/vehiculos";
import { useSession } from "@/src/session/context";
import type { Vehiculo } from "@/src/types";

/** Los datos editables de un vehículo (la placa no se puede cambiar). */
export type EditarVehiculoForm = {
  marca: string;
  color: string;
};

/** Validaciones de cada campo. <Field /> muestra el mensaje debajo del input. */
const reglas: Record<
  keyof EditarVehiculoForm,
  RegisterOptions<EditarVehiculoForm>
> = {
  marca: {
    required: "La marca es obligatoria",
    minLength: { value: 2, message: "Escribe al menos 2 caracteres" },
  },
  color: {
    required: "El color es obligatorio",
    minLength: { value: 3, message: "Escribe al menos 3 caracteres" },
  },
};

function vehiculoAForm(vehiculo: Vehiculo): EditarVehiculoForm {
  return {
    marca: vehiculo.marca ?? "",
    color: vehiculo.color ?? "",
  };
}

/**
 * Lógica del formulario de edición de un vehículo: llena los campos con los
 * datos actuales, valida y guarda los cambios en el servidor.
 *
 * @param vehiculo El vehículo que se está editando (null mientras carga).
 * @param alActualizar Se llama con el vehículo actualizado tras guardar.
 */
export function useEditarVehiculo(
  vehiculo: Vehiculo | null,
  alActualizar: (vehiculo: Vehiculo) => void,
) {
  const { user } = useSession();

  const { control, handleSubmit, reset, setError, formState } =
    useForm<EditarVehiculoForm>({
      defaultValues: { marca: "", color: "" },
    });

  // Cuando el vehículo llega (o se actualiza), se copian sus datos al formulario.
  useEffect(() => {
    if (vehiculo) reset(vehiculoAForm(vehiculo));
  }, [vehiculo, reset]);

  const guardar = async (form: EditarVehiculoForm) => {
    if (!user || !vehiculo) return;

    try {
      const actualizado = await updateVehiculo(
        user.documento_identidad,
        vehiculo.placa,
        form,
      );
      alActualizar(actualizado);
      Alert.alert(
        "Vehículo actualizado",
        "Los cambios fueron guardados correctamente.",
      );
    } catch (cause) {
      setError("root", { message: (cause as Error).message });
    }
  };

  return {
    control,
    reglas,
    errorGeneral: formState.errors.root?.message,
    guardando: formState.isSubmitting,
    guardarCambios: handleSubmit(guardar),
  };
}
