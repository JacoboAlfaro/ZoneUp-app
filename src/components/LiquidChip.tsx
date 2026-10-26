import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Pressable, Text, View } from 'react-native';
import { Icon } from './LiquidButton';

const LIQUID = isLiquidGlassAvailable();
const NAVY = 'rgba(30, 58, 95, 0.82)';

export function LiquidChip({
    text,
    onPress,
    icon: Icon,
  }: {
    text: string;
    onPress: () => void;
    icon?: Icon;
  }) {
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
            tintColor={NAVY}
            style={{ borderRadius: 999 }}>
            <View className="flex-row items-center px-2 py-1">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                {Icon ? <Icon size={20} color="#FFFFFF" /> : null}
              </View>
              <Text className="ml-2 mr-3 text-base font-semibold text-white">{text}</Text>
            </View>
          </GlassView>
        ) : (
          <View
            className="flex-row items-center rounded-full border border-white/25 px-2 py-1"
            style={{ backgroundColor: NAVY }}>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
              {Icon ? <Icon size={20} color="#FFFFFF" /> : null}
            </View>
            <Text className="ml-2 mr-3 text-base font-semibold text-white">{text}</Text>
          </View>
        )}
      </Pressable>
    );
  }