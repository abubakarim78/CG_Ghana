import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Variant = 'default' | 'hero' | 'emergency' | 'officer';

interface ScreenBackgroundProps {
  children?: React.ReactNode;
  variant?: Variant;
}

function getGradientColors(variant: Variant): readonly [string, string, ...string[]] {
  switch (variant) {
    case 'emergency':
      return COLORS.gradient.emergency;
    case 'hero':
      return COLORS.gradient.hero;
    case 'officer':
      return COLORS.gradient.officerDash;
    case 'default':
    default:
      return COLORS.gradient.background;
  }
}

export function ScreenBackground({ children, variant = 'default' }: ScreenBackgroundProps) {
  const gradientColors = getGradientColors(variant);

  const isEmergency = variant === 'emergency';

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradient}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
    >
      {/* Decorative orb 1 — large, top-right, primary */}
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orb1,
          {
            backgroundColor: isEmergency
              ? COLORS.emergency[500]
              : COLORS.primary[500],
          },
        ]}
      />

      {/* Decorative orb 2 — medium, bottom-left, secondary */}
      <View
        pointerEvents="none"
        style={[
          styles.orb,
          styles.orb2,
          {
            backgroundColor: isEmergency
              ? COLORS.emergency[300]
              : COLORS.secondary[500],
          },
        ]}
      />

      {/* Decorative orb 3 — small, center-right, gold */}
      <View
        pointerEvents="none"
        style={[styles.orb, styles.orb3, { backgroundColor: COLORS.gold }]}
      />

      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const ORB_LARGE = SCREEN_WIDTH * 0.72;
const ORB_MEDIUM = SCREEN_WIDTH * 0.52;
const ORB_SMALL = SCREEN_WIDTH * 0.32;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb1: {
    width: ORB_LARGE,
    height: ORB_LARGE,
    top: -ORB_LARGE * 0.35,
    right: -ORB_LARGE * 0.28,
    opacity: 0.07,
  },
  orb2: {
    width: ORB_MEDIUM,
    height: ORB_MEDIUM,
    bottom: -ORB_MEDIUM * 0.25,
    left: -ORB_MEDIUM * 0.25,
    opacity: 0.06,
  },
  orb3: {
    width: ORB_SMALL,
    height: ORB_SMALL,
    top: SCREEN_HEIGHT * 0.42,
    right: -ORB_SMALL * 0.18,
    opacity: 0.05,
  },
  content: {
    flex: 1,
  },
});
