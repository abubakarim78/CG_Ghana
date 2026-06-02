import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

const BUTTON_SIZE = 64;
const RING_COUNT = 3;
const RING_PERIOD = 1400;

function PulseRing({ delay }: { delay: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(2.5, { duration: RING_PERIOD }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: RING_PERIOD }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, animatedStyle]} />;
}

export function EmergencyFAB() {
  const handlePress = () => {
    router.push('/(modals)/emergency');
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Pulse rings */}
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <PulseRing key={i} delay={i * (RING_PERIOD / RING_COUNT)} />
      ))}

      {/* Main button */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={styles.button}
      >
        <AlertTriangle
          size={28}
          color={COLORS.text.primary}
          strokeWidth={2.5}
          fill="none"
        />
        <Text style={styles.label}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.xl + SPACING.base,
    right: SPACING.base,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.emergency['500'],
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: COLORS.emergency['500'],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    shadowColor: COLORS.emergency['500'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 10,
  },
  label: {
    fontFamily: FONTS.heading,
    fontSize: 10,
    lineHeight: 12,
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
});
