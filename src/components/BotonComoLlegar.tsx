import { MapPinned } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { color } from '@/src/theme';

export function BotonComoLlegar({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Cómo llegar: abrir la ruta en el mapa"
      className="items-center active:opacity-70">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-zu-navy">
        <MapPinned size={18} color={color.white} />
      </View>
      <Text className="mt-0.5 text-[10px] font-semibold text-zu-navy">Ver ruta</Text>
    </Pressable>
  );
}