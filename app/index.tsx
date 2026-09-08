import { Text, View } from 'react-native';
import Button from '../src/components/Button';
import { useSession } from '../src/session/context';

export default function Home() {
  const { user, signOut } = useSession();

  return (
    <View className="flex-1 justify-center gap-8 bg-neutral-50 p-6">
      <View className="gap-2">
        <Text className="text-3xl font-bold text-neutral-900">
          Bienvenido, {user?.name}
        </Text>
        <Text className="text-neutral-500">{user?.email}</Text>
      </View>

      <Button text="Cerrar sesión" onPress={signOut} secondary />
    </View>
  );
}
