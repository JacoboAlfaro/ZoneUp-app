import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useNuevoVehiculo } from "@/src/hooks/vehiculos/useNuevoVehiculo";
import Button from "../../Button";
import Field from "../../Field";
import FormError from "../../FormError";
import NoSessionState from "../../NoSessionState";

const NuevoVehiculoScreen = function () {
  const { user, control, reglas, errorGeneral, guardando, registrar } =
    useNuevoVehiculo();

  if (!user) {
    return <NoSessionState />;
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
            rules={reglas.placa}
          />

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

        <Button
          text={guardando ? "Guardando…" : "Registrar vehículo"}
          onPress={registrar}
          disabled={guardando}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default NuevoVehiculoScreen;
