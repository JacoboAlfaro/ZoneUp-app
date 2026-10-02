import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Check, ShieldCheck, Timer, X } from 'lucide-react-native';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { estaEnCamino, horasEntre, limiteLlegada, listReservasZona } from '../../api/reservas';
import { getZona } from '../../api/zonas';
import Button from '../Button';
import FormError from '../FormError';
import EstadoReservaBadge from '../reservas/EstadoReservaBadge';
import {
  ejecutarAccionReserva,
  type AccionReserva,
} from '../reservas/accionesReserva';
import {
  detalleZona,
  formatFechaHora,
  formatHora,
  formatHoras,
  formatPesos,
  formatVentana,
  tituloZona,
} from '../../formato';
import type { EstadoReserva, ReservaDeZona, ZonaAzul } from '../../types';

const descripcionEstado: Record<EstadoReserva, string> = {
  pendiente: 'Llegó una nueva solicitud. Acéptala o recházala.',
  activa: 'Ya la aceptaste. Falta confirmar la placa cuando llegue el vehículo.',
  completada: 'Llegada confirmada: la placa coincidió con la de la reserva.',
  cancelada: 'Solicitud rechazada o anulada. El cupo quedó libre.',
};

function Dato({ label, children }: { label: string; children: string }) {
  return (
    <>
      <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
        {label}
      </Text>
      <Text className="mt-1 text-base text-zu-navy">{children}</Text>
    </>
  );
}

