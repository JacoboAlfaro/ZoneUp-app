/**
 * Tarjeta que avisa que los recordatorios están desactivados y ofrece activarlos. La app
 * funciona igual sin ellos: esto solo le recuerda al conductor lo que se pierde. Si el
 * sistema ya no muestra el diálogo de permiso, el botón abre los Ajustes del teléfono.
 * No se muestra nada si los avisos están activos.
 */

import { BellOff } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useAvisosDesactivados } from '../../notificaciones/usePermisoAvisos';
import { color } from '../../theme';
import Button from '../Button';
import { GlassCard } from '../GlassCard';

export default function AvisosDesactivados() {
  const { desactivados, soloDesdeAjustes, activar } = useAvisosDesactivados();
  if (!desactivados) return null;

  return (
    <GlassCard className="p-4">
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-zu-sky-mid/45">
          <BellOff size={20} color={color.navy} />
        </View>
        <Text className="ml-3 flex-1 text-base font-semibold text-zu-navy">
          Los avisos están desactivados
        </Text>
      </View>

      <Text className="mt-2 text-sm leading-5 text-zu-slate">
        No te avisaremos 5 minutos antes de que venza tu tiempo para llegar ni antes de que
        termine tu parqueo.
      </Text>

      <Button
        text={soloDesdeAjustes ? 'Abrir ajustes' : 'Activar avisos'}
        onPress={() => void activar()}
        secondary
        className="mt-3"
      />
    </GlassCard>
  );
}
