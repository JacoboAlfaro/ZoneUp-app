/**
 * Vidrio de respaldo para cuando no existe Liquid Glass nativo
 * (Android y iOS anterior a 26).
 *
 * Imita las capas de un vidrio esmerilado:
 *  1. Desenfoque del fondo (`BlurView`). En Android solo se puede si la
 *     pantalla está dentro de un `FondoGlass`; si no, se omite.
 *  2. Tinte translúcido con el color del componente.
 *  3. Reflejo de luz en la mitad superior.
 *  4. Borde fino y luminoso, más brillante arriba, como luz que entra
 *     por el canto del vidrio.
 *
 * No usar `elevation` ni `shadow-*` sobre este componente: en Android la
 * sombra se ve a través del fondo translúcido como una mancha gris.
 */

import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import {
    Platform,
    StyleSheet,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { color, withAlpha } from "@/src/theme";
import { useBlurTarget } from "./FondoGlass";

interface Props {
  /** Color translúcido del vidrio, normalmente uno de `glass.*`. */
  tint: string;
  radius: number;
  /** Fuerza del desenfoque, de 1 a 100. */
  intensity?: number;
  /** Para vidrio oscuro (botón azul, chip): reflejo y borde más tenues. */
  oscuro?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export function VidrioRespaldo({
  tint,
  radius,
  intensity = 45,
  oscuro = false,
  style,
  children,
}: Props) {
  const target = useBlurTarget();
  const puedeDesenfocar =
    Platform.OS === "ios" || (Platform.OS === "android" && !!target);

  const blanco = color.white;
  const reflejo = withAlpha(blanco, oscuro ? 0.08 : 0.22);
  const borde = withAlpha(blanco, oscuro ? 0.22 : 0.45);
  const bordeArriba = withAlpha(blanco, oscuro ? 0.45 : 0.9);

  return (
    <View style={[{ borderRadius: radius, overflow: "hidden" }, style]}>
      {puedeDesenfocar ? (
        <BlurView
          blurTarget={target ?? undefined}
          blurMethod="dimezisBlurViewSdk31Plus"
          blurReductionFactor={1}
          intensity={intensity}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: tint }]}
      />

      <View
        pointerEvents="none"
        style={[styles.reflejo, { backgroundColor: reflejo }]}
      />

      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: 1,
            borderColor: borde,
            borderTopColor: bordeArriba,
          },
        ]}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  reflejo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
  },
});
