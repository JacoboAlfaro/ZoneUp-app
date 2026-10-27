import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Platform, Pressable, Text, View } from "react-native";

import { color, glass } from "@/src/theme";
import { type Icon } from "./Button";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";

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
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  const interior = (
    <View className="flex-row items-center px-2 py-1">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-zu-white/20">
        {Icon ? <Icon size={20} color={color.white} /> : null}
      </View>
      <Text className="ml-2 mr-3 text-base font-semibold text-zu-white">
        {text}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      className="active:scale-95"
    >
      {liquid ? (
        <GlassView
          isInteractive
          glassEffectStyle="clear"
          tintColor={glass.navy}
          style={{ borderRadius: 999 }}
        >
          {interior}
        </GlassView>
      ) : (
        // Android: cápsula de vidrio oscuro. Sobre el mapa no hay desenfoque
        // (Google Maps no se puede capturar), así que el efecto lo dan el
        // tinte, el reflejo y el borde luminoso.
        <VidrioRespaldo tint={glass.navy} radius={999} oscuro>
          {interior}
        </VidrioRespaldo>
      )}
    </Pressable>
  );
}
