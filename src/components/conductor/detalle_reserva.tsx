import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CARGO_RESERVA,
  estaEnCamino,
  extendReserva,
  getReserva,
  HORAS_MAX,
  horasEntre,
  precioEstimado,
  TARIFA_HORA,
} from '../../api/reservas';
import { getZona } from '../../api/zonas';
import Button from '../Button';
import FormError from '../FormError';
import NoSessionState from '../NoSessionState';
import ContadorLlegada from '../reservas/ContadorLlegada';
import EstadoReservaBadge from '../reservas/EstadoReservaBadge';
import {
  detalleZona,
  formatFechaHora,
  formatHoras,
  formatMomento,
  formatPesos,
  formatVentana,
  tituloZona,
} from '../../formato';
import { useSession } from '../../session/context';
import type { EstadoReserva, Reserva, ZonaAzul } from '../../types';

const descripcionEstado: Record<EstadoReserva, string> = {
  pendiente: 'Esperando a que el encargado de la zona acepte tu solicitud.',
  activa: 'El encargado aceptó tu reserva. Al llegar verificará la placa de tu vehículo.',
  completada: 'El encargado confirmó tu llegada. La reserva terminó.',
  cancelada: 'La solicitud fue rechazada o anulada y el cupo quedó libre.',
};

const HORAS_EXTRA = [1, 2, 3] as const;
const MS_POR_HORA = 60 * 60 * 1000;

const DetalleReservaScreen = function() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { user } = useSession();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [extendiendo, setExtendiendo] = useState(false);
  const [horasExtra, setHorasExtra] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Referencia de "ahora" para el contador; se renueva al cargar y cuando llega a 0:00.
  const [ahora, setAhora] = useState(() => new Date());

  const idNumerico = id ? Number(id) : NaN;

  const cargar = useCallback(
    async (refresh = false) => {
      if (!Number.isInteger(idNumerico)) {
        setError('Identificador de reserva inválido.');
        setLoading(false);
        return;
      }

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const data = await getReserva(idNumerico);
        setReserva(data);
        setAhora(new Date());
        // La zona solo aporta nombre e indicaciones: si falla, la reserva se muestra igual.
        if (data.id_zona !== null) {
          setZona(await getZona(data.id_zona).catch(() => null));
        }
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idNumerico],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: reserva ? `Reserva #${reserva.id}` : 'Detalle de la reserva',
    });
  }, [navigation, reserva]);

  const alTerminarLlegada = useCallback(() => setAhora(new Date()), []);

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

  const titulo = tituloZona(zona?.indicaciones, reserva.id_zona);
  const extra = detalleZona(zona?.indicaciones);
  const duracion = reserva.fecha_fin
    ? horasEntre(reserva.fecha_real_inicio, new Date(reserva.fecha_fin))
    : null;

  // El servidor solo extiende reservas pendientes o activas. Las horas se suman
  // al fin actual, o a este momento si ese fin ya pasó.
  const extensible = reserva.estado === 'pendiente' || reserva.estado === 'activa';
  const baseExtension = Math.max(
    reserva.fecha_fin ? new Date(reserva.fecha_fin).getTime() : 0,
    Date.now(),
  );
  const finConExtra = (horas: number) => new Date(baseExtension + horas * MS_POR_HORA);
  const superaMaximo = (horas: number) =>
    horasEntre(reserva.fecha_real_inicio, finConExtra(horas)) > HORAS_MAX;
  const nuevoFin = horasExtra ? finConExtra(horasExtra) : null;
  const nuevoPrecio = nuevoFin
    ? precioEstimado(horasEntre(reserva.fecha_real_inicio, nuevoFin))
    : null;

  const extender = () => {
    if (!nuevoFin || nuevoPrecio === null || extendiendo) return;

    Alert.alert(
      'Extender reserva',
      `Nuevo fin: ${formatMomento(nuevoFin)}.\nNuevo total estimado: ${formatPesos(nuevoPrecio)}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Extender',
          onPress: async () => {
            setExtendiendo(true);
            setError(null);
            try {
              const actualizada = await extendReserva(reserva.id, nuevoFin.toISOString());
              setReserva(actualizada);
              setHorasExtra(null);
              Alert.alert(
                'Reserva extendida',
                `Nuevo fin: ${formatMomento(actualizada.fecha_fin ?? nuevoFin)}.`,
              );
            } catch (cause) {
              setError((cause as Error).message);
            } finally {
              setExtendiendo(false);
            }
          },
        },
      ],
    );
  };

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
        {estaEnCamino(reserva, ahora) ? (
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
