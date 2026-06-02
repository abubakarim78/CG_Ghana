import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useHaptics } from '../../hooks';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface GlassButtonProps {
  onPress: () => void;
  label: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  size?: Size;
}

const SPRING_CONFIG = { damping: 14, stiffness: 280, mass: 0.8 };

const GRADIENT_COLORS: Record<
  Variant,
  readonly [string, string, ...string[]]
> = {
  primary: [COLORS.primary[500], COLORS.primary[700]],
  danger: [COLORS.emergency[500], COLORS.emergency[600]],
  gold: [COLORS.gold, '#C97D0D'],
  secondary: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)'],
  ghost: ['transparent', 'transparent'],
};

const SIZE_STYLES: Record<
  Size,
  { height: number; paddingHorizontal: number; fontSize: number; iconGap: number }
> = {
  sm: { height: 36, paddingHorizontal: SPACING.base, fontSize: 13, iconGap: 6 },
  md: { height: 48, paddingHorizontal: SPACING.xl, fontSize: 15, iconGap: 8 },
  lg: { height: 56, paddingHorizontal: SPACING.xxl, fontSize: 16, iconGap: 10 },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function GlassButton({
  onPress,
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  icon,
  size = 'md',
}: GlassButtonProps) {
  const { selection } = useHaptics();
  const scale = useSharedValue(1);

  const sizeStyle = SIZE_STYLES[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.96, SPRING_CONFIG);
  }

  function handlePressOut() {
    scale.value = withSpring(1.0, SPRING_CONFIG);
  }

  function handlePress() {
    if (loading || disabled) return;
    selection();
    onPress();
  }

  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';
  const useGradient = !isGhost;

  const borderStyle: ViewStyle =
    isGhost
      ? {
          borderWidth: 1,
          borderColor: COLORS.surface.glassBorder,
        }
      : isSecondary
      ? {
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)',
        }
      : {};

  const labelColor: string =
    variant === 'gold'
      ? '#0D1620'
      : variant === 'ghost'
      ? COLORS.text.secondary
      : COLORS.text.primary;

  const labelStyle: TextStyle = {
    fontFamily: TYPOGRAPHY.bodySemi.fontFamily,
    fontSize: sizeStyle.fontSize,
    lineHeight: sizeStyle.fontSize * 1.4,
    color: labelColor,
  };

  const containerStyle: ViewStyle = {
    height: sizeStyle.height,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: RADIUS.xl,
    opacity: disabled && !loading ? 0.46 : 1,
    overflow: 'hidden',
    ...borderStyle,
  };

  const innerContent = (
    <View style={styles.inner} pointerEvents="none">
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'gold' ? '#0D1620' : COLORS.text.primary}
        />
      ) : (
        <>
          {icon && (
            <View style={{ marginRight: sizeStyle.iconGap }}>{icon}</View>
          )}
          <Text style={labelStyle} numberOfLines={1}>
            {label}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled || loading}
      style={[animatedStyle, style]}
    >
      {useGradient ? (
        <LinearGradient
          colors={GRADIENT_COLORS[variant]}
          style={containerStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {innerContent}
        </LinearGradient>
      ) : (
        <View style={containerStyle}>{innerContent}</View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
