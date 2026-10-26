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
        overlayColor: 'rgba(15, 40, 70, 0.18)',
        drawerStyle: { width: 300 },
      }}>
      <Drawer.Screen name="(panel)" options={{ headerShown: false }} />
    </Drawer>
  );
}
