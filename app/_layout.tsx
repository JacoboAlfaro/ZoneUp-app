/**
 * Layout raíz: envuelve TODA la app.
 *
 * Hace cuatro cosas:
 *  1. Pone el proveedor de sesión, para que cualquier pantalla pueda saber
 *     quién entró.
 *  2. Pone el proveedor de alertas, para que cualquier pantalla pueda abrir
 *     una alerta emergente con `useAlerta()` y se vea encima de todo.
 *  3. Declara la navegación y decide, con `Stack.Protected`, qué pantallas
 *     existen según haya sesión o no. Sin sesión, las rutas privadas ni
 *     siquiera están registradas: no hay forma de llegar a ellas.
 *  4. Prepara los avisos push: crea los canales de Android al arrancar y, con
 *     sesión, registra el teléfono y abre la reserva de un aviso tocado.
 */

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import '../global.css';
import { AlertaProvider } from '../src/components/alerta/AlertaProvider';
import { crearCanales } from '../src/notificaciones/dispositivo';
import { useAvisosPush } from '../src/notificaciones/useAvisosPush';
import { SessionProvider, useSession } from '../src/session/context';

export default function RootLayout() {
  // Los canales tienen que existir antes de que llegue un aviso (Android no muestra
  // los de un canal desconocido)
  useEffect(() => {
    crearCanales().catch(() => {});
  }, []);

  return (
    <AlertaProvider>
      <SessionProvider>
        <Navigator />
      </SessionProvider>
    </AlertaProvider>
  );
}

function Navigator() {
  const { user } = useSession();
  useAvisosPush(user);

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontWeight: '600' },
        headerTransparent: false,
        headerStyle: { backgroundColor: '#FFFFFF' },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Protected
        guard={!!user && user.tipo_usuario !== 'admin' && user.tipo_usuario !== 'controlador'}>
        <Stack.Screen name="conductor" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={user?.tipo_usuario === 'admin'}>
        <Stack.Screen name="admin" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Encargados de zona azul */}
      <Stack.Protected guard={user?.tipo_usuario === 'controlador'}>
        <Stack.Screen name="controlador" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Sin sesión */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
