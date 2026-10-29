import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Platform, Pressable, Text, View } from "react-native";

import { color, glass } from "@/src/theme";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";

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
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View className="gap-1.5">
          <Text className="font-semibold text-zu-navy">{label}</Text>

          <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
              const active = option === value;
              const texto = option.replace(/_/g, " ");

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
                    {texto}
                  </Text>
                </Pressable>
              );

              if (!liquid) {
                // Android (y iOS < 26): cápsula de vidrio. La elegida es vidrio
                // azul oscuro con texto blanco; las demás, vidrio claro.
                return (
                  <View
                    key={option}
                    className="overflow-hidden rounded-full border"
                    style={{ borderColor: active ? color.navy : color.border }}
                  >
                    <VidrioRespaldo
                      tint={active ? glass.navy : glass.white}
                      radius={RADIO}
                      oscuro={active}
                    >
                      <Pressable
                        onPress={() => onChange(option)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className="px-4 py-2"
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: active ? color.white : color.slate }}
                        >
                          {texto}
                        </Text>
                      </Pressable>
                    </VidrioRespaldo>
                  </View>
                );
              }

              return (
                <View
                  key={option}
                  className="overflow-hidden rounded-full border border-zu-border"
                >
                  <GlassView
                    isInteractive
                    colorScheme="light"
                    glassEffectStyle={active ? "regular" : "clear"}
                    tintColor={active ? glass.sky : glass.white}
                    style={{
                      borderRadius: RADIO,
                      overflow: "hidden",
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
