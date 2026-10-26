
import { router, type Href } from 'expo-router';
import { useSession } from '@/src/session/context';

type DrawerNav = {
  closeDrawer: () => void;
};

export function useConductorDrawer(navigation: DrawerNav) {
  const { user, signOut } = useSession();

  const ir = (href: Href) => {
    navigation.closeDrawer();
    router.push(href);
  };

  return {
    user,
    irAReservar: () => ir('/conductor/(panel)/(reservas)/zonas'),
    irAReservas: () => ir('/conductor/(panel)/(reservas)/reservas'),
    irAPerfil: () => ir('/conductor/(panel)/(usuarios)'),
    irAVehiculos: () => ir('/conductor/(panel)/(vehiculos)'),
    cerrarSesion: signOut,
  };
}
