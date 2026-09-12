import { Plus, RefreshCw, Search, Users, X } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
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

import { listUsers } from '../../../src/api/users';
import DashboardStat from '../../../src/components/admin/DashboardStat';
import type { EstadoUsuario, TipoUsuario, User } from '../../../src/types';

const estadoLabel: Record<EstadoUsuario, string> = {
  activo: 'Activo',
  no_verificado: 'No verificado',
  inactivo: 'Inactivo',
  eliminado: 'Eliminado',
};

const tipoLabel: Record<TipoUsuario, string> = {
  conductor: 'Conductor',
  controlador: 'Controlador',
  admin: 'Admin',
};

function estadoClasses(estado: EstadoUsuario): string {
  if (estado === 'activo') return 'bg-emerald-100 text-emerald-800';
  if (estado === 'no_verificado') return 'bg-amber-100 text-amber-800';
  if (estado === 'eliminado') return 'bg-slate-200 text-slate-700';
  return 'bg-red-100 text-red-700';
}

function normalizarBusqueda(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarUsuarios = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setUsuarios(await listUsers());
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarUsuarios();
    }, [cargarUsuarios]),
  );

  const activos = usuarios.filter((usuario) => usuario.estado === 'activo').length;
  const usuariosFiltrados = useMemo(() => {
    const termino = normalizarBusqueda(busqueda.trim());
    if (!termino) return usuarios;

    return usuarios.filter((usuario) =>
      [usuario.name, usuario.documento_identidad, usuario.email].some((value) =>
        normalizarBusqueda(value).includes(termino),
      ),
    );
  }, [busqueda, usuarios]);

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
            onRefresh={() => void cargarUsuarios(true)}
            tintColor="#1E3A5F"
          />
        }>
        <Text className="text-base leading-6 text-zu-slate">
          Consulta los usuarios registrados y administra sus cuentas.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar usuario"
          onPress={() => router.push('/admin/nuevo-usuario')}
          className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl bg-zu-navy px-5 py-4 active:opacity-80">
          <Plus size={21} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">Agregar usuario</Text>
        </Pressable>

        <View className="mt-5 flex-row gap-3">
          <DashboardStat value={usuarios.length} label="Total registrados" />
          <DashboardStat
            value={activos}
            label="Usuarios activos"
            valueClassName="text-emerald-700"
          />
        </View>

        <View className="mt-6 flex-row items-center rounded-2xl border border-zu-border bg-zu-white/90 px-4">
          <Search size={20} color="#6B8698" />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por nombre, documento o correo"
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
          Listado ({usuariosFiltrados.length})
        </Text>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#1E3A5F" />
            <Text className="mt-3 text-zu-slate">Cargando usuarios…</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View className="mt-4 items-center rounded-2xl bg-red-50 p-5">
            <Text className="text-center text-red-700">{error}</Text>
            <Pressable
              onPress={() => void cargarUsuarios()}
              className="mt-4 flex-row items-center gap-2 rounded-xl px-4 py-2">
              <RefreshCw size={18} color="#1E3A5F" />
              <Text className="font-semibold text-zu-navy">Reintentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && usuarios.length === 0 ? (
          <View className="mt-4 items-center rounded-2xl bg-zu-white/80 p-8">
            <Users size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              Todavía no hay usuarios registrados.
            </Text>
          </View>
        ) : null}

        {!loading && !error && usuarios.length > 0 && usuariosFiltrados.length === 0 ? (
          <View className="mt-4 items-center rounded-2xl bg-zu-white/80 p-8">
            <Search size={34} color="#6B8698" />
            <Text className="mt-3 text-center text-zu-slate">
              No encontramos usuarios que coincidan con “{busqueda}”.
            </Text>
          </View>
        ) : null}

        {!loading && !error
          ? usuariosFiltrados.map((usuario) => (
              <Pressable
                key={usuario.id}
                accessibilityRole="button"
                accessibilityLabel={`Ver usuario ${usuario.name}`}
                onPress={() =>
                  router.push({
                    pathname: '/admin/usuario/[email]',
                    params: { email: usuario.email },
                  })
                }
                className="mt-3 rounded-2xl border border-zu-white/70 bg-zu-white/90 p-4 shadow-sm active:opacity-80">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-zu-navy">{usuario.name}</Text>
                    <Text className="mt-1 text-sm text-zu-slate">
                      CC {usuario.documento_identidad}
                    </Text>
                    <Text className="mt-1 text-sm text-zu-slate">{usuario.email}</Text>
                  </View>

                  <View className="items-end gap-2">
                    <View className={`rounded-full px-2.5 py-1 ${estadoClasses(usuario.estado)}`}>
                      <Text className={`text-xs font-semibold ${estadoClasses(usuario.estado)}`}>
                        {estadoLabel[usuario.estado]}
                      </Text>
                    </View>
                    <View className="rounded-full bg-violet-100 px-2.5 py-1">
                      <Text className="text-[10px] font-bold uppercase text-violet-800">
                        {usuario.tipo_usuario ? tipoLabel[usuario.tipo_usuario] : 'Sin tipo'}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}
