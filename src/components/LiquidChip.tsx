import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Platform, Pressable, Text, View } from 'react-native';

import { color, glass } from '@/src/theme';
import { type Icon } from './Button';

export function LiquidChip({
  text,
  onPress,
  icon: Icon,
}: {
  text: string;
  onPress: () => void;
  icon?: Icon;
}) {
  const liquid =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  const interior = (
    <View className="flex-row items-center px-2 py-1">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-zu-white/20">
        {Icon ? <Icon size={20} color={color.white} /> : null}
      </View>
      <Text className="ml-2 mr-3 text-base font-semibold text-zu-white">{text}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      className="active:scale-95">
      {liquid ? (
        <GlassView
          isInteractive
          glassEffectStyle="clear"
          tintColor={glass.navy}
          style={{ borderRadius: 999 }}>
          {interior}
        </GlassView>
      ) : (
        <View className="rounded-full border border-zu-white/25 bg-zu-navy/82">
          {interior}
        </View>
      )}
    </Pressable>
  );
}
