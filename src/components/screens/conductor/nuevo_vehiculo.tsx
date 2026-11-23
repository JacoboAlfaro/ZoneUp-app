import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";

import { FondoPantalla } from "@/src/components/glass/FondoPantalla";
import { useNuevoVehiculo } from "@/src/hooks/vehiculos/useNuevoVehiculo";
import Button from "../../Button";
import Field from "../../Field";
import { GlassCard } from "../../GlassCard";
import NoSessionState from "../../NoSessionState";

const NuevoVehiculoScreen = function () {
  const { user, control, reglas, guardando, registrar } = useNuevoVehiculo();

  if (!user) {
    return <NoSessionState />;
  }

  return (
    <FondoPantalla>
      {/* "padding" en las dos plataformas: en Android (edge-to-edge) la
          ventana no se encoge con el teclado, así que hay que dejarle espacio. */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={100}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 p-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-2">
            <Text className="text-3xl font-bold text-zu-navy">
              Nuevo vehículo
            </Text>
            <Text className="text-zu-slate">
              Registra un vehículo a tu nombre para usarlo en las zonas azules.
            </Text>
          </View>

          <GlassCard className="gap-3 p-5">
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
          </GlassCard>

          <Button
            text={guardando ? "Guardando…" : "Registrar vehículo"}
            onPress={registrar}
            disabled={guardando}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </FondoPantalla>
  );
};

export default NuevoVehiculoScreen;
