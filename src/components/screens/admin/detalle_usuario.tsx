import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDetalle_usuario } from '@/src/hooks/admin/useDetalle_usuario';
import { ESTADOS_USUARIO, TIPOS_USUARIO, type EstadoUsuario, type TipoUsuario } from '../../../types';
import { GlassCard } from '../../GlassCard';

const estadoLabel: Record<EstadoUsuario, string> = {
  activo: 'Activo',
  no_verificado: 'No verificado',
  inactivo: 'Inactivo',
  eliminado: 'Eliminado',
};

const tiposEditables = TIPOS_USUARIO;

const tipoLabel: Record<TipoUsuario, string> = {
  conductor: 'Conductor',
  controlador: 'Controlador',
  admin: 'Admin',
};

function formatFecha(iso: string): string {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? iso : fecha.toLocaleString('es-CO');
}

const AdminUsuarioDetalleScreen = function() {

  const { usuario, loading, saving, error, actualizar, cambiarEstado } = useDetalle_usuario();

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

  if (!usuario) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#EEF8FC', paddingHorizontal: 20, paddingTop: 20 }}
        edges={['bottom']}>
        <Text className="text-base text-red-700">{error ?? 'No se encontró el usuario.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF8FC' }} edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-3"
        showsVerticalScrollIndicator={false}>
        <GlassCard className="p-5">
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Identificación
          </Text>
          <Text className="mt-1 text-lg font-bold text-zu-navy">
            {usuario.documento_identidad}
          </Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Nombre completo
          </Text>
          <Text className="mt-1 text-base text-zu-navy">{usuario.name}</Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Correo electrónico
          </Text>
          <Text className="mt-1 text-base text-zu-navy">{usuario.email}</Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Celular
          </Text>
          <Text className="mt-1 text-base text-zu-navy">{usuario.celular}</Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Fecha de creación
          </Text>
          <Text className="mt-1 text-sm text-zu-slate">
            {formatFecha(usuario.fecha_creacion)}
          </Text>

          <Text className="mt-5 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/45">
            Última actualización
          </Text>
          <Text className="mt-1 text-sm text-zu-slate">
            {formatFecha(usuario.fecha_actualizacion)}
          </Text>
        </GlassCard>

        <GlassCard className="mt-5 p-4">
          <Text className="text-base font-semibold text-zu-navy">Tipo de usuario</Text>
          <Text className="mt-1 text-sm text-zu-slate">
            Tipo actual: {usuario.tipo_usuario ? tipoLabel[usuario.tipo_usuario] : 'Sin asignar'}.
          </Text>

          <View className="mt-4 flex-row gap-2">
            {tiposEditables.map((tipo) => {
              const active = usuario.tipo_usuario === tipo;
              return (
                <Pressable
                  key={tipo}
                  disabled={saving}
                  onPress={() => void actualizar({ tipo_usuario: tipo })}
                  className={`flex-1 rounded-xl border px-2 py-3 ${
                    active
                      ? 'border-violet-700 bg-violet-100'
                      : 'border-zu-border bg-zu-white'
                  } disabled:opacity-50`}>
                  <Text
                    className={`text-center text-xs font-semibold ${
                      active ? 'text-violet-800' : 'text-zu-slate'
                    }`}>
                    {tipoLabel[tipo]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard className="mt-5 p-4">
          <Text className="text-base font-semibold text-zu-navy">Estado de la cuenta</Text>
          <Text className="mt-1 text-sm text-zu-slate">
            Define si el usuario puede acceder al sistema.
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {ESTADOS_USUARIO.map((estado) => {
              const active = usuario.estado === estado;
              return (
                <Pressable
                  key={estado}
                  disabled={saving}
                  onPress={() => void cambiarEstado(estado)}
                  className={`rounded-xl border px-3 py-2.5 ${
                    active
                      ? 'border-zu-navy bg-zu-navy/10'
                      : 'border-zu-border bg-zu-white'
                  } disabled:opacity-50`}>
                  <Text
                    className={`text-sm font-semibold ${
                      active ? 'text-zu-navy' : 'text-zu-slate'
                    }`}>
                    {estadoLabel[estado]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AdminUsuarioDetalleScreen;
