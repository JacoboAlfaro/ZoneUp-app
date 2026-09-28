import { Stack } from 'expo-router';

export default function ControladorLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: '600' } }}>
      <Stack.Screen name="index" options={{ title: 'Panel del encargado' }} />
      <Stack.Screen name="(reservas)/reservas" options={{ title: 'Gestión de reservas' }} />
      <Stack.Screen name="(reservas)/reserva/[id]" options={{ title: 'Detalle de la reserva' }} />
    </Stack>
  );
}
