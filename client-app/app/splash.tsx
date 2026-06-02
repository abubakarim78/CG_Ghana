import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../src/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={COLORS.gradient.splash}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative orbs */}
      <View style={[styles.orb, styles.orbTopLeft]} />
      <View style={[styles.orb, styles.orbTopRight]} />
      <View style={[styles.orb, styles.orbBottomCenter]} />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Shield icon circle */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            delay: 200,
            stiffness: 180,
            damping: 15,
          }}
          style={styles.iconWrapper}
        >
          <View style={styles.iconCircleOuter}>
            <View style={styles.iconCircleInner}>
              <Shield
                size={52}
                color={COLORS.primary[500]}
                strokeWidth={1.5}
              />
            </View>
          </View>
          {/* Pulse ring */}
          <MotiView
            from={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{
              type: 'timing',
              duration: 1600,
              delay: 800,
              loop: true,
            }}
            style={styles.pulseRing}
          />
        </MotiView>

        {/* App name */}
        <MotiText
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 600 }}
          style={styles.appName}
        >
          ChildGuard
        </MotiText>

        {/* Ghana */}
        <MotiText
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 800 }}
          style={styles.appNameGold}
        >
          Ghana
        </MotiText>

        {/* Tagline */}
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 1000 }}
          style={styles.tagline}
        >
          Protecting Children Through Safe Reporting
        </MotiText>
      </View>

      {/* Version / bottom badge */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 1400 }}
        style={styles.bottomBadge}
      >
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Secure & Confidential</Text>
        <View style={styles.badgeDot} />
      </MotiView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Decorative background orbs */
  orb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  orbTopLeft: {
    top: -60,
    left: -60,
    backgroundColor: COLORS.primary[500],
    opacity: 0.07,
  },
  orbTopRight: {
    top: height * 0.12,
    right: -80,
    backgroundColor: COLORS.secondary[500],
    opacity: 0.06,
  },
  orbBottomCenter: {
    bottom: -70,
    left: width / 2 - 100,
    backgroundColor: COLORS.gold,
    opacity: 0.05,
  },

  /* Center layout */
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },

  /* Icon */
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircleOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(14,143,168,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(14,143,168,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },

  /* Typography */
  appName: {
    ...TYPOGRAPHY.display,
    color: COLORS.text.primary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  appNameGold: {
    ...TYPOGRAPHY.h2,
    color: COLORS.gold,
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },

  /* Bottom badge */
  bottomBadge: {
    position: 'absolute',
    bottom: SPACING.xxl + SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.secondary[500],
    opacity: 0.7,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
