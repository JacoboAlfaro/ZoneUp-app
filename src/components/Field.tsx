import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { glass } from "@/src/theme";
import { VidrioRespaldo } from "./glass/VidrioRespaldo";

// Hereda todas las props de TextInput (keyboardType, secureTextEntry...) y
// añade las del formulario.
type Props<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  /** Nombre del campo dentro del formulario. TypeScript solo acepta los que existen. */
  name: Path<T>;
  label: string;
  /** Reglas de validación: required, minLength, pattern, validate... */
  rules?: RegisterOptions<T, Path<T>>;
};

const RADIO = 16;

/** El vidrio pone color y radio; de className solo queda padding/alto. */
function clasesDeInput(className?: string) {
  if (!className) return "";
  return className
    .split(/\s+/)
    .filter((token) => token && !/^(bg-|border-|rounded-)/.test(token))
    .join(" ");
}

function bordeEstado(error: boolean, focused: boolean) {
  if (error) return "border-red-400";
  if (focused) return "border-zu-sky-top";
  return "border-zu-border";
}

export default function Field<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  className,
  secureTextEntry,
  onFocus: inputOnFocus,
  onBlur: inputOnBlur,
  ...input
}: Props<T>) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const liquid =
    Platform.OS === "ios" &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        const propsCampo = {
          value,
          onChangeText: onChange,
          onFocus: (
            event: Parameters<NonNullable<TextInputProps["onFocus"]>>[0],
          ) => {
            setFocused(true);
            inputOnFocus?.(event);
          },
          onBlur: (
            event: Parameters<NonNullable<TextInputProps["onBlur"]>>[0],
          ) => {
            setFocused(false);
            onBlur();
            inputOnBlur?.(event);
          },
          autoCapitalize: "none" as const,
          placeholderTextColor: "#6B8698",
          selectionColor: "#6BB8E8",
          underlineColorAndroid: "transparent",
          secureTextEntry: secureTextEntry && !passwordVisible,
          ...input,
        };
        const ojo = secureTextEntry ? (
          <Pressable
            className="absolute bottom-0 right-0 top-0 justify-center px-4"
            onPress={() => setPasswordVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {passwordVisible ? (
              <EyeOff size={20} color="#6B8698" />
            ) : (
              <Eye size={20} color="#6B8698" />
            )}
          </Pressable>
        ) : null;
        const campo = (
          <TextInput
            className={`px-4 py-3 text-base text-zu-navy ${secureTextEntry ? "pr-12" : ""} ${clasesDeInput(className)}`}
            style={{ backgroundColor: "transparent" }}
            {...propsCampo}
          />
        );

        return (
          <View className="gap-1.5">
            <Text className="ml-1 text-xs font-medium text-zu-slate">
              {label}
            </Text>

            {liquid ? (
              <View
                className={`relative overflow-hidden rounded-2xl border ${
                  error
                    ? "border-red-400"
                    : focused
                      ? "border-zu-sky-top"
                      : "border-zu-navy/45"
                }`}
              >
                <GlassView
                  isInteractive
                  colorScheme="light"
                  glassEffectStyle="clear"
                  tintColor={focused ? glass.sky : glass.white}
                  style={{ borderRadius: RADIO, overflow: "hidden" }}
                >
                  {campo}
                </GlassView>
                {ojo}
              </View>
            ) : (
              // Android (y iOS < 26): el mismo vidrio por capas que tarjetas y
              // botones. El borde de afuera indica el estado (normal, foco, error).
              <View
                className={`relative overflow-hidden rounded-2xl border ${bordeEstado(!!error, focused)}`}
              >
                <VidrioRespaldo
                  tint={focused ? glass.sky : glass.white}
                  radius={RADIO}
                  intensity={30}
                >
                  {campo}
                </VidrioRespaldo>
                {ojo}
              </View>
            )}

            {/* El mensaje sale de las `rules`: quien define la regla define el texto. */}
            {!!error && (
              <Text className="ml-1 text-xs text-red-600">{error.message}</Text>
            )}
          </View>
        );
      }}
    />
  );
}
