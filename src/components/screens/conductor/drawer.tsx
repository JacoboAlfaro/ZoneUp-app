import { CalendarClock, Car, LogOut, MapPin, User } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { useConductorDrawer } from '@/src/hooks/conductor/useConductorDrawer';
import { LiquidButton } from '../../LiquidButton';

const AreaSegura = withUniwind(SafeAreaView);

type Props = {
  navigation: {
    closeDrawer: () => void;
  };
};

export default function ConductorDrawer({ navigation }: Props) {
  const {
    user,
    irAReservar,
    irAReservas,
    irAPerfil,
    irAVehiculos,
    cerrarSesion,
  } = useConductorDrawer(navigation);

  return (
    <AreaSegura className="flex-1 bg-zu-sky-fade/90" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 pt-4">
        <Text className="text-xs font-semibold uppercase tracking-[3px] text-zu-slogan">
          ZoneUp
        </Text>
        <Text className="mt-2 text-2xl font-bold text-zu-navy">{user?.name}</Text>
        <Text className="mt-1 text-base text-zu-slate">{user?.email}</Text>

        <View className="mt-6 gap-3">
          <LiquidButton text="Reservar zona azul" icon={MapPin} onPress={irAReservar} />
          <LiquidButton text="Mis reservas" icon={CalendarClock} onPress={irAReservas} />
          <LiquidButton text="Mi perfil" icon={User} onPress={irAPerfil} />
          <LiquidButton text="Mis vehículos" icon={Car} onPress={irAVehiculos} />
          <LiquidButton
            text="Cerrar sesión"
            icon={LogOut}
            destructive
            onPress={cerrarSesion}
          />
        </View>
      </ScrollView>
    </AreaSegura>
  );
}