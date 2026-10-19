import { Search, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, TextInput, View, type TextInputProps } from 'react-native';

interface Props {
  value: string;
  onChangeText: (texto: string) => void;
  /** Busca sin esperar a que el usuario deje de escribir (tecla "buscar" del teclado). */
  onBuscar: () => void;
  /** Borra el texto y vuelve al listado completo. */
  onLimpiar: () => void;
  placeholder: string;
  /** Muestra que el servidor está respondiendo una búsqueda. */
  buscando?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  className?: string;
}

/**
 * Buscador de los listados. Solo maneja el texto: la búsqueda la hace el
 * servidor cuando el usuario termina de escribir (ver `useListaPaginada`).
 */
export default function CampoBusqueda({
  value,
  onChangeText,
  onBuscar,
  onLimpiar,
  placeholder,
  buscando,
  autoCapitalize = 'none',
  className,
}: Props) {
  return (
    <View
      className={`flex-row items-center rounded-2xl border border-zu-border bg-zu-white/90 px-4 ${className ?? ''}`}>
      <Search size={20} color="#6B8698" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onBuscar}
        placeholder={placeholder}
        placeholderTextColor="#6B8698"
        selectionColor="#6BB8E8"
        underlineColorAndroid="transparent"
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        returnKeyType="search"
        className="flex-1 py-3.5 pl-3 text-base text-zu-navy"
      />
      {buscando ? <ActivityIndicator size="small" color="#6B8698" className="mr-2" /> : null}
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          hitSlop={10}
          onPress={onLimpiar}
          className="p-1">
          <X size={19} color="#6B8698" />
        </Pressable>
      ) : null}
    </View>
  );
}
