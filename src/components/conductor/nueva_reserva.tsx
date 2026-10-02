import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { CalendarPlus, Car, Info, TriangleAlert } from 'lucide-react-native';
import { useCallback, useState, type ComponentType, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CARGO_RESERVA,
  createReserva,
  estaEnCamino,
  HORAS_MAX,
  HORAS_MIN,
  limiteLlegada,
  listReservasConductor,
  MINUTOS_PARA_LLEGAR,
  precioEstimado,
  TARIFA_HORA,
} from '../../api/reservas';
import { getVehiculos } from '../../api/vehiculos';
import { getZona } from '../../api/zonas';
import Button from '../Button';
import Field from '../Field';
import FormError from '../FormError';
import NoSessionState from '../NoSessionState';
import DisponibilidadBadge from '../reservas/DisponibilidadBadge';
import { detalleZona, formatHora, formatMomento, formatPesos, tituloZona } from '../../formato';
import { useSession } from '../../session/context';
import type { Reserva, Vehiculo, ZonaAzul } from '../../types';

/** Los datos que captura este formulario. Las horas entran como texto y se convierten al guardar. */
type NuevaReservaForm = {
  placa: string;
  horas: string;
};

const HORAS_RAPIDAS = [1, 2, 3, 4] as const;
const MS_POR_HORA = 60 * 60 * 1000;

/** Horas enteras dentro del rango permitido, o null si el texto no sirve. */
function horasValidas(value: string): number | null {
  const numero = Number(value.trim());
  return Number.isInteger(numero) && numero >= HORAS_MIN && numero <= HORAS_MAX ? numero : null;
}

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
  const { idZona } = useLocalSearchParams<{ idZona: string }>();
  const { user } = useSession();
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [enCamino, setEnCamino] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [cargaError, setCargaError] = useState<string | null>(null);

  const { control, getValues, handleSubmit, setError, setValue, watch, formState } =
    useForm<NuevaReservaForm>({
      defaultValues: { placa: '', horas: '1' },
    });

  const idNumerico = idZona ? Number(idZona) : NaN;

  // Al volver de registrar un vehículo hay que ver la lista nueva: se recarga al enfocar.
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      if (!Number.isInteger(idNumerico)) {
        setCargaError('Identificador de zona inválido.');
        setLoading(false);
        return;
      }

      let active = true;
      setLoading(true);
      setCargaError(null);

      Promise.all([
        getZona(idNumerico),
        getVehiculos(user.documento_identidad),
        listReservasConductor(user.id),
      ])
        .then(([zonaActual, misVehiculos, misReservas]) => {
          if (!active) return;
          setZona(zonaActual);
          setVehiculos(misVehiculos);
          setEnCamino(misReservas.find((reserva) => estaEnCamino(reserva)) ?? null);

          // Deja elegido el primer vehículo si no hay uno válido seleccionado.
          const placaActual = getValues('placa');
          if (!misVehiculos.some((vehiculo) => vehiculo.placa === placaActual)) {
            setValue('placa', misVehiculos[0]?.placa ?? '');
          }
        })
        .catch((cause) => {
          if (active) setCargaError((cause as Error).message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [user, idNumerico, getValues, setValue]),
  );

  const horas = horasValidas(watch('horas'));

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

  const titulo = tituloZona(zona.indicaciones, zona.id);
  const extra = detalleZona(zona.indicaciones);
  const sinCupo = zona.capacidad <= 0;
  const finEstimado = horas ? new Date(Date.now() + horas * MS_POR_HORA) : null;

  const reservar = async (form: NuevaReservaForm) => {
    const horasReserva = horasValidas(form.horas);
    if (!horasReserva) return;

    try {
      // El servidor no revisa cupos al crear: se confirma que sigan libres justo antes.
      const zonaActual = await getZona(zona.id);
      setZona(zonaActual);
      if (zonaActual.capacidad <= 0) {
        setError('root', { message: 'La zona se quedó sin cupos. Elige otra zona.' });
        return;
      }

      const reserva = await createReserva({
        id_conductor: user.id,
        id_zona: zona.id,
        id_vehiculo: form.placa,
        fecha_fin: new Date(Date.now() + horasReserva * MS_POR_HORA).toISOString(),
      });

      Alert.alert(
        'Reserva creada',
        `Tu solicitud en ${titulo} quedó pendiente de aprobación. Tienes ${MINUTOS_PARA_LLEGAR} minutos para llegar a la zona.`,
        [
          {
            text: 'Ver reserva',
            onPress: () =>
              router.replace({
                pathname: '/conductor/(reservas)/reserva/[id]',
                params: { id: String(reserva.id) },
              }),
          },
        ],
      );
    } catch (cause) {
      setError('root', { message: (cause as Error).message });
    }
  };

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
                  rules={{ required: 'Elige el vehículo con el que vas a parquear' }}
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
                          onPress={() =>
                            setValue('horas', String(opcion), { shouldValidate: true })
                          }
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
                  rules={{
                    required: 'Escribe cuántas horas vas a parquear',
                    validate: (value) =>
                      horasValidas(value) !== null ||
                      `Deben ser horas enteras entre ${HORAS_MIN} y ${HORAS_MAX}`,
                  }}
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

              <FormError message={formState.errors.root?.message} />

              <Button
                text={formState.isSubmitting ? 'Reservando…' : 'Reservar'}
                icon={CalendarPlus}
                onPress={handleSubmit(reservar)}
                disabled={formState.isSubmitting}
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
