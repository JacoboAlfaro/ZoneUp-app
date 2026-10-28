import { TARIFA_HORA } from '@/src/api/reservas';
import { detalleZona, formatPesos, tituloZona } from '@/src/formato';
import type { ZonaAzul } from '@/src/types';
import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from './Button';

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

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-30 rounded-t-[28px] bg-zu-white px-5 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
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
          className="h-9 w-9 items-center justify-center rounded-full bg-zu-sky-fade">
          <X size={18} color="#1E3A5F" />
        </Pressable>
      </View>

      {extra ? (
        <Text className="mt-3 text-sm leading-5 text-zu-slate">{extra}</Text>
      ) : null}

      <Text className="mt-4 text-sm text-zu-slate">
        Plazas disponibles{' '}
        <Text className={`font-bold ${sinCupo ? 'text-zu-slate' : 'text-emerald-600'}`}>
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
}
