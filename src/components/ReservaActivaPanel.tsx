import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CARGO_RESERVA,
  cancelarMiReserva,
  estaEnCamino,
  estaParqueada,
  terminarMiReserva,
} from '@/src/api/reservas';
import { ApiError } from '@/src/api/client';
import {
  formatCuentaRegresiva,
  formatPesos,
  tituloZona,
} from '@/src/formato';
import { color, glass } from '@/src/theme';
import type { ReservaConZona } from '@/src/types';
import { useAlerta } from './alerta/AlertaProvider';
import Button from './Button';
import { VidrioRespaldo } from './glass/VidrioRespaldo';
import EstadoReservaBadge from './reservas/EstadoReservaBadge';
import { deadlineReserva } from './ReservaTiempoChip';

const RADIO = 28;

export function ReservaActivaPanel({
  fila,
  onCerrar,
  onCambio,
  onVerDetalle,
}: {
  fila: ReservaConZona;
  onCerrar: () => void;
  onCambio: () => void;
  onVerDetalle: () => void;
}) {
  const insets = useSafeAreaInsets();
  const alerta = useAlerta();
  const { reserva, zona } = fila;
  const [ahora, setAhora] = useState(() => new Date());
  const [cerrando, setCerrando] = useState(false);

  const limite = deadlineReserva(reserva, ahora)?.getTime() ?? 0;
  const [restante, setRestante] = useState(() => Math.max(0, limite - Date.now()));

  useEffect(() => {
    if (!limite) return;
    const tick = () => setRestante(Math.max(0, limite - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [limite]);

  const enCamino = estaEnCamino(reserva, ahora);
  const parqueada = estaParqueada(reserva, ahora);
  const titulo = tituloZona(zona?.indicaciones, reserva.id_zona);
  const liquid =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  const etiquetaTiempo = parqueada
    ? 'Tiempo de parqueo'
    : enCamino
      ? 'Tiempo para llegar'
      : 'Tiempo restante';

  const cerrarReserva = async () => {
    if (cerrando) return;
    const cancela = enCamino;
    if (!cancela && !parqueada) return;

    const confirmado = await alerta.confirmar({
      titulo: cancela ? 'Cancelar reserva' : 'Terminar reserva',
      mensaje: cancela
        ? `El cupo quedará libre y se cobra solo el cargo de reserva (${formatPesos(CARGO_RESERVA)}).`
        : `El cupo quedará libre y se cobra el precio completo (${formatPesos(reserva.precio)}).`,
      textoConfirmar: cancela ? 'Cancelar reserva' : 'Terminar reserva',
      textoCancelar: 'Volver',
      destructiva: true,
    });
    if (!confirmado) return;

    setCerrando(true);
    try {
      await (cancela ? cancelarMiReserva : terminarMiReserva)(reserva.id);
      void alerta.mostrar({
        tipo: 'exito',
        titulo: cancela ? 'Reserva cancelada' : 'Reserva terminada',
        mensaje: 'El cupo quedó libre.',
      });
      onCambio();
      onCerrar();
    } catch (cause) {
      const conflicto = cause instanceof ApiError && cause.status === 409;
      void alerta.mostrar({
        tipo: conflicto ? 'advertencia' : 'error',
        titulo: cancela ? 'No se pudo cancelar' : 'No se pudo terminar',
        mensaje: (cause as Error).message,
      });
      if (conflicto) {
        setAhora(new Date());
        onCambio();
      }
    } finally {
      setCerrando(false);
    }
  };

  const contenido = (
    <View className="px-5 pb-5 pt-3">
      <View className="mb-3 h-1 w-10 self-center rounded-full bg-zu-border" />

      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
            Reserva en curso
          </Text>
          <Text className="mt-1 text-xl font-bold text-zu-navy">{titulo}</Text>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <EstadoReservaBadge estado={reserva.estado} />
            <Text className="text-sm text-zu-slate">
              #{reserva.id}
              {reserva.id_vehiculo ? ` · ${reserva.id_vehiculo}` : ''}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onCerrar}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          className="h-9 w-9 items-center justify-center rounded-full bg-zu-sky-fade/80">
          <X size={18} color={color.navy} />
        </Pressable>
      </View>

      <View className="mt-4 flex-row items-end justify-between">
        <View>
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            {etiquetaTiempo}
          </Text>
          <Text className="mt-1 text-3xl font-bold tabular-nums text-zu-navy">
            {formatCuentaRegresiva(restante)}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-zu-navy">{formatPesos(reserva.precio)}</Text>
      </View>

      {enCamino || parqueada ? (
        <Button
          text={
            cerrando
              ? 'Guardando…'
              : enCamino
                ? 'Cancelar reserva'
                : 'Terminar reserva'
          }
          onPress={() => void cerrarReserva()}
          disabled={cerrando}
          destructive
          className="mt-5"
        />
      ) : null}

      <Button
        text="Ver detalle"
        onPress={onVerDetalle}
        secondary
        className="mt-3"
      />
    </View>
  );

  return (
    <View
      className="absolute bottom-0 left-0 right-0 z-30 px-3"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      {liquid ? (
        <GlassView
          colorScheme="light"
          glassEffectStyle="regular"
          tintColor={glass.panel}
          style={{ borderRadius: RADIO, overflow: 'hidden' }}>
          {contenido}
        </GlassView>
      ) : (
        <VidrioRespaldo tint={glass.panel} radius={RADIO}>
          {contenido}
        </VidrioRespaldo>
      )}
    </View>
  );
}