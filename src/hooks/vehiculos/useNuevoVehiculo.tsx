import { router } from "expo-router";
import { useForm, type RegisterOptions } from "react-hook-form";
import { Alert } from "react-native";

import { addVehiculo } from "@/src/api/vehiculos";
import { useSession } from "@/src/session/context";

/** Los datos que captura el formulario de nuevo vehículo. */
export type NuevoVehiculoForm = {
  placa: string;
  marca: string;
  color: string;
};

/** Validaciones de cada campo. <Field /> muestra el mensaje debajo del input. */
const reglas: Record<
  keyof NuevoVehiculoForm,
  RegisterOptions<NuevoVehiculoForm>
> = {
  placa: {
    required: "La placa es obligatoria",
    minLength: {
      value: 5,
      message: "La placa debe tener al menos 5 caracteres",
    },
    maxLength: {
      value: 10,
      message: "La placa no puede superar 10 caracteres",
    },
    pattern: {
      value: /^[A-Za-z0-9]+$/,
      message: "Solo letras y números, sin espacios",
    },
  },
  marca: {
    required: "La marca es obligatoria",
    minLength: { value: 2, message: "Escribe al menos 2 caracteres" },
  },
  color: {
    required: "El color es obligatorio",
    minLength: { value: 3, message: "Escribe al menos 3 caracteres" },
  },
};

/**
 * Lógica de la pantalla "Nuevo vehículo": formulario, validaciones y registro
 * del vehículo a nombre del conductor en sesión.
 */
export function useNuevoVehiculo() {
  const { user } = useSession();

  const { control, handleSubmit, setError, formState } =
    useForm<NuevoVehiculoForm>({
      defaultValues: { placa: "", marca: "", color: "" },
    });

  const guardar = async (form: NuevoVehiculoForm) => {
    if (!user) return;

    try {
      await addVehiculo(user.documento_identidad, form);

      Alert.alert(
        "Vehículo registrado",
        "El vehículo fue agregado correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/conductor/(vehiculos)"),
          },
        ],
      );
    } catch (cause) {
      // `root` es el error del formulario completo (placa repetida, servidor caído...).
      setError("root", { message: (cause as Error).message });
    }
  };

  return {
    user,
    control,
    reglas,
    errorGeneral: formState.errors.root?.message,
    guardando: formState.isSubmitting,
    registrar: handleSubmit(guardar),
  };
}
