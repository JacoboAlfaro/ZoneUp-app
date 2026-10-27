import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import type { ComponentType } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { color, glass } from "@/src/theme";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";

export type Icon = ComponentType<{
  size?: number;
  color?: string;
}>;

interface Props {
  text: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  /** Cerrar sesión, eliminar, rechazar: vidrio rojo suave. */
  destructive?: boolean;
  icon?: Icon;
  iconColor?: string;
  iconSize?: number;
  className?: string;
}

const RADIO = 16;

/** El botón controla color y radio; de className solo deja margen/flex. */
function clasesDeLayout(className?: string) {
  if (!className) return "";
  return className
    .split(/\s+/)
    .filter((token) => token && !/^(bg-|border-|rounded-)/.test(token))
    .join(" ");
}

export default function Button({
  text,
  onPress,
  disabled,
  secondary,
  destructive,
  icon: Icon,
  iconColor,
  iconSize = 20,
  className,
}: Props) {
  const estilo = destructive
    ? {
        tint: glass.red,
        oscuro: false,
        texto: "text-zu-red-text",
        icono: color.redText,
      }
    : secondary
      ? {
          tint: glass.sky,
          oscuro: false,
          texto: "text-zu-navy",
          icono: color.navy,
        }
      : {
          tint: glass.navy,
          oscuro: true,
          texto: "text-zu-white",
          icono: color.white,
        };
  const colorIcono = iconColor ?? estilo.icono;
  const liquid =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  const contenido = (
    <View className="flex-row items-center justify-center gap-2 px-4 py-4">
      {Icon ? <Icon size={iconSize} color={colorIcono} /> : null}
      <Text className={`font-semibold ${estilo.texto}`}>{text}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={text}
      className={`overflow-hidden rounded-2xl active:scale-95 disabled:opacity-50 ${clasesDeLayout(className)}`}
    >
      {liquid ? (
        <GlassView
          isInteractive
          colorScheme="light"
          glassEffectStyle="clear"
          tintColor={estilo.tint}
          style={{ borderRadius: RADIO, overflow: "hidden" }}
        >
          {contenido}
        </GlassView>
      ) : (
        // Android (y iOS < 26): vidrio por capas con el mismo tinte.
        <VidrioRespaldo
          tint={estilo.tint}
          radius={RADIO}
          oscuro={estilo.oscuro}
        >
          {contenido}
        </VidrioRespaldo>
      )}
    </Pressable>
  );
}
