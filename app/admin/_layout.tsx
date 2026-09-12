import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: '600' } }}>
      <Stack.Screen name="index" options={{ title: 'Panel administrativo' }} />
      <Stack.Screen name="(usuarios)/usuarios" options={{ title: 'Administrar usuarios' }} />
      <Stack.Screen name="(usuarios)/nuevo-usuario" options={{ title: 'Nuevo usuario' }} />
      <Stack.Screen name="(usuarios)/usuario/[email]" options={{ title: 'Detalle del usuario' }} />
    </Stack>
  );
}
