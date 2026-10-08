import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useDetalleVehiculo } from "@/src/hooks/vehiculos/useDetalleVehiculo";
import { useEditarVehiculo } from "@/src/hooks/vehiculos/useEditarVehiculo";
import { useEliminarVehiculo } from "@/src/hooks/vehiculos/useEliminarVehiculo";
import Button from "../../Button";
import Field from "../../Field";
import FormError from "../../FormError";
import NoSessionState from "../../NoSessionState";

const DetalleVehiculoScreen = function () {
  const { user, vehiculo, setVehiculo, loading, cargaError } =
    useDetalleVehiculo();
  const { control, reglas, errorGeneral, guardando, guardarCambios } =
    useEditarVehiculo(vehiculo, setVehiculo);
  const { eliminando, errorEliminar, eliminar } = useEliminarVehiculo(vehiculo);

  if (!user) {
    return <NoSessionState />;
  }

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
          disabled={guardando || eliminando}
        />

        <Button
          text={eliminando ? "Eliminando…" : "Eliminar vehículo"}
          onPress={eliminar}
          disabled={guardando || eliminando}
          secondary
          className="border-red-300 bg-red-50"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DetalleVehiculoScreen;
