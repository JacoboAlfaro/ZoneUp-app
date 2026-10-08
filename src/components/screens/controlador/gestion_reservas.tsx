import {
  Check,
  ClipboardCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Timer,
  X,
} from 'lucide-react-native';
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

import { useGestion_reserva } from '@/src/hooks/controlador/useGestion_reserva';
import { estaEnCamino, limiteLlegada } from '../../../api/reservas';
import { formatHora, formatVentana } from '../../../formato';
import EstadoReservaBadge from '../../reservas/EstadoReservaBadge';

const GestionReservasScreen = function() {
  
  const { items, busqueda, setBusqueda, filtro, setFiltro, loading, refreshing, error, procesando, 
    itemsFiltrados, contar, ejecutar, abrirDetalle, cargarReservas, filtros, tituloDe } = useGestion_reserva();
    
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
            onRefresh={() => void cargarReservas(true)}
            tintColor="#1E3A5F"
          />
        }>
        <Text className="text-base leading-6 text-zu-slate">
          Acepta o rechaza las solicitudes nuevas y confirma la llegada de cada vehículo
          verificando su placa.
        </Text>

        <View className="mt-5 flex-row items-center rounded-2xl border border-zu-border bg-zu-white/90 px-4">
          <Search size={20} color="#6B8698" />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por placa, conductor o zona"
            placeholderTextColor="#6B8698"
            selectionColor="#6BB8E8"
            underlineColorAndroid="transparent"
            autoCapitalize="characters"
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerClassName="gap-2">
          {filtros.map(({ valor, label }) => {
            const active = filtro === valor;
            return (
              <Pressable
                key={valor}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => setFiltro(valor)}
                className={`rounded-full border px-4 py-2 active:opacity-70 ${
                  active ? 'border-zu-navy bg-zu-navy/10' : 'border-zu-border bg-zu-white'
                }`}>
                <Text
                  className={`text-xs font-semibold ${active ? 'text-zu-navy' : 'text-zu-slate'}`}>
                  {label} ({contar(valor)})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mb-1 mt-8 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
          Listado ({itemsFiltrados.length})
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

        {!loading && !error && items.length === 0 ? (
          <View className="mt-4 items-center rounded-2xl bg-zu-white/80 p-8">
            <ClipboardCheck size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              Todavía no hay reservas en las zonas azules.
            </Text>
          </View>
        ) : null}

        {!loading && !error && items.length > 0 && itemsFiltrados.length === 0 ? (
          <View className="mt-4 items-center rounded-2xl bg-zu-white/80 p-8">
            <Search size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              {busqueda
                ? `No encontramos reservas que coincidan con “${busqueda}”.`
                : 'No hay reservas con este estado.'}
            </Text>
          </View>
        ) : null}

        {!loading && !error
          ? itemsFiltrados.map((item) => {
              const { reserva, conductor } = item;
              const titulo = tituloDe(item);
              const ocupado = procesando === reserva.id;
              const porAtender = reserva.estado === 'pendiente' || reserva.estado === 'activa';

              return (
                <Pressable
                  key={reserva.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Reserva ${reserva.id}, placa ${reserva.id_vehiculo ?? 'sin registrar'}`}
                  onPress={() => abrirDetalle(item)}
                  className="mt-3 rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm active:opacity-80">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 pr-2">
                      <Text className="text-lg font-bold text-zu-navy">{titulo}</Text>
                      <Text className="mt-1 text-sm leading-5 text-zu-slate">
                        {conductor?.name ?? 'Conductor sin registrar'}
                      </Text>
                    </View>
                    <View className="items-end gap-2">
                      <EstadoReservaBadge estado={reserva.estado} />
                      <View className="rounded-full bg-sky-100 px-2.5 py-1">
                        <Text className="text-xs font-semibold text-sky-900">#{reserva.id}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="mt-3 flex-row items-center gap-2">
                    <View className="rounded-lg border border-zu-navy/20 bg-zu-white px-2.5 py-1">
                      <Text className="text-base font-bold tracking-[2px] text-zu-navy">
                        {reserva.id_vehiculo ?? '—'}
                      </Text>
                    </View>
                    <Text className="flex-1 text-sm text-zu-slate">
                      {formatVentana(reserva.fecha_real_inicio, reserva.fecha_fin)}
                    </Text>
                  </View>

                  {porAtender ? (
                    <View className="mt-3 flex-row items-center gap-1.5">
                      <Timer size={15} color={estaEnCamino(reserva) ? '#4A8EC4' : '#B45309'} />
                      <Text
                        className={`text-xs ${
                          estaEnCamino(reserva) ? 'text-zu-slate' : 'font-semibold text-amber-700'
                        }`}>
                        {estaEnCamino(reserva)
                          ? `Debe llegar antes de las ${formatHora(limiteLlegada(reserva))}`
                          : `El tiempo para llegar venció a las ${formatHora(limiteLlegada(reserva))}`}
                      </Text>
                    </View>
                  ) : null}

                  {reserva.estado === 'pendiente' ? (
                    <View className="mt-4 flex-row gap-2">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Aceptar reserva ${reserva.id}`}
                        disabled={procesando !== null}
                        onPress={() => void ejecutar('aceptar', item)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-zu-navy py-2.5 active:opacity-80 disabled:opacity-50">
                        <Check size={18} color="#FFFFFF" />
                        <Text className="text-sm font-semibold text-white">
                          {ocupado ? 'Guardando…' : 'Aceptar'}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Rechazar reserva ${reserva.id}`}
                        disabled={procesando !== null}
                        onPress={() => void ejecutar('rechazar', item)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-red-50 py-2.5 active:opacity-80 disabled:opacity-50">
                        <X size={18} color="#B91C1C" />
                        <Text className="text-sm font-semibold text-red-700">Rechazar</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View className="mt-3.5 flex-row items-center gap-1.5 self-start rounded-full border border-zu-navy/10 bg-white/80 py-2 pl-3.5 pr-3 shadow-sm">
                      {reserva.estado === 'activa' ? (
                        <ShieldCheck size={16} color="#1E3A5F" />
                      ) : (
                        <Ticket size={16} color="#1E3A5F" />
                      )}
                      <Text className="pr-0.5 text-[13px] font-semibold text-zu-navy">
                        {reserva.estado === 'activa' ? 'Verificar placa' : 'Ver detalle'}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

export default GestionReservasScreen;
