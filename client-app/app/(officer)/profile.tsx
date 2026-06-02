import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store';
import { GlassCard } from '../../src/components/glass/GlassCard';
import { SUPPORTED_LANGUAGES } from '../../src/i18n';
import i18n from '../../src/i18n';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, FONTS } from '../../src/theme';
import {
  Shield,
  Award,
  Globe,
  Bell,
  LogOut,
  CheckCircle,
  Phone,
  Star,
  Lock,
  Eye,
  UserCircle,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import { useCasesStore } from '../../src/store';

const EMERGENCY_CONTACTS = [
  { name: 'ChildLine Ghana', number: '116' },
  { name: 'Police Emergency', number: '191' },
  { name: 'Social Welfare', number: '0302-666-441' },
];

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  tw: 'Twi',
  ga: 'Ga',
};

export default function OfficerProfileScreen() {
  const { user, language, setLanguage, signOut } = useAuthStore();
  const officers = useCasesStore((s) => s.officers);

  const [autoEscalation, setAutoEscalation] = useState(true);
  const [priorityNotifications, setPriorityNotifications] = useState(true);

  const officerData = officers.find((o: any) => o.id === user?.officerId) ?? officers[0];

  const getInitials = (): string => {
    const name = officerData?.name ?? user?.name ?? '';
    const parts = name.trim().split(' ');
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
    return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
  };

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code as 'en' | 'tw' | 'ga');
  };

  const handleCallContact = (name: string, number: string) => {
    Alert.alert(
      `Calling ${name}`,
      `Dialling ${number}...\n\n(Demo mode — real calls not placed)`,
      [{ text: 'OK' }]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          "ChildGuard Ghana — Report child labour and trafficking safely and anonymously. Download now to help protect Ghana's children.",
        title: 'ChildGuard Ghana',
      });
    } catch (_) {
      // user dismissed share sheet — no-op
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/role-select');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={COLORS.gradient.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SCREEN HEADER ── */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Officer Profile</Text>
        </View>

        {/* ── 1. OFFICER PROFILE CARD ── */}
        <GlassCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            {/* Avatar */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{getInitials()}</Text>
            </View>

            {/* Info */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {officerData?.name ?? user?.name ?? 'Officer'}
              </Text>

              {/* OFFICER badge pill */}
              <View style={styles.officerBadgePill}>
                <Text style={styles.officerBadgePillText}>OFFICER</Text>
              </View>

              {/* Badge number */}
              {officerData?.badge && (
                <Text style={styles.badgeNumber}>{officerData.badge}</Text>
              )}

              {/* District / Region */}
              {officerData && (
                <Text style={styles.districtText}>
                  {officerData.district}, {officerData.region}
                </Text>
              )}
            </View>
          </View>

          {/* Caseload row */}
          {officerData && (
            <View style={styles.caseloadRow}>
              <View style={styles.caseloadItem}>
                <Text style={styles.caseloadNumber}>{officerData.caseload}</Text>
                <Text style={styles.caseloadLabel}>Active Cases</Text>
              </View>
              <View style={styles.caseloadDivider} />
              <View style={styles.caseloadItem}>
                <Text style={[styles.caseloadNumber, styles.caseloadResolved]}>
                  {officerData.resolvedThisMonth}
                </Text>
                <Text style={styles.caseloadLabel}>Resolved This Month</Text>
              </View>
            </View>
          )}
        </GlassCard>

        {/* ── 2. LANGUAGE ── */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Globe size={16} color={COLORS.primary[300]} />
            <Text style={styles.sectionTitle}>Language</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Choose your preferred language</Text>

          <View style={styles.divider} />

          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.row, isActive && styles.rowActive]}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Text style={[styles.rowLabel, isActive && styles.rowLabelActive]}>
                    {lang.label}
                  </Text>
                  {lang.nativeLabel !== lang.label && (
                    <Text style={styles.rowSubLabel}>{lang.nativeLabel}</Text>
                  )}
                </View>
                {isActive && <CheckCircle size={20} color={COLORS.primary[500]} />}
              </TouchableOpacity>
            );
          })}
        </GlassCard>

        {/* ── 3. CASE MANAGEMENT ── */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Shield size={16} color={COLORS.primary[300]} />
            <Text style={styles.sectionTitle}>Case Management</Text>
          </View>

          <View style={styles.divider} />

          {/* Auto-escalation alerts */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Bell size={18} color={COLORS.text.secondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Auto-escalation alerts</Text>
              <Text style={styles.rowSubLabel}>
                Alert me when cases exceed time thresholds
              </Text>
            </View>
            <Switch
              value={autoEscalation}
              onValueChange={setAutoEscalation}
              trackColor={{ false: COLORS.neutral[700], true: COLORS.primary[500] }}
              thumbColor={autoEscalation ? COLORS.primary[300] : COLORS.neutral[400]}
            />
          </View>

          <View style={styles.internalDivider} />

          {/* Priority notifications */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Award size={18} color={COLORS.text.secondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Priority notifications</Text>
              <Text style={styles.rowSubLabel}>
                Get instant alerts for critical cases
              </Text>
            </View>
            <Switch
              value={priorityNotifications}
              onValueChange={setPriorityNotifications}
              trackColor={{ false: COLORS.neutral[700], true: COLORS.primary[500] }}
              thumbColor={
                priorityNotifications ? COLORS.primary[300] : COLORS.neutral[400]
              }
            />
          </View>
        </GlassCard>

        {/* ── 4. EMERGENCY CONTACTS ── */}
        <GlassCard variant="emergency" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Phone size={16} color={COLORS.emergency[300]} />
            <Text style={[styles.sectionTitle, styles.sectionTitleEmergency]}>
              Emergency Numbers
            </Text>
          </View>

          <View style={[styles.divider, styles.dividerEmergency]} />

          {EMERGENCY_CONTACTS.map((contact, index) => (
            <React.Fragment key={contact.number}>
              {index > 0 && <View style={styles.internalDivider} />}
              <View style={styles.row}>
                <View style={styles.rowIconWrap}>
                  <Phone size={18} color={COLORS.emergency[300]} />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowLabel}>{contact.name}</Text>
                  <Text style={[styles.rowSubLabel, styles.emergencyNumber]}>
                    {contact.number}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCallContact(contact.name, contact.number)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            </React.Fragment>
          ))}
        </GlassCard>

        {/* ── 5. PERFORMANCE ── */}
        {officerData && (
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Star size={16} color={COLORS.gold} />
              <Text style={[styles.sectionTitle, styles.sectionTitleGold]}>
                My Performance
              </Text>
            </View>

            <View style={[styles.divider, styles.dividerGold]} />

            <View style={styles.statsRow}>
              {/* Active cases */}
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{officerData.caseload}</Text>
                <Text style={styles.statLabel}>Active{'\n'}Cases</Text>
              </View>

              <View style={styles.statVerticalDivider} />

              {/* Resolved this month */}
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.statNumberGreen]}>
                  {officerData.resolvedThisMonth}
                </Text>
                <Text style={styles.statLabel}>Resolved{'\n'}This Month</Text>
              </View>

              <View style={styles.statVerticalDivider} />

              {/* Languages */}
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.statNumberBlue]}>
                  {officerData.languages.length}
                </Text>
                <Text style={styles.statLabel}>
                  {officerData.languages
                    .map((l: string) => LANGUAGE_LABELS[l as keyof typeof LANGUAGE_LABELS] ?? l)
                    .join(' / ')}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* ── 6. ABOUT ── */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Info size={16} color={COLORS.primary[300]} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.divider} />

          {/* App version info */}
          <View style={[styles.row, styles.rowInfoOnly]}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>ChildGuard Ghana v1.0.0</Text>
              <Text style={styles.rowSubLabel}>Hackathon Demo Build</Text>
            </View>
          </View>

          <View style={styles.internalDivider} />

          {/* Share App */}
          <TouchableOpacity style={styles.row} onPress={handleShareApp} activeOpacity={0.7}>
            <View style={styles.rowIconWrap}>
              <Globe size={18} color={COLORS.primary[300]} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Share App</Text>
            </View>
            <ChevronRight size={18} color={COLORS.text.muted} />
          </TouchableOpacity>
        </GlassCard>

        {/* ── 7. SIGN OUT ── */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.75}
        >
          <LogOut size={20} color={COLORS.emergency[300]} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.huge + SPACING.lg,
    paddingBottom: SPACING.huge,
  },

  // ── Screen header ──
  screenHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  screenTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },

  // ── Profile card ──
  profileCard: {
    marginBottom: SPACING.base,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(99,102,241,0.20)',
    borderWidth: 2,
    borderColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.base,
  },
  avatarInitials: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  officerBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#6366F1',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  officerBadgePillText: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.primary,
    fontSize: 10,
  },
  badgeNumber: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    color: COLORS.gold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  districtText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },

  // ── Caseload row ──
  caseloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,143,168,0.08)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    gap: SPACING.base,
  },
  caseloadItem: {
    flex: 1,
    alignItems: 'center',
  },
  caseloadNumber: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary[300],
  },
  caseloadResolved: {
    color: COLORS.secondary[500],
  },
  caseloadLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  caseloadDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: COLORS.surface.glassBorder,
  },

  // ── Generic section card ──
  sectionCard: {
    marginBottom: SPACING.base,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
  },
  sectionTitleEmergency: {
    color: COLORS.emergency[300],
  },
  sectionTitleGold: {
    color: COLORS.gold,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.surface.glassBorder,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.xs,
  },
  dividerEmergency: {
    backgroundColor: 'rgba(224,27,27,0.30)',
  },
  dividerGold: {
    backgroundColor: 'rgba(212,175,55,0.30)',
  },
  internalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.surface.glassBorder,
    marginHorizontal: SPACING.base,
  },

  // ── Generic row ──
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: SPACING.touchMin,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  rowActive: {
    backgroundColor: 'rgba(14,143,168,0.12)',
  },
  rowInfoOnly: {
    paddingVertical: SPACING.md,
  },
  rowLeft: {
    flex: 1,
  },
  rowIconWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  rowTextWrap: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  rowLabel: {
    ...TYPOGRAPHY.bodyMed,
    color: COLORS.text.primary,
  },
  rowLabelActive: {
    color: COLORS.primary[300],
  },
  rowSubLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: 1,
  },

  // ── Emergency contacts ──
  emergencyNumber: {
    color: COLORS.emergency[300],
    fontFamily: FONTS.mono,
  },
  callButton: {
    backgroundColor: COLORS.emergency[500],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  callButtonText: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.text.primary,
  },

  // ── Performance stats ──
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary[300],
    marginBottom: 2,
  },
  statNumberGreen: {
    color: COLORS.secondary[500],
  },
  statNumberBlue: {
    color: '#6366F1',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
  statVerticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
    backgroundColor: COLORS.surface.glassBorder,
    marginHorizontal: SPACING.sm,
  },

  // ── Sign out ──
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SPACING.touchMin + 8,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.emergency[500],
    backgroundColor: 'rgba(224,27,27,0.10)',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  signOutText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.emergency[300],
  },

  bottomSpacer: {
    height: SPACING.xxxl,
  },
});
