import ConductorDrawer from '@/src/components/screens/conductor/drawer';
import { Drawer } from 'expo-router/drawer';

export default function ConductorLayout() {
  return (
    <Drawer
      drawerContent={(props) => <ConductorDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEnabled: false,
      }}>
      {/* Desde expo-router 58, un Drawer solo muestra las pantallas que declara. */}
      <Drawer.Screen name="(panel)" />
    </Drawer>
  );
}
