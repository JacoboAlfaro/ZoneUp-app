import { router } from 'expo-router';
import { CalendarPlus, Car, Info, TriangleAlert } from 'lucide-react-native';
import { type ComponentType, type ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNuevaReserva } from '@/src/hooks/reservas/useNuevaReserva';
import {
    CARGO_RESERVA,
    HORAS_MAX,
    HORAS_MIN,
    limiteLlegada,
    MINUTOS_PARA_LLEGAR,
    precioEstimado,
    TARIFA_HORA,
} from '../../../api/reservas';
import { formatHora, formatMomento, formatPesos } from '../../../formato';
import Button from '../../Button';
import Field from '../../Field';
import FormError from '../../FormError';
import NoSessionState from '../../NoSessionState';
import DisponibilidadBadge from '../../reservas/DisponibilidadBadge';

const HORAS_RAPIDAS = [1, 2, 3, 4] as const;

type IconComponent = ComponentType<{ size?: number; color?: string }>;

/** Tarjeta que explica por qué no se puede reservar y qué hacer. */
function Aviso({
  icon: Icon,
  title,
  children,
}: {
  icon: IconComponent;
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-amber-100">
          <Icon size={22} color="#92400E" />
        </View>
        <Text className="ml-3 flex-1 text-base font-semibold text-zu-navy">{title}</Text>
      </View>
      {children}
    </View>
  );
}

function FilaResumen({ label, valor }: { label: string; valor: string }) {
  return (
    <View className="mt-3 flex-row items-center justify-between">
      <Text className="text-sm text-zu-slate">{label}</Text>
      <Text className="text-sm font-semibold text-zu-navy">{valor}</Text>
    </View>
  );
}

