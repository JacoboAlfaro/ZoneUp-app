import { router, useFocusEffect } from 'expo-router';
import { CalendarClock, Plus, RefreshCw, Ticket } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { estaEnCamino, horasEntre, listReservasConductor } from '../../../api/reservas';
import { listZonas } from '../../../api/zonas';
import { formatHoras, formatPesos, formatVentana, tituloZona } from '../../../formato';
import { useSession } from '../../../session/context';
import type { Reserva, ZonaAzul } from '../../../types';
import Button from '../../Button';
import DashboardStat from '../../DashboardStat';
import NoSessionState from '../../NoSessionState';
import ContadorLlegada from '../../reservas/ContadorLlegada';
import EstadoReservaBadge from '../../reservas/EstadoReservaBadge';

const MisReservasScreen = function() {
  const { user } = useSession();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [zonas, setZonas] = useState<Map<number, ZonaAzul>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Referencia de "ahora" para saber qué reserva sigue en camino; se renueva al
  // cargar y cuando el contador llega a 0:00.
  const [ahora, setAhora] = useState(() => new Date());

  const cargarReservas = useCallback(
    async (refresh = false) => {
      if (!user) return;

      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        // Las zonas solo se usan para mostrar el nombre de cada una.
        const [misReservas, todasLasZonas] = await Promise.all([
          listReservasConductor(user.id),
          listZonas(),
        ]);
        setReservas(misReservas);
        setZonas(new Map(todasLasZonas.map((zona) => [zona.id, zona])));
        setAhora(new Date());
      } catch (cause) {
        setError((cause as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user],
  );

  useFocusEffect(
    useCallback(() => {
      void cargarReservas();
    }, [cargarReservas]),
  );

  const alTerminarLlegada = useCallback(() => setAhora(new Date()), []);

  if (!user) {
    return <NoSessionState />;
  }

  const tituloDe = (reserva: Reserva) =>
    tituloZona(
      reserva.id_zona === null ? null : zonas.get(reserva.id_zona)?.indicaciones,
      reserva.id_zona,
    );

  const abrirDetalle = (reserva: Reserva) =>
    router.push({
      pathname: '/conductor/(reservas)/reserva/[id]',
      params: { id: String(reserva.id) },
    });

  const enCamino = reservas.find((reserva) => estaEnCamino(reserva, ahora)) ?? null;
  const completadas = reservas.filter((reserva) => reserva.estado === 'completada').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF8FC' }} edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void cargarReservas(true)}
            tintColor="#1E3A5F"
          />
        }>
        <Text className="text-base leading-6 text-zu-slate">
          Consulta el estado de tus reservas. Desliza hacia abajo para ver si el encargado ya
          respondió.
        </Text>

        {!loading && enCamino ? (
          <>
            <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
              En curso
            </Text>
            <ContadorLlegada
              reserva={enCamino}
              zonaTitulo={tituloDe(enCamino)}
              onPress={() => abrirDetalle(enCamino)}
              onFin={alTerminarLlegada}
            />
          </>
        ) : null}

        <Button
          text="Nueva reserva"
          icon={Plus}
          onPress={() => router.push('/conductor/(reservas)/zonas')}
          className="mt-5 rounded-2xl bg-zu-navy"
        />

        <View className="mt-5 flex-row gap-3">
          <DashboardStat value={reservas.length} label="Reservas realizadas" />
          <DashboardStat
            value={completadas}
            label="Reservas completadas"
            valueClassName="text-emerald-700"
          />
        </View>

        <Text className="mb-1 mt-8 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
          Historial ({reservas.length})
        </Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#1E3A5F" />
            <Text className="mt-3 text-zu-slate">Cargando reservas…</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View className="mt-4 items-center rounded-2xl bg-red-50 p-5">
            <Text className="text-center text-red-700">{error}</Text>
            <Pressable
              onPress={() => void cargarReservas()}
              className="mt-4 flex-row items-center gap-2 rounded-xl px-4 py-2">
              <RefreshCw size={18} color="#1E3A5F" />
              <Text className="font-semibold text-zu-navy">Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && reservas.length === 0 ? (
          <View className="mt-4 items-center rounded-2xl bg-zu-white/80 p-8">
            <CalendarClock size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              Todavía no has hecho reservas.{'\n'}Toca “Nueva reserva” para elegir una zona azul.
            </Text>
          </View>
        ) : null}

        {!loading && !error
          ? reservas.map((reserva) => {
              const titulo = tituloDe(reserva);
              const duracion = reserva.fecha_fin
                ? horasEntre(reserva.fecha_real_inicio, new Date(reserva.fecha_fin))
                : null;

              return (
                <Pressable
                  key={reserva.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Reserva ${reserva.id} en ${titulo}`}
                  onPress={() => abrirDetalle(reserva)}
                  className="mt-3 rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm active:opacity-80">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-lg font-bold text-zu-navy">{titulo}</Text>
                      <Text className="mt-1 text-sm leading-5 text-zu-slate">
                        Placa {reserva.id_vehiculo ?? 'sin registrar'}
                        {duracion !== null ? ` · ${formatHoras(duracion)}` : ''}
                      </Text>
                      <Text className="mt-1 text-sm leading-5 text-zu-slate">
                        {formatVentana(reserva.fecha_real_inicio, reserva.fecha_fin)}
                      </Text>
                      <Text className="mt-3 text-sm font-medium text-zu-navy">
                        Total: <Text className="font-bold">{formatPesos(reserva.precio)}</Text>
                      </Text>
                      <View className="mt-3.5 flex-row items-center gap-1.5 self-start rounded-full border border-zu-navy/10 bg-white/80 py-2 pl-3.5 pr-3 shadow-sm">
                        <Ticket size={16} color="#1E3A5F" />
                        <Text className="pr-0.5 text-[13px] font-semibold text-zu-navy">
                          Ver detalle
                        </Text>
                      </View>
                    </View>
                    <View className="items-end gap-2">
                      <EstadoReservaBadge estado={reserva.estado} />
                      <View className="rounded-full bg-sky-100 px-2.5 py-1">
                        <Text className="text-xs font-semibold text-sky-900">#{reserva.id}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default MisReservasScreen;
