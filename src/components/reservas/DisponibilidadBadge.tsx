import { Text, View } from 'react-native';

import type { ZonaAzul } from '../../types';

/**
 * Los mismos colores del mapa descritos en el manual: azul con varios cupos,
 * amarillo con pocos y gris sin cupo (no se puede reservar).
 */
type Disponibilidad = 'varios' | 'pocos' | 'sin_cupo';

function disponibilidadDe(zona: ZonaAzul): Disponibilidad {
  if (zona.capacidad <= 0) return 'sin_cupo';
  if (zona.capacidad <= 2 || zona.capacidad <= zona.capacidad_total * 0.25) return 'pocos';
  return 'varios';
}

const estilos: Record<Disponibilidad, { label: string; fondo: string; texto: string }> = {
  varios: { label: 'Con cupos', fondo: 'bg-sky-100', texto: 'text-sky-900' },
  pocos: { label: 'Pocos cupos', fondo: 'bg-amber-100', texto: 'text-amber-800' },
  sin_cupo: { label: 'Sin cupo', fondo: 'bg-slate-200', texto: 'text-slate-700' },
};

interface Props {
  zona: ZonaAzul;
}

export default function DisponibilidadBadge({ zona }: Props) {
  const { label, fondo, texto } = estilos[disponibilidadDe(zona)];

  return (
    <View className={`rounded-full px-2.5 py-1 ${fondo}`}>
      <Text className={`text-xs font-semibold ${texto}`}>{label}</Text>
    </View>
  );
}
