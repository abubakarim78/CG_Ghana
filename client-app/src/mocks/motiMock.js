/**
 * Moti mock for Expo Go compatibility.
 * Replaces animated components with plain RN counterparts so the app runs
 * without a native development build.
 */
const React = require('react');
const { View, Text, Image, ScrollView } = require('react-native');

function AnimatePresence({ children }) {
  return children;
}

module.exports = {
  MotiView: View,
  MotiText: Text,
  MotiImage: Image,
  MotiScrollView: ScrollView,
  AnimatePresence,
  motify: (Component) => Component,
  useMotify: () => ({}),
  useAnimationState: () => ({
    current: 'from',
    transitionTo: () => {},
  }),
  useDynamicAnimation: () => ({
    current: {},
    animateTo: () => {},
  }),
};