const NuevaReservaScreen = function() {
  const {
    user,
    zona,
    vehiculos,
    enCamino,
    loading,
    cargaError,
    control,
    reglas,
    horas,
    elegirHoras,
    titulo,
    extra,
    sinCupo,
    finEstimado,
    errorGeneral,
    reservando,
    reservar,
  } = useNuevaReserva();

  if (!user) {
    return <NoSessionState />;
  }

  if (loading && !zona) {
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

  if (!zona) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#EEF8FC', paddingHorizontal: 20, paddingTop: 20 }}
        edges={['bottom']}>
        <Text className="text-base text-red-700">{cargaError ?? 'No se encontró la zona.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF8FC' }} edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 px-5 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
                  Zona azul #{zona.id}
                </Text>
                <Text className="mt-1 text-lg font-bold text-zu-navy">{titulo}</Text>
                {extra ? (
                  <Text className="mt-1 text-sm leading-5 text-zu-slate">{extra}</Text>
                ) : null}
              </View>
              <DisponibilidadBadge zona={zona} />
            </View>
            <Text className="mt-3 text-sm font-medium text-zu-navy">
              Cupos:{' '}
              <Text className="font-bold text-blue-700">
                {Math.max(0, zona.capacidad)}/{zona.capacidad_total}
              </Text>{' '}
              disponibles / total
            </Text>
          </View>

          <FormError message={cargaError ?? undefined} />

          {enCamino ? (
            <Aviso icon={TriangleAlert} title="Ya tienes una reserva en curso">
              <Text className="mt-3 text-sm leading-5 text-zu-slate">
                Podrás reservar otra zona cuando termine tu tiempo para llegar, a las{' '}
                {formatHora(limiteLlegada(enCamino))}.
              </Text>
              <Button
                text="Ver mi reserva"
                onPress={() =>
                  router.push({
                    pathname: '/conductor/(reservas)/reserva/[id]',
                    params: { id: String(enCamino.id) },
                  })
                }
                className="mt-4 bg-zu-navy"
              />
            </Aviso>
          ) : sinCupo ? (
            <Aviso icon={TriangleAlert} title="Esta zona no tiene cupos">
              <Text className="mt-3 text-sm leading-5 text-zu-slate">
                Los cupos se liberan cuando termina una reserva. Elige otra zona o intenta más
                tarde.
              </Text>
              <Button
                text="Elegir otra zona"
                onPress={() => router.back()}
                secondary
                className="mt-4"
              />
            </Aviso>
          ) : vehiculos.length === 0 ? (
            <Aviso icon={Car} title="Registra un vehículo para reservar">
              <Text className="mt-3 text-sm leading-5 text-zu-slate">
                La reserva queda a nombre de la placa de tu vehículo; el encargado la verifica
                cuando llegas a la zona.
              </Text>
              <Button
                text="Registrar vehículo"
                onPress={() => router.push('/conductor/(vehiculos)/nuevo-vehiculo')}
                className="mt-4 bg-zu-navy"
              />
            </Aviso>
          ) : (
            <>
              <View className="gap-4 rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
                <Controller
                  control={control}
                  name="placa"
                  rules={reglas.placa}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <View className="gap-1.5">
                      <Text className="ml-1 text-xs font-medium text-zu-slate">Vehículo</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {vehiculos.map((vehiculo) => {
                          const active = vehiculo.placa === value;
                          return (
                            <Pressable
                              key={vehiculo.placa}
                              accessibilityRole="radio"
                              accessibilityState={{ checked: active }}
                              onPress={() => onChange(vehiculo.placa)}
                              className={`flex-row items-center gap-2 rounded-xl border px-3 py-2.5 active:opacity-70 ${
                                active
                                  ? 'border-zu-navy bg-zu-navy/10'
                                  : 'border-zu-border bg-zu-white'
                              }`}>
                              <Car size={18} color={active ? '#1E3A5F' : '#6B8698'} />
                              <View>
                                <Text
                                  className={`text-sm font-semibold ${
                                    active ? 'text-zu-navy' : 'text-zu-slate'
                                  }`}>
                                  {vehiculo.placa}
                                </Text>
                                {vehiculo.marca || vehiculo.color ? (
                                  <Text className="text-xs text-zu-slate">
                                    {[vehiculo.marca, vehiculo.color].filter(Boolean).join(' · ')}
                                  </Text>
                                ) : null}
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                      {error ? (
                        <Text className="ml-1 text-xs text-red-600">{error.message}</Text>
                      ) : null}
                    </View>
                  )}
                />

                <View className="gap-1.5">
                  <Text className="ml-1 text-xs font-medium text-zu-slate">Tiempo de parqueo</Text>
                  <View className="flex-row gap-2">
                    {HORAS_RAPIDAS.map((opcion) => {
                      const active = horas === opcion;
                      return (
                        <Pressable
                          key={opcion}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: active }}
                          onPress={() => elegirHoras(opcion)}
                          className={`flex-1 rounded-xl border px-2 py-3 active:opacity-70 ${
                            active ? 'border-zu-navy bg-zu-navy/10' : 'border-zu-border bg-zu-white'
                          }`}>
                          <Text
                            className={`text-center text-sm font-semibold ${
                              active ? 'text-zu-navy' : 'text-zu-slate'
                            }`}>
                            {opcion} h
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <Field
                  control={control}
                  name="horas"
                  label={`O escribe las horas (${HORAS_MIN} a ${HORAS_MAX})`}
                  placeholder="1"
                  keyboardType="number-pad"
                  maxLength={2}
                  rules={reglas.horas}
                />
              </View>

              <View className="rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
                <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
                  Resumen
                </Text>
                <FilaResumen label="Tarifa por hora" valor={formatPesos(TARIFA_HORA)} />
                <FilaResumen
                  label={horas ? `Parqueo (${horas} h)` : 'Parqueo'}
                  valor={horas ? formatPesos(horas * TARIFA_HORA) : '—'}
                />
                <FilaResumen label="Cargo por reserva" valor={formatPesos(CARGO_RESERVA)} />

                <View className="mt-4 flex-row items-end justify-between border-t border-zu-border pt-4">
                  <Text className="text-base font-semibold text-zu-navy">Total estimado</Text>
                  <Text className="text-2xl font-bold text-zu-navy">
                    {horas ? formatPesos(precioEstimado(horas)) : '—'}
                  </Text>
                </View>
                <Text className="mt-2 text-sm text-zu-slate">
                  {finEstimado
                    ? `Fin estimado de la reserva: ${formatMomento(finEstimado)}`
                    : 'Elige las horas para ver cuándo termina la reserva.'}
                </Text>
              </View>

              <View className="flex-row gap-3 rounded-2xl bg-zu-white/80 p-4">
                <Info size={20} color="#4A8EC4" />
                <Text className="flex-1 text-sm leading-5 text-zu-slate">
                  Después de reservar tienes {MINUTOS_PARA_LLEGAR} minutos para llegar a la zona.
                  El encargado acepta tu solicitud y verifica la placa cuando llegas.
                </Text>
              </View>

              <FormError message={errorGeneral} />

              <Button
                text={reservando ? 'Reservando…' : 'Reservar'}
                icon={CalendarPlus}
                onPress={reservar}
                disabled={reservando}
                className="mt-2 bg-zu-navy"
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default NuevaReservaScreen;
