import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Platform, StyleSheet, View } from 'react-native';

import { color, glass } from '@/src/theme';

export function HeaderGlassBackground() {
  const liquid =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  if (liquid) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="regular"
        tintColor={glass.skySoft}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={70}
        tint="systemThinMaterialLight"
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      className="border-b border-zu-border/55 bg-zu-sky-fade/78"
      style={StyleSheet.absoluteFill}
    />
  );
}

export const headerGlassScreenOptions = {
  headerTransparent: false,
  headerShadowVisible: false,
  get headerTintColor() {
    return color.navy;
  },
  get headerTitleStyle() {
    return { fontWeight: '600' as const, color: color.navy };
  },
  headerStyle: { backgroundColor: 'transparent' },
  headerBackground: () => <HeaderGlassBackground />,
};
