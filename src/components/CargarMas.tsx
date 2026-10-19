import { ChevronDown } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface Props {
  /** Cuántos elementos ya se muestran. */
  mostrados: number;
  /** Cuántos coinciden en el servidor. */
  total: number;
  cargando: boolean;
  onPress: () => void;
  /** Si se pasa, el botón no depende del total mostrado (p. ej. lista filtrada). */
  hayMas?: boolean;
}

/** Pie de los listados paginados: cuántos se ven y el botón para traer los siguientes. */
export default function CargarMas({ mostrados, total, cargando, onPress, hayMas }: Props) {
  const mostrarBoton = hayMas ?? mostrados < total;
  if (total === 0 && !mostrarBoton) return null;

  return (
    <View className="mt-5 items-center gap-3">
      <Text className="text-sm text-zu-slate">
        Mostrando {mostrados} de {total}
      </Text>
      {mostrarBoton ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          disabled={cargando}
          className="flex-row items-center gap-2 rounded-xl border border-zu-border bg-zu-white px-5 py-3 active:opacity-80 disabled:opacity-50">
          {cargando ? (
            <ActivityIndicator size="small" color="#1E3A5F" />
          ) : (
            <ChevronDown size={18} color="#1E3A5F" />
          )}
          <Text className="text-sm font-semibold text-zu-navy">
            {cargando ? 'Cargando…' : 'Cargar más'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
