import { router } from 'expo-router';
import { CalendarPlus, MapPin, RefreshCw, Search, X } from 'lucide-react-native';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useZonasParaReservar } from '@/src/hooks/reservas/useZonasParaReservar';
import { detalleZona, tituloZona } from '../../../formato';
import DisponibilidadBadge from '../../reservas/DisponibilidadBadge';
import DashboardStat from '../admin/DashboardStat';

const ReservarZonaScreen = function() {
  const {
    zonas,
    busqueda,
    setBusqueda,
    loading,
    refreshing,
    error,
    cargarZonas,
    zonasConCupo,
    cuposDisponibles,
    zonasFiltradas,
  } = useZonasParaReservar();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF8FC' }} edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void cargarZonas(true)}
            tintColor="#1E3A5F"
          />
        }>
        <Text className="text-base leading-6 text-zu-slate">
          Elige una zona azul con cupo para reservar tu espacio. Desliza hacia abajo para
          actualizar los cupos.
        </Text>

        <View className="mt-5 flex-row gap-3">
          <DashboardStat value={zonasConCupo} label="Zonas con cupo" />
          <DashboardStat
            value={cuposDisponibles}
            label="Cupos disponibles en total"
            valueClassName="text-emerald-700"
          />
        </View>

        <View className="mt-6 flex-row items-center rounded-2xl border border-zu-border bg-zu-white/90 px-4">
          <Search size={20} color="#6B8698" />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por dirección o número de zona"
            placeholderTextColor="#6B8698"
            selectionColor="#6BB8E8"
            underlineColorAndroid="transparent"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            className="flex-1 py-3.5 pl-3 text-base text-zu-navy"
          />
          {busqueda ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              hitSlop={10}
              onPress={() => setBusqueda('')}
              className="p-1">
              <X size={19} color="#6B8698" />
            </Pressable>
          ) : null}
        </View>

        <Text className="mb-1 mt-8 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
          Zonas azules ({zonasFiltradas.length})
        </Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#1E3A5F" />
            <Text className="mt-3 text-zu-slate">Cargando zonas…</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View className="mt-4 items-center rounded-2xl bg-red-50 p-5">
            <Text className="text-center text-red-700">{error}</Text>
            <Pressable
              onPress={() => void cargarZonas()}
              className="mt-4 flex-row items-center gap-2 rounded-xl px-4 py-2">
              <RefreshCw size={18} color="#1E3A5F" />
              <Text className="font-semibold text-zu-navy">Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && zonas.length === 0 ? (
          <View className="mt-4 items-center rounded-2xl bg-zu-white/80 p-8">
            <MapPin size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              Todavía no hay zonas azules registradas.
            </Text>
          </View>
        ) : null}

        {!loading && !error && zonas.length > 0 && zonasFiltradas.length === 0 ? (
          <View className="mt-4 items-center rounded-2xl bg-zu-white/80 p-8">
            <Search size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              No encontramos zonas que coincidan con “{busqueda}”.
            </Text>
          </View>
        ) : null}

        {!loading && !error
          ? zonasFiltradas.map((zona) => {
              const titulo = tituloZona(zona.indicaciones, zona.id);
              const extra = detalleZona(zona.indicaciones);
              const sinCupo = zona.capacidad <= 0;

              return (
                <Pressable
                  key={zona.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Reservar en ${titulo}`}
                  accessibilityState={{ disabled: sinCupo }}
                  disabled={sinCupo}
                  onPress={() =>
                    router.push({
                      pathname: '/conductor/(reservas)/nueva-reserva',
                      params: { idZona: String(zona.id) },
                    })
                  }
                  className={`mt-3 rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm active:opacity-80 ${
                    sinCupo ? 'opacity-60' : ''
                  }`}>
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-lg font-bold text-zu-navy">{titulo}</Text>
                      {extra ? (
                        <Text className="mt-1 text-sm leading-5 text-zu-slate">{extra}</Text>
                      ) : null}
                      <Text className="mt-3 text-sm font-medium text-zu-navy">
                        Cupos:{' '}
                        <Text className="font-bold text-blue-700">
                          {Math.max(0, zona.capacidad)}/{zona.capacidad_total}
                        </Text>{' '}
                        disponibles / total
                      </Text>
                      {sinCupo ? (
                        <Text className="mt-3.5 text-sm text-zu-slate">
                          Sin cupos por ahora. Intenta más tarde.
                        </Text>
                      ) : (
                        <View className="mt-3.5 flex-row items-center gap-1.5 self-start rounded-full border border-zu-navy/10 bg-white/80 py-2 pl-3.5 pr-3 shadow-sm">
                          <CalendarPlus size={16} color="#1E3A5F" />
                          <Text className="pr-0.5 text-[13px] font-semibold text-zu-navy">
                            Reservar aquí
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="items-end gap-2">
                      <DisponibilidadBadge zona={zona} />
                      <View className="rounded-full bg-sky-100 px-2.5 py-1">
                        <Text className="text-xs font-semibold text-sky-900">#{zona.id}</Text>
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

export default ReservarZonaScreen;
