import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, Pressable, View } from 'react-native';

import { glass } from '@/src/theme';
import { VidrioRespaldo } from './glass/VidrioRespaldo';

const RADIO = 16;

/** Color, borde y radio los pone el vidrio; className es margen, padding y flex. */
function partirClases(className?: string) {
  const tokens = (className ?? '').split(/\s+/).filter(Boolean);
  const cromo = /^(bg-|border-|rounded-|shadow-)/;
  const fuera = /^(m[trblxy]?-|flex-1$|min-h-|opacity-|self-|w-full$)/;
  return {
    exterior: tokens.filter((t) => !cromo.test(t) && fuera.test(t)).join(' '),
    interior: tokens.filter((t) => !cromo.test(t) && !fuera.test(t)).join(' '),
  };
}

export function GlassCard({
  children,
  className,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const liquid =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  const { exterior, interior } = partirClases(className);
  const contenido = <View className={interior}>{children}</View>;

  const cromo = liquid ? (
    <GlassView
      isInteractive={Boolean(onPress)}
      colorScheme="light"
      glassEffectStyle="clear"
      tintColor={glass.white}
      style={{ borderRadius: RADIO, overflow: 'hidden' }}>
      {contenido}
    </GlassView>
  ) : (
    <VidrioRespaldo tint={glass.white} radius={RADIO} intensity={40}>
      {contenido}
    </VidrioRespaldo>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={disabled ? { disabled: true } : undefined}
        className={`overflow-hidden rounded-2xl active:opacity-80 disabled:opacity-50 ${exterior}`}>
        {cromo}
      </Pressable>
    );
  }

  return <View className={`overflow-hidden rounded-2xl ${exterior}`}>{cromo}</View>;
}
