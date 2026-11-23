import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { ChevronRight, Timer } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import {
  estaEnCamino,
  estaParqueada,
  limiteLlegada,
} from '@/src/api/reservas';
import { formatCuentaRegresiva } from '@/src/formato';
import { color, glass } from '@/src/theme';
import type { Reserva } from '@/src/types';
import { VidrioRespaldo } from './glass/VidrioRespaldo';

export function deadlineReserva(reserva: Reserva, ahora: Date = new Date()): Date | null {
  if (estaParqueada(reserva, ahora) && reserva.fecha_fin) {
    return new Date(reserva.fecha_fin);
  }
  if (estaEnCamino(reserva, ahora)) {
    return limiteLlegada(reserva);
  }
  if (reserva.fecha_fin) return new Date(reserva.fecha_fin);
  return null;
}

export function ReservaTiempoChip({
  reserva,
  onPress,
  onFin,
}: {
  reserva: Reserva;
  onPress: () => void;
  onFin?: () => void;
}) {
  const limite = deadlineReserva(reserva)?.getTime() ?? 0;
  const [restante, setRestante] = useState(() => Math.max(0, limite - Date.now()));
  const onFinRef = useRef(onFin);
  useEffect(() => {
    onFinRef.current = onFin;
  }, [onFin]);

  useEffect(() => {
    if (!limite) {
      setRestante(0);
      return;
    }

    const actualizar = () => {
      const ms = Math.max(0, limite - Date.now());
      setRestante(ms);
      return ms;
    };

    if (actualizar() === 0) {
      onFinRef.current?.();
      return;
    }

    const intervalo = setInterval(() => {
      if (actualizar() === 0) {
        clearInterval(intervalo);
        onFinRef.current?.();
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [limite]);

  const liquid =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  const texto = formatCuentaRegresiva(restante);

  const interior = (
    <View className="flex-row items-center gap-1.5 px-3 py-2">
      <Timer size={16} color={color.white} />
      <Text className="text-base font-bold tabular-nums text-zu-white">{texto}</Text>
      <ChevronRight size={16} color={color.white} />
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Tiempo restante de la reserva: ${texto}. Toca para ver el detalle`}
      className="active:scale-95">
      {liquid ? (
        <GlassView
          isInteractive
          glassEffectStyle="clear"
          tintColor={glass.navy}
          style={{ borderRadius: 999, overflow: 'hidden' }}>
          {interior}
        </GlassView>
      ) : (
        <VidrioRespaldo tint={glass.navy} radius={999} oscuro>
          {interior}
        </VidrioRespaldo>
      )}
    </Pressable>
  );
}