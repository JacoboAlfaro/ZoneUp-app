import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: "600" } }}>
      <Stack.Screen name="index" options={{ title: "Panel Conductor" }} />
      <Stack.Screen name="(usuarios)" options={{ title: "Mi perfil" }} />
      <Stack.Screen
        name="(usuarios)/edition"
        options={{ title: "Editar perfil" }}
      />
      <Stack.Screen name="(vehiculos)" options={{ title: "Mis vehículos" }} />
      <Stack.Screen
        name="(vehiculos)/nuevo-vehiculo"
        options={{ title: "Nuevo vehículo" }}
      />
      <Stack.Screen
        name="(vehiculos)/vehiculo/[placa]"
        options={{ title: "Detalle del vehículo" }}
      />
    </Stack>
  );
}
