import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GLASS,
  BLUR_INTENSITY,
  GLASS_BLUR_TINT,
  SHADOW,
  COLORS,
} from '../../theme';

type Variant = 'default' | 'elevated' | 'emergency' | 'gold' | 'success';

interface GlassCardProps {
  children?: React.ReactNode;
  variant?: Variant;
  style?: ViewStyle;
  onPress?: () => void;
  activeOpacity?: number;
}

/** Bumps the alpha channel of an rgba(...) string by `delta` (clamped to 1). */
function bumpAlpha(rgba: string, delta: number): string {
  const match = rgba.match(
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/
  );
  if (!match) return rgba;
  const [, r, g, b, a] = match;
  const newAlpha = Math.min(1, parseFloat(a) + delta);
  return `rgba(${r},${g},${b},${newAlpha})`;
}

export function GlassCard({
  children,
  variant = 'default',
  style,
  onPress,
  activeOpacity = 0.85,
}: GlassCardProps) {
  const glassStyle = GLASS[variant];
  const shadow = SHADOW.md ?? {};

  const androidBg = bumpAlpha(glassStyle.backgroundColor, 0.15);

  const cardContent =
    Platform.OS === 'ios' ? (
      <BlurView
        intensity={BLUR_INTENSITY}
        tint={GLASS_BLUR_TINT}
        style={[styles.blurContainer, glassStyle, style]}
      >
        <LinearGradient
          colors={COLORS.gradient.cardGlass}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        {children}
      </BlurView>
    ) : (
      <View
        style={[
          styles.androidContainer,
          glassStyle,
          { backgroundColor: androidBg },
          style,
        ]}
      >
        {children}
      </View>
    );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={shadow}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={shadow}>{cardContent}</View>;
}

const styles = StyleSheet.create({
  blurContainer: {
    overflow: 'hidden',
  },
  androidContainer: {
    overflow: 'hidden',
  },
});
