/**
 * Layout raíz: envuelve TODA la app.
 *
 * Hace dos cosas:
 *  1. Pone el proveedor de sesión, para que cualquier pantalla pueda saber
 *     quién entró.
 *  2. Declara la navegación y decide, con `Stack.Protected`, qué pantallas
 *     existen según haya sesión o no. Sin sesión, las rutas privadas ni
 *     siquiera están registradas: no hay forma de llegar a ellas.
 */

import { Stack } from 'expo-router';
import '../global.css';
import { SessionProvider, useSession } from '../src/session/context';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Navigator />
    </SessionProvider>
  );
}

function Navigator() {
  const { user } = useSession();

  return (
    <Stack screenOptions={{ headerTitleStyle: { fontWeight: '600' } }}>
      <Stack.Protected guard={!!user && user.tipo_usuario !== 'admin'}>
        <Stack.Screen name="index" options={{ title: 'ZoneUp' }} />
      </Stack.Protected>

      <Stack.Protected guard={user?.tipo_usuario === 'admin'}>
        <Stack.Screen name="admin" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Sin sesión */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
