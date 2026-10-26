import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

const LIQUID = isLiquidGlassAvailable();
const NAVY = 'rgba(30, 58, 95, 0.82)';

export type Icon = ComponentType<{ size?: number; color?: string }>;

export function LiquidButton({
  text,
  onPress,
  icon: Icon,
  tint,
  destructive,
}: {
  text: string;
  onPress: () => void;
  icon?: Icon;
  tint?: string;
  destructive?: boolean;
}) {
  const color = destructive ? '#B91C1C' : '#FFFFFF';
  const fondo = destructive ? 'rgba(254, 226, 226, 0.85)' : tint ?? NAVY;
  const tintVidrio = destructive ? 'rgba(248, 113, 113, 0.4)' : tint ?? NAVY;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      className="active:scale-95">
      {LIQUID ? (
        <GlassView
          isInteractive
          glassEffectStyle="clear"
          tintColor={tintVidrio}
          style={{ borderRadius: 16 }}>
          <View className="flex-row items-center justify-center gap-2 px-4 py-4">
            {Icon ? <Icon size={20} color={color} /> : null}
            <Text className={`font-semibold ${destructive ? 'text-red-700' : 'text-white'}`}>
              {text}
            </Text>
          </View>
        </GlassView>
      ) : (
        <View
          className={`flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-4 ${
            destructive ? 'border-red-200' : 'border-white/25'
          }`}
          style={{ backgroundColor: fondo }}>
          {Icon ? <Icon size={20} color={color} /> : null}
          <Text className={`font-semibold ${destructive ? 'text-red-700' : 'text-white'}`}>
            {text}
          </Text>
        </View>
      )}
    </Pressable>
  );
}