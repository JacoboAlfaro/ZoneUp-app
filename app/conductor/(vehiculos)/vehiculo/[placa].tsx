import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import {
    deleteVehiculo,
    getVehiculos,
    updateVehiculo,
} from "../../../../src/api/vehiculos";
import Button from "../../../../src/components/Button";
import Field from "../../../../src/components/Field";
import FormError from "../../../../src/components/FormError";
import NoSessionState from "../../../../src/components/NoSessionState";
import { useSession } from "../../../../src/session/context";
import type { Vehiculo } from "../../../../src/types";

type VehiculoForm = {
  marca: string;
  color: string;
};

function vehiculoAForm(vehiculo: Vehiculo): VehiculoForm {
  return {
    marca: vehiculo.marca ?? "",
    color: vehiculo.color ?? "",
  };
}

export default function DetalleVehiculo() {
  const { placa } = useLocalSearchParams<{ placa: string }>();
  const navigation = useNavigation();
  const { user } = useSession();

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [cargaError, setCargaError] = useState<string | null>(null);

  const { control, handleSubmit, reset, setError, formState } =
    useForm<VehiculoForm>({
      defaultValues: { marca: "", color: "" },
    });

  useEffect(() => {
    if (!user || !placa) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setCargaError(null);

    getVehiculos(user.documento_identidad)
      .then((vehiculos) => {
        const encontrado = vehiculos.find((v) => v.placa === placa);
        if (!encontrado) {
          setCargaError("No se encontró el vehículo.");
          return;
        }
        setVehiculo(encontrado);
        reset(vehiculoAForm(encontrado));
      })
      .catch((cause) => setCargaError((cause as Error).message))
      .finally(() => setLoading(false));
  }, [placa, user, reset]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: vehiculo ? vehiculo.placa : "Detalle del vehículo",
    });
  }, [navigation, vehiculo]);

  if (!user) {
    return <NoSessionState />;
  }

  const guardar = async (form: VehiculoForm) => {
    if (!vehiculo || !placa || formState.isSubmitting) return;

    try {
      const actualizado = await updateVehiculo(
        user.documento_identidad,
        placa,
        {
          marca: form.marca,
          color: form.color,
        },
      );
      setVehiculo(actualizado);
      reset(vehiculoAForm(actualizado));
      Alert.alert(
        "Vehículo actualizado",
        "Los cambios fueron guardados correctamente.",
      );
    } catch (cause) {
      setError("root", { message: (cause as Error).message });
    }
  };

  const eliminar = () => {
    if (!vehiculo || !placa || deleting) return;

    Alert.alert(
      "Eliminar vehículo",
      `La placa ${vehiculo.placa} se eliminará de forma permanente.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteVehiculo(user.documento_identidad, placa);
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
              setError("root", { message: (cause as Error).message });
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!vehiculo) {
    return (
      <View className="flex-1 bg-neutral-50 px-6 pt-6">
        <Text className="text-base text-red-700">
          {cargaError ?? "No se encontró el vehículo."}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1 rounded-2xl bg-white p-5">
          <Text className="text-sm font-semibold text-neutral-500">Placa</Text>
          <Text className="text-2xl font-bold text-neutral-900">
            {vehiculo.placa}
          </Text>
          <Text className="mt-1 text-xs text-neutral-400">
            La placa no se puede editar; para cambiarla, elimina el vehículo y
            registra uno nuevo.
          </Text>
        </View>

        <View className="gap-3 rounded-2xl bg-white p-5">
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
        <FormError message={cargaError ?? undefined} />

        <Button
          text={formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
          onPress={handleSubmit(guardar)}
          disabled={formState.isSubmitting || deleting}
        />

        <Button
          text={deleting ? "Eliminando…" : "Eliminar vehículo"}
          onPress={eliminar}
          disabled={formState.isSubmitting || deleting}
          secondary
          className="border-red-300 bg-red-50"
        />
      </ScrollView>
    </View>
  );
}
