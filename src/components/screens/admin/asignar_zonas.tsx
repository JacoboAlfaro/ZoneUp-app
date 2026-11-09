import { Check, MapPin, Plus, RefreshCw, Search } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAsignarZonas } from '@/src/hooks/admin/useAsignarZonas';
import { detalleZona, tituloZona } from '../../../formato';
import CampoBusqueda from '../../CampoBusqueda';
import CargarMas from '../../CargarMas';
import DashboardStat from '../../DashboardStat';
import { GlassCard } from '../../GlassCard';

const AdminAsignarZonasScreen = function() {
  const {
    items: zonas,
    total,
    busqueda,
    setBusqueda,
    termino,
    buscarAhora,
    limpiarBusqueda,
    loading,
    refreshing,
    cargandoMas,
    error,
    recargar,
    cargarMas,
    asignadas,
    procesando,
    alternar,
  } = useAsignarZonas();

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
            onRefresh={() => void recargar(true)}
            tintColor="#1E3A5F"
          />
        }>
        <Text className="text-base leading-6 text-zu-slate">
          Toca una zona para asignarla o quitarla. El controlador solo ve y gestiona las reservas
          de sus zonas asignadas.
        </Text>

        <View className="mt-5 flex-row gap-3">
          <DashboardStat value={asignadas ?? '…'} label="Zonas asignadas" />
        </View>

        <CampoBusqueda
          value={busqueda}
          onChangeText={setBusqueda}
          onBuscar={buscarAhora}
          onLimpiar={limpiarBusqueda}
          buscando={loading && !!termino}
          placeholder="Buscar por indicaciones o número de zona"
          className="mt-6"
        />

        <Text className="mb-1 mt-8 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
          Zonas azules ({total})
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
              onPress={() => void recargar()}
              className="mt-4 flex-row items-center gap-2 rounded-xl px-4 py-2">
              <RefreshCw size={18} color="#1E3A5F" />
              <Text className="font-semibold text-zu-navy">Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && zonas.length === 0 && !termino ? (
          <GlassCard className="mt-4 items-center p-8">
            <MapPin size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              Todavía no hay zonas registradas.
            </Text>
          </GlassCard>
        ) : null}

        {!loading && !error && zonas.length === 0 && termino ? (
          <GlassCard className="mt-4 items-center p-8">
            <Search size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              No encontramos zonas que coincidan con “{termino}”.
            </Text>
          </GlassCard>
        ) : null}

        {!loading && !error
          ? zonas.map((zona) => {
              const titulo = tituloZona(zona.indicaciones, zona.id);
              const extra = detalleZona(zona.indicaciones);

              return (
                <GlassCard
                  key={zona.id}
                  accessibilityLabel={`${zona.asignada ? 'Quitar' : 'Asignar'} ${titulo}`}
                  disabled={procesando !== null}
                  onPress={() => void alternar(zona)}
                  className="mt-3 p-4">
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-lg font-bold text-zu-navy">{titulo}</Text>
                      {extra ? (
                        <Text className="mt-1 text-sm leading-5 text-zu-slate">{extra}</Text>
                      ) : null}
                      <Text className="mt-1 text-sm text-zu-slate">Zona #{zona.id}</Text>
                    </View>
                    <View
                      className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
                        zona.asignada
                          ? 'border-zu-navy bg-zu-navy/10'
                          : 'border-zu-border bg-zu-white'
                      }`}>
                      {zona.asignada ? (
                        <Check size={16} color="#1E3A5F" />
                      ) : (
                        <Plus size={16} color="#6B8698" />
                      )}
                      <Text
                        className={`text-xs font-semibold ${
                          zona.asignada ? 'text-zu-navy' : 'text-zu-slate'
                        }`}>
                        {procesando === zona.id
                          ? 'Guardando…'
                          : zona.asignada
                            ? 'Asignada'
                            : 'Asignar'}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              );
            })
          : null}

        {!loading && !error ? (
          <CargarMas
            mostrados={zonas.length}
            total={total}
            cargando={cargandoMas}
            onPress={() => void cargarMas()}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default AdminAsignarZonasScreen;
