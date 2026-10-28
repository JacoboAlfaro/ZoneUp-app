import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { color, glass } from '@/src/theme';

const RADIO = 16;

export type OpcionFiltro<T extends string> = {
  valor: T;
  label: string;
};

interface Props<T extends string> {
  valor: T;
  opciones: readonly OpcionFiltro<T>[];
  onChange: (valor: T) => void;
  etiqueta?: string;
  className?: string;
}

export default function SelectFiltro<T extends string>({
  valor,
  opciones,
  onChange,
  etiqueta = 'Filtrar',
  className,
}: Props<T>) {
  const [abierto, setAbierto] = useState(false);

  const liquid =
    Platform.OS === 'ios' &&
    isLiquidGlassAvailable() &&
    isGlassEffectAPIAvailable();

  const actual =
    opciones.find((opcion) => opcion.valor === valor)?.label ??
    valor;

  const selector = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${etiqueta}: ${actual}`}
      onPress={() => setAbierto(true)}
      className="flex-row items-center justify-between px-4 py-3.5"
    >
      <Text className="flex-1 text-base text-zu-navy">
        {actual}
      </Text>

      <ChevronDown size={20} color="#1E3A5F" />
    </Pressable>
  );

  return (
    <View className={className}>
      <Text className="mb-1.5 font-medium text-zu-navy">
        {etiqueta}
      </Text>

      {liquid ? (
        <View className="overflow-hidden rounded-2xl border border-zu-border">
          <GlassView
            isInteractive
            colorScheme="light"
            glassEffectStyle="clear"
            tintColor={glass.white}
            style={{
              borderRadius: RADIO,
              overflow: 'hidden',
            }}
          >
            {selector}
          </GlassView>
        </View>
      ) : (
        <View className="overflow-hidden rounded-2xl border border-zu-border bg-zu-white/95">
          {selector}
        </View>
      )}

      <Modal
        visible={abierto}
        transparent
        animationType="slide"
        onRequestClose={() => setAbierto(false)}
      >
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

              const fila = (
                <Pressable
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    onChange(opcion.valor);
                    setAbierto(false);
                  }}
                  className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
                >
                  <Text
                    className="flex-1 text-base font-semibold"
                    style={{
                      color: active ? color.navy : color.slate,
                    }}
                  >
                    {opcion.label}
                  </Text>
              
                  {active ? (
                    <Check size={20} color={color.navy} />
                  ) : null}
                </Pressable>
              );

              return liquid ? (
                <View
                  key={opcion.valor}
                  className="mb-2 overflow-hidden rounded-2xl border border-zu-border"
                >
                  <GlassView
                    isInteractive
                    colorScheme="light"
                    glassEffectStyle={active ? 'regular' : 'clear'}
                    tintColor={
                      active ? glass.sky : glass.white
                    }
                    style={{
                      borderRadius: RADIO,
                      overflow: 'hidden',
                    }}
                  >
                    {fila}
                  </GlassView>
                </View>
              ) : (
                <View key={opcion.valor}>
                  <Pressable
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      onChange(opcion.valor);
                      setAbierto(false);
                    }}
                    className={`mb-2 flex-row items-center justify-between rounded-2xl border px-4 py-3.5 active:opacity-70 ${
                      active
                        ? 'border-zu-navy bg-zu-navy/10'
                        : 'border-zu-border bg-zu-white'
                    }`}
                  >
                    <Text
                      className={`flex-1 text-base font-semibold ${
                        active
                          ? 'text-zu-navy'
                          : 'text-zu-slate'
                      }`}
                    >
                      {opcion.label}
                    </Text>

                    {active ? (
                      <Check size={20} color="#1E3A5F" />
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}