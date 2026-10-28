/**
 * Fondo de colores sobre el que se apoyan los componentes de vidrio.
 *
 * En iOS 26 el vidrio (GlassView) refracta lo que tenga detrás por sí solo.
 * En Android no: `BlurView` de expo-blur solo puede desenfocar el contenido
 * que esté dentro de un `BlurTargetView`. Por eso este fondo:
 *
 *  1. Dibuja los círculos de color dentro de un `BlurTargetView`.
 *  2. Comparte la referencia de ese `BlurTargetView` por contexto, para que
 *     cualquier `GlassCard`, `Button`, etc. que esté encima pueda desenfocarlo
 *     con `useBlurTarget()`.
 *
 * Importante: los componentes de vidrio van como `children` (encima del
 * fondo), nunca dentro del `BlurTargetView`, o se desenfocarían a sí mismos.
 */

import { BlurTargetView } from "expo-blur";
import {
  createContext,
  useContext,
  useRef,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from "react";
import { StyleSheet, View } from "react-native";

import { color } from "@/src/theme";

/** Referencia nativa del `BlurTargetView` (el tipo lo define expo-blur). */
type BlurTarget = RefObject<ComponentRef<typeof BlurTargetView> | null>;

const BlurTargetContext = createContext<BlurTarget | null>(null);

/** Referencia del fondo a desenfocar, o `null` si la pantalla no usa `FondoGlass`. */
export function useBlurTarget() {
  return useContext(BlurTargetContext);
}

export function FondoGlass({ children }: { children: ReactNode }) {
  const target = useRef<ComponentRef<typeof BlurTargetView>>(null);

  return (
    <BlurTargetContext.Provider value={target}>
      <View className="flex-1">
        <BlurTargetView
          ref={target}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: color.skyBottom },
          ]}
        >
          <View className="absolute -right-16 top-8 h-72 w-72 rounded-full bg-zu-sky-mid" />
          <View className="absolute -left-20 bottom-4 h-80 w-80 rounded-full bg-zu-sky-fade" />
          <View className="absolute bottom-32 right-10 h-40 w-40 rounded-full bg-zu-accent/50" />
        </BlurTargetView>

        {children}
      </View>
    </BlurTargetContext.Provider>
  );
}
