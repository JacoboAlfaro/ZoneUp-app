import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
} from "react-native";

import { FondoPantalla } from "@/src/components/glass/FondoPantalla";
import { useDetalleVehiculo } from "@/src/hooks/vehiculos/useDetalleVehiculo";
import { useEditarVehiculo } from "@/src/hooks/vehiculos/useEditarVehiculo";
import { useEliminarVehiculo } from "@/src/hooks/vehiculos/useEliminarVehiculo";
import Button from "../../Button";
import Field from "../../Field";
import { GlassCard } from "../../GlassCard";
import NoSessionState from "../../NoSessionState";

const DetalleVehiculoScreen = function () {
  const { user, vehiculo, setVehiculo, loading, cargaError } =
    useDetalleVehiculo();
  const { control, reglas, guardando, guardarCambios } = useEditarVehiculo(
    vehiculo,
    setVehiculo,
  );
  const { eliminando, eliminar } = useEliminarVehiculo(vehiculo);

  if (!user) {
    return <NoSessionState />;
  }

  if (loading) {
    return (
      <FondoPantalla style={{ alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </FondoPantalla>
    );
  }

  if (!vehiculo) {
    return (
      <FondoPantalla style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        <Text className="text-base text-red-700">
          {cargaError ?? "No se encontró el vehículo."}
        </Text>
      </FondoPantalla>
    );
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
          <GlassCard className="gap-1 p-5">
            <Text className="text-sm font-semibold text-zu-slate">Placa</Text>
            <Text className="text-2xl font-bold text-zu-navy">
              {vehiculo.placa}
            </Text>
            <Text className="mt-1 text-xs text-zu-slate">
              La placa no se puede editar; para cambiarla, elimina el vehículo y
              registra uno nuevo.
            </Text>
          </GlassCard>

          <GlassCard className="gap-3 p-5">
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
            text={guardando ? "Guardando…" : "Guardar cambios"}
            onPress={guardarCambios}
            disabled={guardando || eliminando}
          />

          <Button
            text={eliminando ? "Eliminando…" : "Eliminar vehículo"}
            onPress={() => void eliminar()}
            disabled={guardando || eliminando}
            destructive
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </FondoPantalla>
  );
};

export default DetalleVehiculoScreen;
