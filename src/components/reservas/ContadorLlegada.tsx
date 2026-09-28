/**
 * Cuenta regresiva de los minutos que tiene el conductor para llegar a la zona
 * después de reservar. No es el tiempo de parqueo: ese lo marca `fecha_fin`.
 */

import { ChevronRight, Timer } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { limiteLlegada, MINUTOS_PARA_LLEGAR } from '../../api/reservas';
import { formatCuentaRegresiva, formatHora } from '../../formato';
import type { Reserva } from '../../types';

interface Props {
  reserva: Reserva;
  zonaTitulo: string;
  /** Si se pasa, la tarjeta se puede tocar (p. ej. para abrir el detalle). */
  onPress?: () => void;
  /** Se llama una sola vez cuando el contador llega a 0:00. */
  onFin?: () => void;
}

export default function ContadorLlegada({ reserva, zonaTitulo, onPress, onFin }: Props) {
  const limite = limiteLlegada(reserva).getTime();
  const [restante, setRestante] = useState(() => Math.max(0, limite - Date.now()));

  // En un ref para que el intervalo no se reinicie cada vez que el padre
  // vuelve a crear la función.
  const onFinRef = useRef(onFin);
  useEffect(() => {
    onFinRef.current = onFin;
  }, [onFin]);

  useEffect(() => {
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

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Tiempo para llegar: ${formatCuentaRegresiva(restante)}`}
      disabled={!onPress}
      onPress={onPress}
      className="rounded-2xl border border-zu-white/70 bg-zu-card-cyan p-5 shadow-sm active:opacity-80">
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-zu-sky-mid/45">
          <Timer size={25} color="#1E3A5F" />
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
            Tiempo para llegar
          </Text>
          <Text className="mt-1 text-3xl font-bold text-zu-navy">
            {formatCuentaRegresiva(restante)}
          </Text>
        </View>

        {onPress ? <ChevronRight size={22} color="#6B8698" /> : null}
      </View>

      <Text className="mt-3 text-sm leading-5 text-zu-slate">
        Llega a <Text className="font-semibold text-zu-navy">{zonaTitulo}</Text> antes de las{' '}
        {formatHora(new Date(limite))}. Los {MINUTOS_PARA_LLEGAR} minutos son para llegar a la
        zona, no el tiempo que puedes parquear.
      </Text>
    </Pressable>
  );
}
