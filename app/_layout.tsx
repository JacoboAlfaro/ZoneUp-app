import { Map, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';

require('../global.css');

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Map size={32} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <User size={32} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
