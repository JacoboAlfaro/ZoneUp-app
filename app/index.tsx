import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Button from '../src/components/Button';
import { useSession } from '../src/session/context';

/** Pantalla de inicio: quién eres y qué puedes hacer. */
export default function Home() {
  const { user, signOut } = useSession();

  return (
    <View className="flex-1 gap-6 bg-neutral-50 p-6">
      <View className="gap-1 rounded-2xl bg-white p-5">
        <Text className="text-xl font-bold text-neutral-900">Hola, {user?.name}</Text>
        <Text className="text-neutral-500">{user?.email}</Text>
        {/* El rol lo asigna el backend y define qué puede hacer cada quien (F20). */}
        <Text className="mt-2 self-start rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {user?.role}
        </Text>
      </View>

      <View className="gap-3">
        <Button text="Reportar una solicitud" onPress={() => router.push('/tickets/new')} />
        <Button text="Cerrar sesión" onPress={signOut} secondary />
      </View>
    </View>
  );
}
