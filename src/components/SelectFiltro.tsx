import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export type OpcionFiltro<T extends string> = { valor: T; label: string };

interface Props<T extends string> {
  valor: T;
  opciones: readonly OpcionFiltro<T>[];
  onChange: (valor: T) => void;
  etiqueta?: string;
  className?: string;
}

/**
 * Select de listado: muestra el valor actual y abre un menú para elegir.
 */
export default function SelectFiltro<T extends string>({
  valor,
  opciones,
  onChange,
  etiqueta = 'Filtrar',
  className,
}: Props<T>) {
  const [abierto, setAbierto] = useState(false);
  const actual = opciones.find((opcion) => opcion.valor === valor)?.label ?? valor;

  return (
    <View className={className}>
      <Text className="mb-1.5 font-medium text-zu-navy">{etiqueta}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${etiqueta}: ${actual}`}
        onPress={() => setAbierto(true)}
        className="flex-row items-center justify-between rounded-2xl border border-zu-border bg-zu-white/95 px-4 py-3.5">
        <Text className="flex-1 text-base text-zu-navy">{actual}</Text>
        <ChevronDown size={20} color="#1E3A5F" />
      </Pressable>

      <Modal
        visible={abierto}
        transparent
        animationType="slide"
        onRequestClose={() => setAbierto(false)}>
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            onPress={() => setAbierto(false)}
            className="absolute inset-0 bg-black/40"
          />
          <View className="rounded-t-3xl bg-zu-white px-5 pb-8 pt-4">
            <View className="mb-4 items-center">
              <View className="h-1 w-10 rounded-full bg-zu-border" />
            </View>
            <Text className="mb-3 text-lg font-bold text-zu-navy">
              {etiqueta}
            </Text>
            {opciones.map((opcion) => {
              const active = opcion.valor === valor;
              return (
                <Pressable
                  key={opcion.valor}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    onChange(opcion.valor);
                    setAbierto(false);
                  }}
                  className={`mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-3.5 active:opacity-70 ${
                    active ? 'border-zu-navy bg-zu-navy/10' : 'border-zu-border bg-zu-white'
                  }`}>
                  <Text
                    className={`text-base font-semibold ${active ? 'text-zu-navy' : 'text-zu-slate'}`}>
                    {opcion.label}
                  </Text>
                  {active ? <Check size={20} color="#1E3A5F" /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
