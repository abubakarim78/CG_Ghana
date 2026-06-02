/**
 * react-native-reanimated mock for Expo Go compatibility.
 * Delegates to React Native's built-in Animated API so all usages
 * compile and run without the native Worklets TurboModule.
 */
const { Animated, Easing, View, Text, Image, ScrollView } = require('react-native');

// Shared value shim — plain object with .value
function useSharedValue(initial) {
  const ref = require('react').useRef(initial);
  return { get value() { return ref.current; }, set value(v) { ref.current = v; } };
}

function useAnimatedStyle() { return {}; }
function useAnimatedProps() { return {}; }
function useAnimatedScrollHandler() { return {}; }

const passthrough = (v) => v;
const noop = () => {};

module.exports = {
  default: Animated,
  // Animated wrappers
  View: Animated.View,
  Text: Animated.Text,
  Image: Animated.Image,
  ScrollView: Animated.ScrollView,
  createAnimatedComponent: Animated.createAnimatedComponent,
  // Hooks
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useDerivedValue: useSharedValue,
  useAnimatedRef: () => require('react').useRef(null),
  // Spring / timing helpers — return the value immediately (no animation in Go)
  withSpring: passthrough,
  withTiming: passthrough,
  withDelay: (_delay, anim) => anim,
  withRepeat: (anim) => anim,
  withSequence: (...anims) => anims[anims.length - 1],
  withDecay: passthrough,
  cancelAnimation: noop,
  // Interpolation
  interpolate: (_val, _input, output) => output[0],
  interpolateColor: (_val, _input, output) => output[0],
  Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
  Easing,
  // Layout animations — no-op
  FadeIn: { duration: noop, delay: noop, easing: noop, springify: noop },
  FadeOut: { duration: noop, delay: noop },
  SlideInRight: { duration: noop, delay: noop },
  SlideOutLeft: { duration: noop, delay: noop },
  SlideInUp: { duration: noop, delay: noop },
  SlideOutDown: { duration: noop, delay: noop },
  ZoomIn: { duration: noop, delay: noop },
  ZoomOut: { duration: noop, delay: noop },
  BounceIn: { duration: noop, delay: noop },
  // runOnJS / runOnUI — just call the function
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  // measure
  measure: noop,
};
