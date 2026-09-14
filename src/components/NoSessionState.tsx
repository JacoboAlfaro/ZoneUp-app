import { Text, View } from 'react-native';

export default function NoSessionState() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50 p-6">
      <Text className="text-base text-red-600">No hay un usuario iniciado.</Text>
    </View>
  );
}
