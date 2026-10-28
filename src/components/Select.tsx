import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Platform, Pressable, Text, View } from 'react-native';

import { color, glass } from '@/src/theme';

const RADIO = 999;

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: readonly string[];
};

export default function Select<T extends FieldValues>({
  control,
  name,
  label,
  options,
}: Props<T>) {
  const liquid =
    Platform.OS === 'ios' &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View className="gap-1.5">
          <Text className="font-semibold text-zu-navy">
            {label}
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
              const active = option === value;
              const texto = option.replace(/_/g, ' ');

              const boton = (
                <Pressable
                  onPress={() => onChange(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className="rounded-full border px-4 py-2"
                  style={{
                    backgroundColor: active ? color.navy : color.white,
                    borderColor: active ? color.navy : color.border,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: active ? color.white : color.slate,
                    }}
                  >
                    {option.replace(/_/g, ' ')}
                  </Text>
                </Pressable>
              );

              if (!liquid) {
                return <View key={option}>{boton}</View>;
              }

              return (
                <View
                  key={option}
                  className="overflow-hidden rounded-full border border-zu-border"
                >
                  <GlassView
                    isInteractive
                    colorScheme="light"
                    glassEffectStyle={active ? 'regular' : 'clear'}
                    tintColor={
                      active ? glass.sky : glass.white
                    }
                    style={{
                      borderRadius: RADIO,
                      overflow: 'hidden',
                    }}
                  >
                    {boton}
                  </GlassView>
                </View>
              );
            })}
          </View>
        </View>
      )}
    />
  );
}
