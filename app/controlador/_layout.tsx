import { Stack } from 'expo-router';

import { headerGlassScreenOptions } from '@/src/components/HeaderGlassBackground';

export default function ControladorLayout() {
  return (
    <Stack
      screenOptions={headerGlassScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Panel del encargado' }} />
      <Stack.Screen name="(reservas)/reservas" options={{ title: 'Gestión de reservas' }} />
      <Stack.Screen name="(reservas)/reserva/[id]" options={{ title: 'Detalle de la reserva' }} />
    </Stack>
  );
}
