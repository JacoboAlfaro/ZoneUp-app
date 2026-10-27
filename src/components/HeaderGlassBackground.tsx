import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Platform, StyleSheet, View } from "react-native";

import { color, glass, withAlpha } from "@/src/theme";

/** Capas del reflejo: arriba se suman todas y abajo se desvanece sin línea. */
const CAPAS_REFLEJO = 8;
/** Hasta qué altura de la barra llega el reflejo, en porcentaje. */
const ALTO_REFLEJO = 70;

export function HeaderGlassBackground() {
  const liquid =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  if (liquid) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="regular"
        tintColor={glass.skySoft}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={70}
        tint="systemThinMaterialLight"
        style={StyleSheet.absoluteFill}
      />
    );
  }

  // Android: el header no es transparente, así que no hay contenido que
  // desenfocar debajo. El vidrio se simula con capas: tinte cielo, reflejo
  // que se desvanece hacia abajo y un canto luminoso sobre el borde inferior.
  const capaReflejo = withAlpha(color.white, 0.55 / CAPAS_REFLEJO);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: withAlpha(color.skyBottom, 0.92) },
        ]}
      />

      {Array.from({ length: CAPAS_REFLEJO }, (_, i) => (
        <View
          key={i}
          style={[
            styles.reflejo,
            {
              height: `${((i + 1) * ALTO_REFLEJO) / CAPAS_REFLEJO}%` as const,
              backgroundColor: capaReflejo,
            },
          ]}
        />
      ))}

      <View
        style={[
          styles.linea,
          { bottom: 1, backgroundColor: withAlpha(color.white, 0.9) },
        ]}
      />
      <View
        style={[styles.linea, { bottom: 0, backgroundColor: glass.border }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  reflejo: { position: "absolute", top: 0, left: 0, right: 0 },
  linea: { position: "absolute", left: 0, right: 0, height: 1 },
});

export const headerGlassScreenOptions = {
  headerTransparent: false,
  headerShadowVisible: false,
  get headerTintColor() {
    return color.navy;
  },
  get headerTitleStyle() {
    return { fontWeight: "600" as const, color: color.navy };
  },
  headerStyle: { backgroundColor: "transparent" },
  headerBackground: () => <HeaderGlassBackground />,
};
