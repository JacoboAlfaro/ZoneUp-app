import { glass } from "@/src/theme";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import type { ReactNode } from "react";
import { Platform, View } from "react-native";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";
const RADIO = 28;
export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const liquid =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();
  const interior = `p-6 ${className ?? ""}`;
  if (liquid) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="clear"
        tintColor={glass.skySoft}
        style={{ borderRadius: RADIO, overflow: "hidden" }}
      >
        <View className={interior}>{children}</View>
      </GlassView>
    );
  }
  // Android (y iOS < 26): vidrio esmerilado armado por capas.
  return (
    <VidrioRespaldo tint={glass.whiteSoft} radius={RADIO} intensity={40}>
      <View className={interior}>{children}</View>
    </VidrioRespaldo>
  );
}
