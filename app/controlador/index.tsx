import { router, useFocusEffect } from 'expo-router';
import { ClipboardCheck } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listReservasDeZonas } from '../../src/api/reservas';
import { listZonas } from '../../src/api/zonas';
import Button from '../../src/components/Button';
import FormError from '../../src/components/FormError';
import DashboardNavTile from '../../src/components/admin/DashboardNavTile';
import DashboardStat from '../../src/components/admin/DashboardStat';
import { useSession } from '../../src/session/context';
import type { ReservaDeZona } from '../../src/types';

export default function ControladorPanel() {
  const { user, signOut } = useSession();
  const [items, setItems] = useState<ReservaDeZona[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setError(null);

      // No hay lista global de reservas: se consultan todas las zonas.
      listZonas()
        .then((zonas) => listReservasDeZonas(zonas.map((zona) => zona.id)))
        .then((reservas) => {
          if (active) setItems(reservas);
        })
        .catch((cause) => {
          if (active) setError((cause as Error).message);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const contar = (estado: ReservaDeZona['reserva']['estado']) =>
    items ? items.filter((item) => item.reserva.estado === estado).length : '…';
  const porRevisar = contar('pendiente');

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
          Atiende las solicitudes de reserva de las zonas azules y confirma la llegada de los
          vehículos.
        </Text>

        <View className="mt-6 flex-row gap-3">
          <DashboardStat
            value={porRevisar}
            label="Por revisar"
            valueClassName="text-amber-700"
          />
          <DashboardStat
            value={contar('activa')}
            label="Aceptadas"
            valueClassName="text-emerald-700"
          />
          <DashboardStat value={items ? items.length : '…'} label="Total de reservas" />
        </View>

        {error ? (
          <View className="mt-4">
            <FormError message={error} />
          </View>
        ) : null}

        <Text className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[2px] text-zu-navy/50">
          Gestionar
        </Text>

        <DashboardNavTile
          icon={ClipboardCheck}
          title="Gestión de reservas"
          subtitle={
            typeof porRevisar === 'number' && porRevisar > 0
              ? `${porRevisar} por revisar · aceptar, rechazar y verificar placas`
              : 'Aceptar, rechazar y verificar placas'
          }
          onPress={() => router.push('/controlador/(reservas)/reservas')}
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
