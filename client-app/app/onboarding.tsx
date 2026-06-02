import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store';
import { Shield, Users, BookOpen } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../src/theme';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
  bgColors: readonly [string, string];
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    Icon: Shield,
    iconBg: 'rgba(14,143,168,0.18)',
    iconBorder: 'rgba(14,143,168,0.50)',
    title: 'Report Safely',
    subtitle:
      'Report child labour and trafficking cases quickly and securely, even anonymously.',
    bgColors: ['#0A2E1A', '#0D1B2A'],
    accentColor: COLORS.primary[500],
  },
  {
    id: '2',
    Icon: Users,
    iconBg: 'rgba(99,102,241,0.18)',
    iconBorder: 'rgba(99,102,241,0.50)',
    title: 'Track Every Case',
    subtitle:
      'Follow your report from submission through investigation to resolution.',
    bgColors: ['#0D1B2A', '#1A1500'],
    accentColor: '#6366F1',
  },
  {
    id: '3',
    Icon: BookOpen,
    iconBg: 'rgba(245,166,35,0.16)',
    iconBorder: 'rgba(245,166,35,0.45)',
    title: 'Protect Together',
    subtitle:
      'Join thousands of community members protecting children across Ghana.',
    bgColors: ['#1A1500', '#041220'],
    accentColor: COLORS.gold,
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);
  const { setOnboarded } = useAuthStore();

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    } else {
      setOnboarded();
      router.replace('/role-select');
    }
  };

  const handleSkip = () => {
    setOnboarded();
    router.replace('/role-select');
  };

  const onMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const renderSlide = ({ item }: ListRenderItemInfo<Slide>) => {
    const { Icon, iconBg, iconBorder, title, subtitle, bgColors, accentColor } = item;
    return (
      <LinearGradient
        colors={bgColors}
        style={styles.slide}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      >
        {/* Background shimmer orbs */}
        <View
          style={[
            styles.slideOrb,
            styles.slideOrbTop,
            { backgroundColor: accentColor },
          ]}
        />
        <View
          style={[
            styles.slideOrb,
            styles.slideOrbBottom,
            { backgroundColor: accentColor },
          ]}
        />

        <View style={styles.slideContent}>
          {/* Icon container */}
          <MotiView
            from={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            style={styles.iconOuterRing}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: iconBg, borderColor: iconBorder },
              ]}
            >
              <Icon size={56} color={accentColor} strokeWidth={1.5} />
            </View>
            {/* Decorative ring */}
            <View
              style={[
                styles.iconDecorRing,
                { borderColor: `${accentColor}28` },
              ]}
            />
          </MotiView>

          {/* Text content */}
          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 480, delay: 120 }}
            style={styles.textBlock}
          >
            <Text style={styles.slideTitle}>{title}</Text>
            <Text style={styles.slideSubtitle}>{subtitle}</Text>
          </MotiView>

          {/* Accent line */}
          <MotiView
            from={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 500, delay: 250 }}
            style={[styles.accentLine, { backgroundColor: accentColor }]}
          />
        </View>
      </LinearGradient>
    );
  };

  const isLast = activeIndex === SLIDES.length - 1;
  const currentAccent = SLIDES[activeIndex].accentColor;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Bottom controls overlay */}
      <View style={styles.bottomOverlay}>
        <LinearGradient
          colors={['transparent', 'rgba(4,18,32,0.92)', '#041220']}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        <View style={styles.controls}>
          {/* Progress dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <MotiView
                key={i}
                animate={{
                  width: i === activeIndex ? 28 : 8,
                  backgroundColor:
                    i === activeIndex ? currentAccent : COLORS.text.muted,
                  opacity: i === activeIndex ? 1 : 0.45,
                }}
                transition={{ type: 'timing', duration: 260 }}
                style={styles.dot}
              />
            ))}
          </View>

          {/* Action row */}
          <View style={styles.actionRow}>
            {/* Skip */}
            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Next / Get Started */}
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.85}
              style={styles.nextButtonWrapper}
            >
              <LinearGradient
                colors={
                  isLast
                    ? [COLORS.gold, '#D4891A']
                    : [COLORS.primary[500], COLORS.primary[700]]
                }
                style={styles.nextButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.nextButtonText}>
                  {isLast ? 'Get Started' : 'Next'}
                </Text>
                <View style={styles.nextArrow}>
                  <Text style={styles.nextArrowText}>›</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#041220',
  },

  /* Slide */
  slide: {
    width,
    height,
    overflow: 'hidden',
  },
  slideOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.06,
  },
  slideOrbTop: {
    top: -50,
    right: -50,
  },
  slideOrbBottom: {
    bottom: 120,
    left: -70,
    opacity: 0.05,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingBottom: 180,
  },

  /* Icon */
  iconOuterRing: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl + SPACING.base,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    // Glass effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconDecorRing: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1,
  },

  /* Text */
  textBlock: {
    alignItems: 'center',
  },
  slideTitle: {
    ...TYPOGRAPHY.display,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.base,
    letterSpacing: 0.4,
  },
  slideSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  accentLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginTop: SPACING.xl,
  },

  /* Bottom overlay */
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    height: 160,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controls: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl + SPACING.sm,
    paddingTop: SPACING.sm,
    gap: SPACING.lg,
  },

  /* Dots */
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  /* Action row */
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
  },
  skipText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.muted,
  },

  /* Next button */
  nextButtonWrapper: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    paddingLeft: SPACING.xl,
    paddingRight: SPACING.base,
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
  },
  nextButtonText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.primary,
    fontSize: 15,
  },
  nextArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextArrowText: {
    color: COLORS.text.primary,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
    marginLeft: 1,
  },
});
