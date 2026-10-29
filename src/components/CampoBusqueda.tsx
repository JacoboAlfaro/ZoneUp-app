import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Search, X } from "lucide-react-native";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { glass } from "@/src/theme";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";

interface Props {
  value: string;
  onChangeText: (texto: string) => void;
  onBuscar: () => void;
  onLimpiar: () => void;
  placeholder: string;
  buscando?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  className?: string;
}

const RADIO = 16;

export default function CampoBusqueda({
  value,
  onChangeText,
  onBuscar,
  onLimpiar,
  placeholder,
  buscando,
  autoCapitalize = "none",
  className,
}: Props) {
  const liquid =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  const contenido = (
    <View className="flex-row items-center px-4">
      <Search size={20} color="#6B8698" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onBuscar}
        placeholder={placeholder}
        placeholderTextColor="#6B8698"
        selectionColor="#6BB8E8"
        underlineColorAndroid="transparent"
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 py-3.5 pl-3 text-base text-zu-navy"
      />

      {buscando ? (
        <ActivityIndicator size="small" color="#6B8698" className="mr-2" />
      ) : null}

      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          hitSlop={10}
          onPress={onLimpiar}
          className="p-1"
        >
          <X size={19} color="#6B8698" />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View className={className}>
      {liquid ? (
        <View className="overflow-hidden rounded-2xl border border-zu-border">
          <GlassView
            isInteractive
            colorScheme="light"
            glassEffectStyle="clear"
            tintColor={glass.white}
            style={{
              borderRadius: RADIO,
              overflow: "hidden",
            }}
          >
            <View style={{ backgroundColor: "transparent" }}>{contenido}</View>
          </GlassView>
        </View>
      ) : (
        // Android (y iOS < 26): vidrio por capas, igual que tarjetas e inputs.
        <View className="overflow-hidden rounded-2xl border border-zu-border">
          <VidrioRespaldo tint={glass.white} radius={RADIO} intensity={30}>
            {contenido}
          </VidrioRespaldo>
        </View>
      )}
    </View>
  );
}
