import { Text, View } from 'react-native';

import type { EstadoReserva } from '../../types';

const estilos: Record<EstadoReserva, { label: string; fondo: string; texto: string }> = {
  pendiente: { label: 'Pendiente', fondo: 'bg-amber-100', texto: 'text-amber-800' },
  activa: { label: 'Activa', fondo: 'bg-emerald-100', texto: 'text-emerald-800' },
  completada: { label: 'Completada', fondo: 'bg-sky-100', texto: 'text-sky-900' },
  cancelada: { label: 'Cancelada', fondo: 'bg-red-100', texto: 'text-red-700' },
};

interface Props {
  estado: EstadoReserva;
}

export default function EstadoReservaBadge({ estado }: Props) {
  const { label, fondo, texto } = estilos[estado];

  return (
    <View className={`rounded-full px-2.5 py-1 ${fondo}`}>
      <Text className={`text-xs font-semibold ${texto}`}>{label}</Text>
    </View>
  );
}
