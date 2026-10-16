import { router } from 'expo-router';
import { useSession } from '@/src/session/context';

type DrawerNav = { closeDrawer: () => void };

export function useConductorDrawer(navigation: DrawerNav) {
  const { user, signOut } = useSession();

  const ir = (href: string) => {
    navigation.closeDrawer();
    router.push(href as never);
  };

  return {
    user,
    irAReservar: () => ir('/conductor/(reservas)/zonas'),
    irAReservas: () => ir('/conductor/(reservas)/reservas'),
    irAPerfil: () => ir('/conductor/(usuarios)'),
    irAVehiculos: () => ir('/conductor/(vehiculos)'),
    cerrarSesion: signOut,
  };
}