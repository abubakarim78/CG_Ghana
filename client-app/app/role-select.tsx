import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Flag, Shield, BarChart2, ChevronRight, UserX, Lock } from 'lucide-react-native';
import { useAuthStore } from '../src/store';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GLASS, SHADOW } from '../src/theme';

const { width } = Dimensions.get('window');

interface RoleCard {
  key: 'reporter' | 'officer' | 'admin';
  label: string;
  subtitle: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>;
  color: string;
  borderColor: string;
  glowColor: string;
  route: string;
}

const ROLES: RoleCard[] = [
  {
    key: 'reporter',
    label: 'Report & Track Cases',
    subtitle: 'For community members, teachers, and local leaders',
    Icon: Flag,
    color: COLORS.primary[500],
    borderColor: 'rgba(14,143,168,0.45)',
    glowColor: 'rgba(14,143,168,0.12)',
    route: '/(reporter)',
  },
  {
    key: 'officer',
    label: 'Manage Cases',
    subtitle: 'For social workers and law enforcement officers',
    Icon: Shield,
    color: '#6366F1',
    borderColor: 'rgba(99,102,241,0.45)',
    glowColor: 'rgba(99,102,241,0.12)',
    route: '/(officer)',
  },
  {
    key: 'admin',
    label: 'System Dashboard',
    subtitle: 'For district administrators and managers',
    Icon: BarChart2,
    color: COLORS.gold,
    borderColor: 'rgba(245,166,35,0.40)',
    glowColor: 'rgba(245,166,35,0.10)',
    route: '/(admin)',
  },
];

export default function RoleSelectScreen() {
  const { loginAnonymous } = useAuthStore();

  const handleRoleSelect = (role: RoleCard) => {
    router.push({ pathname: '/login', params: { preselect: role.key } } as any);
  };

  const handleAnonymous = async () => {
    try {
      await loginAnonymous();
      router.replace('/(reporter)' as any);
    } catch {
      // silent — user stays on screen
    }
  };

  return (
    <LinearGradient
      colors={COLORS.gradient.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.6, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* Background decorative orbs */}
      <View style={[styles.orb, styles.orbLeft]} />
      <View style={[styles.orb, styles.orbRight]} />

      {/* Header: logo + brand */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 80 }}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoIconWrap}>
            <Shield size={26} color={COLORS.primary[500]} strokeWidth={1.8} />
          </View>
          <View>
            <Text style={styles.brandName}>ChildGuard</Text>
            <Text style={styles.brandCountry}>Ghana</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Who are you?</Text>
        <Text style={styles.pageSubtitle}>
          Choose your role to sign in and access the right tools for protecting children.
        </Text>
        <Text style={styles.authNotice}>
          Officers and administrators must have a registered account. Community members can report anonymously.
        </Text>
      </MotiView>

      {/* Role cards */}
      <View style={styles.cardsContainer}>
        {ROLES.map((role, index) => (
          <MotiView
            key={role.key}
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: 'timing',
              duration: 420,
              delay: index * 100,
            }}
          >
            <TouchableOpacity
              onPress={() => handleRoleSelect(role)}
              activeOpacity={0.82}
              style={styles.cardTouchable}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: role.glowColor,
                    borderColor: role.borderColor,
                  },
                ]}
              >
                {/* Left icon */}
                <View
                  style={[
                    styles.cardIcon,
                    {
                      backgroundColor: `${role.color}22`,
                      borderColor: `${role.color}44`,
                    },
                  ]}
                >
                  <role.Icon size={28} color={role.color} strokeWidth={1.6} />
                </View>

                {/* Text */}
                <View style={styles.cardText}>
                  <Text style={styles.cardLabel}>{role.label}</Text>
                  <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
                </View>

                {/* Chevron */}
                <View style={styles.cardChevronGroup}>
                  {(role.key === 'officer' || role.key === 'admin') && (
                    <Lock size={12} color={COLORS.text.muted} strokeWidth={2} />
                  )}
                  <View
                    style={[
                      styles.cardChevron,
                      { backgroundColor: `${role.color}18` },
                    ]}
                  >
                    <ChevronRight size={18} color={role.color} strokeWidth={2} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </MotiView>
        ))}
      </View>

      {/* Anonymous link */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 420 }}
        style={styles.anonContainer}
      >
        <TouchableOpacity
          onPress={handleAnonymous}
          activeOpacity={0.75}
          style={styles.anonButton}
        >
          <UserX size={15} color={COLORS.text.muted} strokeWidth={1.8} />
          <Text style={styles.anonText}>Report Anonymously — No Account Needed</Text>
          <ChevronRight size={14} color={COLORS.text.muted} strokeWidth={2} />
        </TouchableOpacity>
      </MotiView>

      {/* Sign In link */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 500 }}
        style={styles.signInContainer}
      >
        <TouchableOpacity
          onPress={() => router.push('/login' as any)}
          activeOpacity={0.75}
        >
          <Text style={styles.signInText}>Already have an account? Sign In →</Text>
        </TouchableOpacity>
      </MotiView>

      {/* Bottom note */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 560 }}
        style={styles.bottomNote}
      >
        <View style={styles.securityBadge}>
          <Shield size={12} color={COLORS.secondary[500]} strokeWidth={2} />
          <Text style={styles.securityText}>End-to-end encrypted · Ghana NCCP compliant</Text>
        </View>
      </MotiView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.base,
  },

  /* Background orbs */
  orb: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  orbLeft: {
    top: -80,
    left: -100,
    backgroundColor: COLORS.primary[500],
    opacity: 0.05,
  },
  orbRight: {
    bottom: 60,
    right: -100,
    backgroundColor: '#6366F1',
    opacity: 0.05,
  },

  /* Header */
  header: {
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl + SPACING.sm,
  },
  logoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(14,143,168,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(14,143,168,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  brandCountry: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  pageTitle: {
    ...TYPOGRAPHY.display,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  pageSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    lineHeight: 22,
    maxWidth: width - SPACING.xl * 2,
  },
  authNotice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginBottom: SPACING.base,
    marginTop: SPACING.sm,
  },

  /* Cards */
  cardsContainer: {
    gap: SPACING.md,
  },
  cardTouchable: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.base,
    minHeight: 80,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    gap: SPACING.xs,
  },
  cardLabel: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 17,
  },
  cardChevronGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexShrink: 0,
  },
  cardChevron: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Anonymous */
  anonContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  anonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
  },
  anonText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.muted,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.text.muted,
  },

  /* Sign In link */
  signInContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  signInText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  /* Bottom security note */
  bottomNote: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(30,154,63,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(30,154,63,0.22)',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
  },
  securityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    fontSize: 11,
  },
});
