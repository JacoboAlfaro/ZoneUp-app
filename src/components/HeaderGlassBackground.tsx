import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Platform, StyleSheet, View } from 'react-native';

const TINT_IOS = 'rgba(238, 248, 252, 0.42)';
const TINT_ANDROID = 'rgba(238, 248, 252, 0.78)';

export function HeaderGlassBackground() {
  const liquid =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  if (liquid) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="regular"
        tintColor={TINT_IOS}
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
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: TINT_ANDROID,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: 'rgba(197, 213, 224, 0.55)',
        },
      ]}
    />
  );
}

export const headerGlassScreenOptions = {
  headerTransparent: false,
  headerShadowVisible: false,
  headerTintColor: '#1E3A5F',
  headerTitleStyle: { fontWeight: '600' as const, color: '#1E3A5F' },
  headerStyle: { backgroundColor: 'transparent' },
  headerBackground: () => <HeaderGlassBackground />,
};
