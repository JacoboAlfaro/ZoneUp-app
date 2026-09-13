import { router, useFocusEffect } from 'expo-router';
import { MapPin, Plus, RefreshCw, Search, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
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

import { listZonas } from '../../../src/api/zonas';
import DashboardStat from '../../../src/components/admin/DashboardStat';
import type { ZonaAzul } from '../../../src/types';

/**
 * Título y detalle derivados de `indicaciones`, igual que en la parte visual
 * de referencia: la primera línea es el título, el resto es el detalle.
 */
function tituloDesdeIndicaciones(indicaciones: string | null, id: number): string {
  const linea = indicaciones?.trim().split('\n')[0]?.trim();
  return linea && linea.length > 0 ? linea : `Zona #${id}`;
}

function detalleDesdeIndicaciones(indicaciones: string | null): string | null {
  const lineas = (indicaciones ?? '')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean);
  if (lineas.length <= 1) return null;
  return lineas.slice(1).join('\n');
}

function normalizarBusqueda(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function AdminZonas() {
  const [zonas, setZonas] = useState<ZonaAzul[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarZonas = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setZonas(await listZonas());
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarZonas();
    }, [cargarZonas]),
  );

  const cuposDisponibles = zonas.reduce((total, zona) => total + zona.capacidad, 0);
  const zonasFiltradas = useMemo(() => {
    const termino = normalizarBusqueda(busqueda.trim());
    if (!termino) return zonas;

    return zonas.filter((zona) =>
      [`Zona ${zona.id}`, `#${zona.id}`, zona.indicaciones ?? ''].some((value) =>
        normalizarBusqueda(value).includes(termino),
      ),
    );
  }, [busqueda, zonas]);

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
          Ubicación y referencias van en indicaciones. Toca una zona para verla y editarla.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nueva zona azul"
          onPress={() => router.push('/admin/nueva-zona')}
          className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-zu-navy px-5 py-4 active:opacity-80">
          <Plus size={21} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">Nueva zona azul</Text>
        </Pressable>

        <View className="mt-5 flex-row gap-3">
          <DashboardStat value={zonas.length} label="Zonas registradas" />
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
            placeholder="Buscar por indicaciones o número de zona"
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
          Listado ({zonasFiltradas.length})
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
              Todavía no hay zonas registradas.
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
              const extra = detalleDesdeIndicaciones(zona.indicaciones);
              return (
                <Pressable
                  key={zona.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Zona ${tituloDesdeIndicaciones(zona.indicaciones, zona.id)}`}
                  onPress={() =>
                    router.push({
                      pathname: '/admin/zona/[id]',
                      params: { id: String(zona.id) },
                    })
                  }
                  className="mt-3 rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm active:opacity-80">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-lg font-bold text-zu-navy">
                        {tituloDesdeIndicaciones(zona.indicaciones, zona.id)}
                      </Text>
                      {extra ? (
                        <Text className="mt-1 text-sm leading-5 text-zu-slate">{extra}</Text>
                      ) : null}
                      <Text className="mt-3 text-sm font-medium text-zu-navy">
                        Cupos:{' '}
                        <Text className="font-bold text-blue-700">
                          {zona.capacidad}/{zona.capacidad_total}
                        </Text>{' '}
                        disponibles / total
                      </Text>
                      <View className="mt-3.5 flex-row items-center gap-1.5 self-start rounded-full border border-zu-navy/10 bg-white/80 py-2 pl-3.5 pr-3 shadow-sm">
                        <MapPin size={16} color="#1E3A5F" />
                        <Text className="pr-0.5 text-[13px] font-semibold text-zu-navy">
                          Ver y editar
                        </Text>
                      </View>
                    </View>
                    <View className="rounded-full bg-sky-100 px-2.5 py-1">
                      <Text className="text-xs font-semibold text-sky-900">#{zona.id}</Text>
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
