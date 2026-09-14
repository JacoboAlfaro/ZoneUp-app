import type { ComponentType } from 'react';
import { Pressable, Text } from 'react-native';

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
}>;

interface Props {
  text: string;
  onPress: () => void;
  /** Se ve apagado y deja de responder. Útil mientras se envía un formulario. */
  disabled?: boolean;
  /** Variante secundaria: borde en vez de fondo lleno. */
  secondary?: boolean;
  icon?: IconComponent;
  iconColor?: string;
  iconSize?: number;
  className?: string;
}

export default function Button({
  text,
  onPress,
  disabled,
  secondary,
  icon: Icon,
  iconColor,
  iconSize = 20,
  className,
}: Props) {
  const contentColor = iconColor ?? (secondary ? '#404040' : '#FFFFFF');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-2 rounded-xl p-4 active:opacity-80 disabled:opacity-50 ${
        secondary ? 'border border-neutral-300' : 'bg-blue-600'
      } ${className ?? ''}`}>
      {Icon ? <Icon size={iconSize} color={contentColor} /> : null}
      <Text className={`font-semibold ${secondary ? 'text-neutral-700' : 'text-white'}`}>
        {text}
      </Text>
    </Pressable>
  );
}
