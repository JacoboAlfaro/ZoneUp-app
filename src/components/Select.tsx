/**
 * Selector de una opción entre varias, en forma de botones.
 *
 * Se usa para categoría y prioridad. Es la misma idea que `Field`, pero en vez
 * de un input de texto muestra una fila de opciones donde solo una queda
 * marcada. Evita depender de un componente de lista desplegable externo.
 */

import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  /** Valores posibles. Se muestran cambiando los "_" por espacios. */
  options: readonly string[];
};

export default function Select<T extends FieldValues>({
  control,
  name,
  label,
  options,
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View className="gap-1.5">
          <Text className="font-semibold text-neutral-700">{label}</Text>
          {/* flex-wrap: si no caben en una línea, siguen en la siguiente. */}
          <View className="flex-row flex-wrap gap-2">
            {options.map((option) => {
              const active = option === value;
              return (
                <Pressable
                  key={option}
                  onPress={() => onChange(option)}
                  className={`rounded-full border px-4 py-2 active:opacity-70 ${
                    active ? 'border-blue-600 bg-blue-600' : 'border-neutral-300 bg-white'
                  }`}>
                  <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-neutral-600'}`}>
                    {option.replace(/_/g, ' ')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    />
  );
}
