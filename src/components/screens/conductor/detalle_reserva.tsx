import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDetalleReserva } from '@/src/hooks/reservas/useDetalleReserva';
import { CARGO_RESERVA, HORAS_MAX, TARIFA_HORA } from '../../../api/reservas';
import {
    formatFechaHora,
    formatHoras,
    formatMomento,
    formatPesos,
    formatVentana,
} from '../../../formato';
import type { EstadoReserva } from '../../../types';
import Button from '../../Button';
import FormError from '../../FormError';
import NoSessionState from '../../NoSessionState';
import ContadorLlegada from '../../reservas/ContadorLlegada';
import EstadoReservaBadge from '../../reservas/EstadoReservaBadge';

const descripcionEstado: Record<EstadoReserva, string> = {
  pendiente: 'Esperando a que el encargado de la zona acepte tu solicitud.',
  activa: 'El encargado aceptó tu reserva. Al llegar verificará la placa de tu vehículo.',
  completada: 'El encargado confirmó tu llegada. La reserva terminó.',
  cancelada: 'La solicitud fue rechazada o anulada y el cupo quedó libre.',
};

const HORAS_EXTRA = [1, 2, 3] as const;

const DetalleReservaScreen = function() {
  const {
    user,
    reserva,
    loading,
    refreshing,
    error,
    cargar,
    alTerminarLlegada,
    enCamino,
    titulo,
    extra,
    duracion,
    extensible,
    horasExtra,
    setHorasExtra,
    superaMaximo,
    nuevoFin,
    nuevoPrecio,
    extendiendo,
    extender,
  } = useDetalleReserva();

  if (!user) {
    return <NoSessionState />;
  }

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EEF8FC',
        }}
        edges={['bottom']}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </SafeAreaView>
    );
  }

  if (!reserva) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#EEF8FC', paddingHorizontal: 20, paddingTop: 20 }}
        edges={['bottom']}>
        <Text className="text-base text-red-700">{error ?? 'No se encontró la reserva.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF8FC' }} edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-5 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void cargar(true)}
            tintColor="#1E3A5F"
          />
        }>
        {enCamino ? (
          <ContadorLlegada reserva={reserva} zonaTitulo={titulo} onFin={alTerminarLlegada} />
        ) : null}

        <View className="rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
              Estado
            </Text>
            <EstadoReservaBadge estado={reserva.estado} />
          </View>
          <Text className="mt-2 text-sm leading-5 text-zu-slate">
            {descripcionEstado[reserva.estado]}
          </Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Zona azul
          </Text>
          <Text className="mt-1 text-lg font-bold text-zu-navy">{titulo}</Text>
          {extra ? <Text className="mt-1 text-sm leading-5 text-zu-slate">{extra}</Text> : null}

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Vehículo
          </Text>
          <Text className="mt-1 text-base text-zu-navy">
            {reserva.id_vehiculo ?? 'Sin registrar'}
          </Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Ventana de la reserva
          </Text>
          <Text className="mt-1 text-base text-zu-navy">
            {formatVentana(reserva.fecha_real_inicio, reserva.fecha_fin)}
          </Text>
          {duracion !== null ? (
            <Text className="mt-1 text-sm text-zu-slate">Duración: {formatHoras(duracion)}</Text>
          ) : null}

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Total
          </Text>
          <Text className="mt-1 text-2xl font-bold text-zu-navy">{formatPesos(reserva.precio)}</Text>
          <Text className="mt-1 text-sm text-zu-slate">
            {formatPesos(TARIFA_HORA)} por hora + {formatPesos(CARGO_RESERVA)} de reserva.
          </Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Creada
          </Text>
          <Text className="mt-1 text-sm text-zu-slate">
            {formatFechaHora(reserva.fecha_creacion)}
          </Text>
        </View>

        {extensible ? (
          <View className="rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm">
            <Text className="text-base font-semibold text-zu-navy">Extender reserva</Text>
            <Text className="mt-1 text-sm text-zu-slate">
              Agrega horas a tu ventana de parqueo (máximo {HORAS_MAX} h en total). El total se
              recalcula desde el inicio de la reserva.
            </Text>

            <View className="mt-4 flex-row gap-2">
              {HORAS_EXTRA.map((horas) => {
                const active = horasExtra === horas;
                return (
                  <Pressable
                    key={horas}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    disabled={extendiendo || superaMaximo(horas)}
                    onPress={() => setHorasExtra(active ? null : horas)}
                    className={`flex-1 rounded-xl border px-2 py-3 active:opacity-70 ${
                      active ? 'border-zu-navy bg-zu-navy/10' : 'border-zu-border bg-zu-white'
                    } disabled:opacity-50`}>
                    <Text
                      className={`text-center text-sm font-semibold ${
                        active ? 'text-zu-navy' : 'text-zu-slate'
                      }`}>
                      +{horas} h
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {nuevoFin && nuevoPrecio !== null ? (
              <View className="mt-4 rounded-xl bg-zu-sky-fade p-3">
                <Text className="text-sm text-zu-slate">
                  Nuevo fin:{' '}
                  <Text className="font-semibold text-zu-navy">{formatMomento(nuevoFin)}</Text>
                </Text>
                <Text className="mt-1 text-sm text-zu-slate">
                  Nuevo total estimado:{' '}
                  <Text className="font-semibold text-zu-navy">{formatPesos(nuevoPrecio)}</Text>
                  {nuevoPrecio > reserva.precio
                    ? ` (+${formatPesos(nuevoPrecio - reserva.precio)})`
                    : ''}
                </Text>
              </View>
            ) : null}

            <Button
              text={
                extendiendo
                  ? 'Extendiendo…'
                  : horasExtra
                    ? `Extender ${horasExtra} h`
                    : 'Elige cuántas horas agregar'
              }
              onPress={extender}
              disabled={!horasExtra || extendiendo}
              className="mt-4 bg-zu-navy"
            />
          </View>
        ) : null}

        <FormError message={error ?? undefined} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default DetalleReservaScreen;
