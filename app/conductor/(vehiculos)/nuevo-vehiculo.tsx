import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert, ScrollView, Text, View } from "react-native";

import { addVehiculo } from "../../../src/api/vehiculos";
import Button from "../../../src/components/Button";
import Field from "../../../src/components/Field";
import FormError from "../../../src/components/FormError";
import NoSessionState from "../../../src/components/NoSessionState";
import { useSession } from "../../../src/session/context";

type NuevoVehiculoForm = {
  placa: string;
  marca: string;
  color: string;
};

export default function NuevoVehiculo() {
  const { user } = useSession();

  const { control, handleSubmit, setError, formState } =
    useForm<NuevoVehiculoForm>({
      defaultValues: {
        placa: "",
        marca: "",
        color: "",
      },
    });

  if (!user) {
    return <NoSessionState />;
  }

  const guardar = async (form: NuevoVehiculoForm) => {
    try {
      await addVehiculo(user.documento_identidad, {
        placa: form.placa,
        marca: form.marca,
        color: form.color,
      });

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
      setError("root", { message: (cause as Error).message });
    }
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-neutral-900">
            Nuevo vehículo
          </Text>
          <Text className="text-neutral-500">
            Registra un vehículo a tu nombre para usarlo en las zonas azules.
          </Text>
        </View>

        <View className="gap-3 rounded-2xl bg-white p-5">
          <Field
            control={control}
            name="placa"
            label="Placa"
            placeholder="ABC123"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={10}
            rules={{
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
            }}
          />

          <Field
            control={control}
            name="marca"
            label="Marca"
            placeholder="Chevrolet, Mazda, Renault…"
            autoCapitalize="words"
            rules={{
              required: "La marca es obligatoria",
              minLength: { value: 2, message: "Escribe al menos 2 caracteres" },
            }}
          />

          <Field
            control={control}
            name="color"
            label="Color"
            placeholder="Blanco, negro, gris…"
            autoCapitalize="words"
            rules={{
              required: "El color es obligatorio",
              minLength: { value: 3, message: "Escribe al menos 3 caracteres" },
            }}
          />
        </View>

        <FormError message={formState.errors.root?.message} />

        <Button
          text={formState.isSubmitting ? "Guardando…" : "Registrar vehículo"}
          onPress={handleSubmit(guardar)}
          disabled={formState.isSubmitting}
        />
      </ScrollView>
    </View>
  );
}
