import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{headerTitleStyle: {fontWeight: '600'}}}>
      <Stack.Screen name="index" options={{title: 'Panel Conductor'}}/>
      <Stack.Screen name="(usuarios)/index" options={{title: 'Mi perfil' }}/>
      <Stack.Screen name="(usuarios)/edition" options={{title: 'Editar perfil'}}/>
   </Stack>
  );
}
