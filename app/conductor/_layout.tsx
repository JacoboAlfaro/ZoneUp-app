import { Drawer } from 'expo-router/drawer';

export default function ConductorLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEnabled: false,
      }}
    />
  );
}
