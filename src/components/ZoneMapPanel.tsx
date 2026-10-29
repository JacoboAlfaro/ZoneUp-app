import { TARIFA_HORA } from "@/src/api/reservas";
import { detalleZona, formatPesos, tituloZona } from "@/src/formato";
import { color, glass } from "@/src/theme";
import type { ZonaAzul } from "@/src/types";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { X } from "lucide-react-native";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "./Button";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";

const RADIO = 28;

export function ZonaMapPanel({
  zona,
  onCerrar,
  onReservar,
}: {
  zona: ZonaAzul;
  onCerrar: () => void;
  onReservar: () => void;
}) {
  const insets = useSafeAreaInsets();
  const titulo = tituloZona(zona.indicaciones, zona.id);
  const extra = detalleZona(zona.indicaciones);
  const cupos = Math.max(0, zona.capacidad);
  const sinCupo = cupos <= 0;
  const liquid =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  const contenido = (
    <View className="px-5 pb-5 pt-3">
      <View className="mb-3 h-1 w-10 self-center rounded-full bg-zu-border" />

      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
            Zonas azules
          </Text>
          <Text className="mt-1 text-2xl font-bold text-zu-navy">{titulo}</Text>
        </View>
        <Pressable
          onPress={onCerrar}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          className="h-9 w-9 items-center justify-center rounded-full bg-zu-sky-fade/80"
        >
          <X size={18} color={color.navy} />
        </Pressable>
      </View>

      {extra ? (
        <Text className="mt-3 text-sm leading-5 text-zu-slate">{extra}</Text>
      ) : null}

      <Text className="mt-4 text-sm text-zu-slate">
        Plazas disponibles{" "}
        <Text
          className={`font-bold ${sinCupo ? "text-zu-slate" : "text-emerald-600"}`}
        >
          {cupos} cupos
        </Text>
      </Text>
      <Text className="mt-1 text-sm text-zu-slate">
        Tarifa {formatPesos(TARIFA_HORA)} / hora
      </Text>

      <Button
        className="mt-5"
        text="Reservar"
        onPress={onReservar}
        disabled={sinCupo}
      />
    </View>
  );

  // Panel flotante de vidrio sobre el mapa, separado de los bordes.
  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-30 px-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      {liquid ? (
        <GlassView
          colorScheme="light"
          glassEffectStyle="regular"
          tintColor={glass.panel}
          style={{ borderRadius: RADIO, overflow: "hidden" }}
        >
          {contenido}
        </GlassView>
      ) : (
        // Android (y iOS < 26): vidrio por capas. Más opaco que una tarjeta
        // para que el texto se lea bien sobre el mapa, claro u oscuro.
        <VidrioRespaldo tint={glass.panel} radius={RADIO}>
          {contenido}
        </VidrioRespaldo>
      )}
    </View>
  );
}
