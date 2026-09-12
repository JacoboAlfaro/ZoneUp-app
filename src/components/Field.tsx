/**
 * Campo de texto conectado a react-hook-form.
 *
 * `Controller` es el puente entre el formulario y un input de React Native:
 * le entrega el valor actual y recibe los cambios. Gracias a eso la pantalla
 * no necesita un `useState` por cada campo.
 */

import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

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

const base =
  'rounded-2xl border bg-zu-white/95 px-4 py-3 text-base text-zu-navy';

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

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="gap-1.5">
          <Text className="ml-1 text-xs font-medium text-zu-slate">{label}</Text>

          <View className="relative">
            <TextInput
              className={`${base} ${secureTextEntry ? 'pr-12' : ''} ${
                error
                  ? 'border-red-400'
                  : focused
                    ? 'border-zu-sky-top'
                    : 'border-zu-border'
              } ${className ?? ''}`}
              value={value}
              onChangeText={onChange}
              onFocus={(event) => {
                setFocused(true);
                inputOnFocus?.(event);
              }}
              onBlur={(event) => {
                setFocused(false);
                onBlur();
                inputOnBlur?.(event);
              }}
              autoCapitalize="none"
              placeholderTextColor="#6B8698"
              selectionColor="#6BB8E8"
              underlineColorAndroid="transparent"
              secureTextEntry={secureTextEntry && !passwordVisible}
              {...input}
            />

            {secureTextEntry ? (
              <Pressable
                className="absolute bottom-0 right-0 top-0 justify-center px-4"
                onPress={() => setPasswordVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }>
                {passwordVisible ? (
                  <EyeOff size={20} color="#6B8698" />
                ) : (
                  <Eye size={20} color="#6B8698" />
                )}
              </Pressable>
            ) : null}
          </View>

          {/* El mensaje sale de las `rules`: quien define la regla define el texto. */}
          {!!error && <Text className="ml-1 text-xs text-red-600">{error.message}</Text>}
        </View>
      )}
    />
  );
}
