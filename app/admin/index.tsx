import { router, useFocusEffect } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listUsers } from '../../src/api/users';
import Button from '../../src/components/Button';
import DashboardNavTile from '../../src/components/admin/DashboardNavTile';
import DashboardStat from '../../src/components/admin/DashboardStat';
import { useSession } from '../../src/session/context';

export default function AdminPanel() {
  const { user, signOut } = useSession();
  const [totalUsuarios, setTotalUsuarios] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      listUsers()
        .then((users) => {
          if (active) setTotalUsuarios(users.length);
        })
        .catch(() => {
          if (active) setTotalUsuarios(null);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF8FC' }} edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-4"
        showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-semibold uppercase tracking-[3px] text-zu-slogan">
          ZoneUp
        </Text>
        <Text className="mt-2 text-3xl font-bold text-zu-navy">Hola, {user?.name}</Text>
        <Text className="mt-2 text-base leading-6 text-zu-slate">
          Consulta el estado del sistema y gestión de usuarios.
        </Text>

        <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
          Gestionar
        </Text>

        {/* Componente reusable para las tarjetas de navegación */}
        <DashboardNavTile
          icon={Users}
          title="Usuarios"
          subtitle="Ver datos, crear usuarios y cambiar su estado"
          onPress={() => router.push('/admin/(usuarios)/usuarios' )}
        />

        <Button
          text="Cerrar sesión"
          onPress={signOut}
          secondary
          className="mt-8 border-red-400 bg-red-300/60"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
