/**
 * Fondo de las pantallas internas (listas, detalles y formularios).
 *
 * Antes cada pantalla tenía un fondo plano casi blanco (#EEF8FC). En iOS 26
 * el vidrio nativo se nota igual, porque Apple le agrega brillo y sombra
 * propios, pero en Android las tarjetas de vidrio quedaban casi blancas sobre
 * casi blanco y no se distinguían.
 *
 * Este fondo dibuja los mismos círculos de color que `FondoGlass` (login y
 * registro) para que el vidrio tenga algo que dejar ver detrás.
 *
 * A diferencia de `FondoGlass`, aquí NO hay `BlurTargetView`: en listas con
 * muchas tarjetas, desenfocar cada una pondría lenta la app en Android. El
 * efecto lo dan el tinte, el reflejo y el borde de `VidrioRespaldo`.
 *
 * También aplica el área segura de abajo, para que el contenido no quede
 * debajo de la barra de navegación de Android (la app es edge-to-edge).
 */

import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { color } from "@/src/theme";

export function FondoPantalla({
  children,
  style,
  edges = ["bottom"],
}: {
  children: ReactNode;
  /** Estilo del contenedor del contenido (centrar, padding, etc.). */
  style?: StyleProp<ViewStyle>;
  /** Bordes con área segura. Por defecto solo abajo (arriba ya está el header). */
  edges?: Edge[];
}) {
  return (
    <View style={[styles.fondo, { backgroundColor: color.skyBottom }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View className="absolute -right-16 top-8 h-72 w-72 rounded-full bg-zu-sky-mid/70" />
        <View className="absolute -left-20 top-1/2 h-80 w-80 rounded-full bg-zu-sky-fade" />
        <View className="absolute bottom-24 right-6 h-40 w-40 rounded-full bg-zu-accent/40" />
      </View>

      <SafeAreaView style={[styles.fondo, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
});