const ControladorReservaDetalleScreen = function() {
  const { id, idZona } = useLocalSearchParams<{ id: string; idZona: string }>();
  const navigation = useNavigation();
  const [item, setItem] = useState<ReservaDeZona | null>(null);
  const [zona, setZona] = useState<ZonaAzul | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const idNumerico = id ? Number(id) : NaN;
  const idZonaNumerico = idZona ? Number(idZona) : NaN;

  // El controlador no tiene GET /reservas/:id: la reserva se busca en las de su zona.
  const cargar = useCallback(
    async (refresh = false) => {
      if (!Number.isInteger(idNumerico) || !Number.isInteger(idZonaNumerico)) {
        setError('Identificador de reserva inválido.');
        setLoading(false);
        return;
      }

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const [reservasZona, zonaActual] = await Promise.all([
          listReservasZona(idZonaNumerico),
          // La zona solo aporta nombre e indicaciones: si falla, la reserva se muestra igual.
          getZona(idZonaNumerico).catch(() => null),
        ]);
        const encontrada = reservasZona.find((fila) => fila.reserva.id === idNumerico);
        setItem(encontrada ?? null);
        setZona(zonaActual);
        if (!encontrada) setError('No se encontró la reserva.');
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [idNumerico, idZonaNumerico],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: item ? `Reserva #${item.reserva.id}` : 'Detalle de la reserva',
    });
  }, [navigation, item]);

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

  if (!item) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#EEF8FC', paddingHorizontal: 20, paddingTop: 20 }}
        edges={['bottom']}>
        <Text className="text-base text-red-700">{error ?? 'No se encontró la reserva.'}</Text>
      </SafeAreaView>
    );
  }

  const { reserva, conductor, vehiculo } = item;
  const placa = reserva.id_vehiculo ?? '—';
  const titulo = tituloZona(zona?.indicaciones, reserva.id_zona);
  const extra = detalleZona(zona?.indicaciones);
  const porAtender = reserva.estado === 'pendiente' || reserva.estado === 'activa';
  const enCamino = estaEnCamino(reserva);
  const duracion = reserva.fecha_fin
    ? horasEntre(reserva.fecha_real_inicio, new Date(reserva.fecha_fin))
    : null;

  const ejecutar = async (accion: AccionReserva) => {
    if (procesando) return;
    setProcesando(true);
    setError(null);

    try {
      const actualizada = await ejecutarAccionReserva(accion, reserva);
      if (actualizada) setItem({ ...item, reserva: actualizada });
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setProcesando(false);
    }
  };

  const placaNoCoincide = () =>
    Alert.alert(
      'La placa no coincide',
      'No confirmes la llegada. Habla con el conductor y atiende el caso según las normas de operación. Si el vehículo de la reserva no se presenta, puedes cancelar la reserva para liberar el cupo.',
    );

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
        <View className="items-center rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Placa de la reserva
          </Text>
          <View className="mt-3 rounded-xl border-2 border-zu-navy bg-zu-white px-6 py-3">
            <Text className="text-3xl font-bold tracking-[6px] text-zu-navy">{placa}</Text>
          </View>
          <Text className="mt-3 text-sm text-zu-slate">
            {vehiculo && (vehiculo.marca || vehiculo.color)
              ? [vehiculo.marca, vehiculo.color].filter(Boolean).join(' · ')
              : 'Marca y color sin registrar'}
          </Text>
        </View>

        {reserva.estado === 'activa' ? (
          <View className="rounded-2xl border border-zu-white/70 bg-zu-card-cyan p-5 shadow-sm">
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-zu-sky-mid/45">
                <ShieldCheck size={22} color="#1E3A5F" />
              </View>
              <Text className="ml-3 flex-1 text-base font-semibold text-zu-navy">
                ¿La placa del vehículo es {placa}?
              </Text>
            </View>
            <Text className="mt-3 text-sm leading-5 text-zu-slate">
              Compara la placa física del vehículo frente a ti con la placa de la reserva. Si
              coinciden, confirma la llegada.
            </Text>
            <Button
              text="Sí, coincide"
              icon={Check}
              onPress={() => void ejecutar('confirmar_llegada')}
              disabled={procesando}
              className="mt-4 bg-zu-navy"
            />
            <Button
              text="No, es otra placa"
              icon={X}
              onPress={placaNoCoincide}
              disabled={procesando}
              secondary
              className="mt-3 bg-zu-white"
            />
          </View>
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
          {porAtender ? (
            <View className="mt-3 flex-row items-center gap-1.5">
              <Timer size={16} color={enCamino ? '#4A8EC4' : '#B45309'} />
              <Text
                className={`flex-1 text-sm ${
                  enCamino ? 'text-zu-slate' : 'font-semibold text-amber-700'
                }`}>
                {enCamino
                  ? `El conductor debe llegar antes de las ${formatHora(limiteLlegada(reserva))}.`
                  : `El tiempo para llegar venció a las ${formatHora(limiteLlegada(reserva))}.`}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Conductor
          </Text>
          <Text className="mt-1 text-lg font-bold text-zu-navy">
            {conductor?.name ?? 'Sin registrar'}
          </Text>
          {conductor ? (
            <>
              <Dato label="Documento">{conductor.documento_identidad}</Dato>
              <Dato label="Celular">{conductor.celular}</Dato>
              <Dato label="Correo electrónico">{conductor.email}</Dato>
            </>
          ) : null}
        </View>

        <View className="rounded-2xl border border-zu-white/70 bg-zu-white/90 p-5 shadow-sm">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Zona azul
          </Text>
          <Text className="mt-1 text-lg font-bold text-zu-navy">{titulo}</Text>
          {extra ? <Text className="mt-1 text-sm leading-5 text-zu-slate">{extra}</Text> : null}

          <Dato label="Ventana de la reserva">
            {formatVentana(reserva.fecha_real_inicio, reserva.fecha_fin)}
          </Dato>
          {duracion !== null ? (
            <Text className="mt-1 text-sm text-zu-slate">Duración: {formatHoras(duracion)}</Text>
          ) : null}

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Total
          </Text>
          <Text className="mt-1 text-2xl font-bold text-zu-navy">{formatPesos(reserva.precio)}</Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Solicitada
          </Text>
          <Text className="mt-1 text-sm text-zu-slate">
            {formatFechaHora(reserva.fecha_creacion)}
          </Text>
        </View>

        <FormError message={error ?? undefined} />

        {reserva.estado === 'pendiente' ? (
          <>
            <Button
              text={procesando ? 'Guardando…' : 'Aceptar reserva'}
              icon={Check}
              onPress={() => void ejecutar('aceptar')}
              disabled={procesando}
              className="bg-zu-navy"
            />
            <Button
              text="Rechazar"
              icon={X}
              iconColor="#B91C1C"
              onPress={() => void ejecutar('rechazar')}
              disabled={procesando}
              secondary
              className="border-red-400 bg-red-300/60"
            />
          </>
        ) : null}

        {reserva.estado === 'activa' ? (
          <Button
            text="Cancelar reserva"
            onPress={() => void ejecutar('cancelar')}
            disabled={procesando}
            secondary
            className="border-red-400 bg-red-300/60"
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default ControladorReservaDetalleScreen;
