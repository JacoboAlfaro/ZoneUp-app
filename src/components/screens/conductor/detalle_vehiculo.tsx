import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useDetalleVehiculo } from "@/src/hooks/vehiculos/useDetalleVehiculo";
import { useEditarVehiculo } from "@/src/hooks/vehiculos/useEditarVehiculo";
import { deleteVehiculo } from "../../../api/vehiculos";
import Button from "../../Button";
import Field from "../../Field";
import FormError from "../../FormError";
import NoSessionState from "../../NoSessionState";

const DetalleVehiculoScreen = function () {
  const { user, vehiculo, setVehiculo, loading, cargaError } =
    useDetalleVehiculo();
  const { control, reglas, errorGeneral, guardando, guardarCambios } =
    useEditarVehiculo(vehiculo, setVehiculo);

  const [deleting, setDeleting] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  if (!user) {
    return <NoSessionState />;
  }

  const eliminar = () => {
    if (!vehiculo || deleting) return;

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
            setErrorEliminar(null);
            try {
              await deleteVehiculo(user.documento_identidad, vehiculo.placa);
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
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
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
            rules={reglas.marca}
          />

          <Field
            control={control}
            name="color"
            label="Color"
            placeholder="Blanco, negro, gris…"
            autoCapitalize="words"
            rules={reglas.color}
          />
        </View>

        <FormError message={errorGeneral} />
        <FormError message={errorEliminar ?? undefined} />
        <FormError message={cargaError ?? undefined} />

        <Button
          text={guardando ? "Guardando…" : "Guardar cambios"}
          onPress={guardarCambios}
          disabled={guardando || deleting}
        />

        <Button
          text={deleting ? "Eliminando…" : "Eliminar vehículo"}
          onPress={eliminar}
          disabled={guardando || deleting}
          secondary
          className="border-red-300 bg-red-50"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DetalleVehiculoScreen;
