import { useNavigation } from 'expo-router';
import { useSession } from '@/src/session/context';

export function useConductorIndex() {
  const { user } = useSession();
  // El index está DENTRO del Stack; openDrawer vive en el layout padre.
  const navigation = useNavigation('/conductor');

  const abrirDrawer = () => {
    (navigation as { openDrawer?: () => void }).openDrawer?.();
  };

  return { user, abrirDrawer };
}