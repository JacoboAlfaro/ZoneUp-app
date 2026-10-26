import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { glass } from '@/src/theme';
const RADIO = 28;
export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const liquid =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  const interior = `p-6 ${className ?? ''}`;
  if (liquid) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="clear"
        tintColor={glass.skySoft}
        style={{ borderRadius: RADIO, overflow: 'hidden' }}>
        <View className={interior}>{children}</View>
      </GlassView>
    );
  }
  return (
    <View
      className={`overflow-hidden rounded-[28px] border border-zu-white/55 bg-zu-white/72 ${interior}`}>
      {children}
    </View>
  );
}