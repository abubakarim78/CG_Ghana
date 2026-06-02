import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Home, Flag, Search, BookOpen } from 'lucide-react-native';
type BottomTabBarProps = {
  state: { index: number; routes: Array<{ key: string; name: string; params?: Record<string, unknown> }> };
  descriptors: Record<string, { options: { tabBarLabel?: React.ReactNode; title?: string; tabBarAccessibilityLabel?: string } }>;
  navigation: { emit: (e: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean }; navigate: (name: string, params?: unknown) => void };
};
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  BLUR_INTENSITY,
  SHADOW,
} from '../../theme';

const SPRING_CONFIG = { damping: 16, stiffness: 300, mass: 0.7 };

const TAB_ICONS = [Home, Flag, Search, BookOpen];

const TAB_HEIGHT = 64;
const INDICATOR_WIDTH = 28;
const INDICATOR_HEIGHT = 3;

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // One animated dot per tab — we animate the active one's opacity to 1, rest to 0.
  // Simpler than trying to translate a single indicator across unknown tab widths.
  const dotOpacities = state.routes.map((_: unknown, i: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSharedValue(i === state.index ? 1 : 0)
  );

  // Sync dot opacities when active index changes.
  React.useEffect(() => {
    state.routes.forEach((_: unknown, i: number) => {
      dotOpacities[i].value = withSpring(
        i === state.index ? 1 : 0,
        SPRING_CONFIG
      );
    });
    // dotOpacities is stable (same array reference), only state.index changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index]);

  const tabBar = (
    <View style={[styles.container, SHADOW.lg]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={BLUR_INTENSITY} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}

      {/* Background scrim */}
      <View style={styles.scrim} pointerEvents="none" />

      {/* Tab items */}
      <View style={styles.row}>
        {state.routes.map((route: { key: string; name: string; params?: Record<string, unknown> }, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? String(options.tabBarLabel)
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const IconComponent = TAB_ICONS[index] ?? Home;
          const iconColor = isFocused ? COLORS.primary[500] : COLORS.text.muted;
          const labelColor = isFocused ? COLORS.primary[500] : COLORS.text.muted;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          function onLongPress() {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          }

          // eslint-disable-next-line react-hooks/rules-of-hooks
          const dotAnimStyle = useAnimatedStyle(() => ({
            opacity: dotOpacities[index].value,
            transform: [
              {
                scaleX: withSpring(
                  dotOpacities[index].value > 0.5 ? 1 : 0.5,
                  SPRING_CONFIG
                ),
              },
            ],
          }));

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.75}
              style={styles.tab}
            >
              <IconComponent
                size={22}
                color={iconColor}
                strokeWidth={isFocused ? 2.2 : 1.8}
              />
              <Text
                style={[styles.label, { color: labelColor }]}
                numberOfLines={1}
              >
                {label}
              </Text>

              {/* Gold animated indicator dot */}
              <Animated.View style={[styles.indicator, dotAnimStyle]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return tabBar;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.xl,
    right: SPACING.xl,
    height: TAB_HEIGHT,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    backgroundColor:
      Platform.OS === 'android' ? 'rgba(13,22,32,0.90)' : 'transparent',
  },
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,18,32,0.52)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: 3,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    lineHeight: 14,
  },
  indicator: {
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    marginTop: 2,
  },
});
