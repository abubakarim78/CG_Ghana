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
  Globe,
  Bell,
  LogOut,
  ChevronRight,
  Info,
  Star,
  Phone,
  CheckCircle,
  Shield,
  Settings,
  Users,
  BarChart2,
  Download,
} from 'lucide-react-native';
import { useCasesStore } from '../../src/store';

const EMERGENCY_CONTACTS = [
  { name: 'ChildLine Ghana', number: '116' },
  { name: 'Police Emergency', number: '191' },
  { name: 'Social Welfare', number: '0302-666-441' },
];

export default function AdminProfileScreen() {
  const { user, language, setLanguage, signOut } = useAuthStore();
  const { stats, officers } = useCasesStore();

  const [emailDigest, setEmailDigest] = useState(true);
  const [officerPerformance, setOfficerPerformance] = useState(false);

  const getInitials = (): string => {
    if (!user || !user.name) return 'AD';
    const parts = user.name.trim().split(' ');
    if (parts.length === 1) return (parts[0][0] ?? 'A').toUpperCase();
    return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
  };

  const initials = getInitials();

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code as 'en' | 'tw' | 'ga');
  };

  const handleCallContact = (name: string, number: string) => {
    Alert.alert(
      `Calling ${name}`,
      `Dialling ${number}...\n\n(Demo mode â€” real calls not placed)`,
      [{ text: 'OK' }]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Thank You!',
      'Your feedback helps us protect more children. Rating support coming soon.',
      [{ text: 'OK' }]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          "ChildGuard Ghana â€” Report child labour and trafficking safely and anonymously. Download now to help protect Ghana's children.",
        title: 'ChildGuard Ghana',
      });
    } catch (_) {
      // user dismissed share sheet â€” no-op
    }
  };

  const handleChildProtectionResources = () => {
    Alert.alert(
      'Child Protection Resources',
      'Ghana Department of Social Welfare:\nwww.dsw.gov.gh\n\nILO Child Labour:\nwww.ilo.org/childlabour\n\nUNICEF Ghana:\nwww.unicef.org/ghana',
      [{ text: 'Close' }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export feature coming in v1.1',
      [{ text: 'OK' }]
    );
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

  const statTiles = [
    { label: 'Total Cases', value: String(stats?.totalCases ?? 'â€”') },
    { label: 'Resolved / Mo', value: String(stats?.resolvedThisMonth ?? 'â€”') },
    { label: 'Officers Active', value: String(officers.length) },
    { label: 'Avg Response', value: stats ? `${stats.avgResponseHours}h` : 'â€”' },
  ];

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
        {/* â”€â”€ SCREEN HEADER â”€â”€ */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Admin Profile</Text>
        </View>

        {/* â”€â”€ 1. ADMIN PROFILE CARD â”€â”€ */}
        <GlassCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            {/* Avatar */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>

            {/* Name + role info */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name ?? 'Administrator'}</Text>

              {/* ADMIN badge */}
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>

              <Text style={styles.profileSubtitle}>System Administrator</Text>
            </View>
          </View>

          {/* Chips row */}
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>District: All Districts</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Access Level: Full</Text>
            </View>
          </View>
        </GlassCard>

        {/* â”€â”€ 2. LANGUAGE â”€â”€ */}
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

        {/* â”€â”€ 3. SYSTEM SETTINGS â”€â”€ */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Settings size={16} color={COLORS.primary[300]} />
            <Text style={styles.sectionTitle}>System</Text>
          </View>

          <View style={styles.divider} />

          {/* Email Digest */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Bell size={18} color={COLORS.text.secondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Email Digest Reports</Text>
              <Text style={styles.rowSubLabel}>Receive weekly summary reports</Text>
            </View>
            <Switch
              value={emailDigest}
              onValueChange={setEmailDigest}
              trackColor={{ false: COLORS.neutral[700], true: COLORS.primary[500] }}
              thumbColor={emailDigest ? COLORS.primary[300] : COLORS.neutral[400]}
            />
          </View>

          <View style={styles.internalDivider} />

          {/* Critical Case Alerts â€” always on */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Bell size={18} color={COLORS.emergency[300]} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Critical Case Alerts</Text>
              <Text style={styles.rowSubLabel}>Always notified for critical cases</Text>
            </View>
            <Switch
              value={true}
              disabled
              trackColor={{ false: COLORS.neutral[700], true: COLORS.emergency[500] }}
              thumbColor={COLORS.neutral[200]}
            />
          </View>

          <View style={styles.internalDivider} />

          {/* Officer Performance Reports */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <BarChart2 size={18} color={COLORS.text.secondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Officer Performance Reports</Text>
              <Text style={styles.rowSubLabel}>Monthly officer performance summaries</Text>
            </View>
            <Switch
              value={officerPerformance}
              onValueChange={setOfficerPerformance}
              trackColor={{ false: COLORS.neutral[700], true: COLORS.primary[500] }}
              thumbColor={officerPerformance ? COLORS.primary[300] : COLORS.neutral[400]}
            />
          </View>
        </GlassCard>

        {/* â”€â”€ 4. DISTRICT OVERVIEW â”€â”€ */}
        <GlassCard variant="gold" style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <BarChart2 size={16} color={COLORS.gold} />
            <Text style={[styles.sectionTitle, styles.sectionTitleGold]}>
              District Summary
            </Text>
          </View>

          <View style={[styles.divider, styles.dividerGold]} />

          <View style={styles.statsGrid}>
            {statTiles.map((tile) => (
              <View key={tile.label} style={styles.statTile}>
                <Text style={styles.statValue}>{tile.value}</Text>
                <Text style={styles.statLabel}>{tile.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* â”€â”€ 5. OFFICER ROSTER â”€â”€ */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Users size={16} color={COLORS.primary[300]} />
            <Text style={styles.sectionTitle}>Officers</Text>
          </View>

          <View style={styles.divider} />

          {officers.map((officer: any, index: number) => (
            <React.Fragment key={officer.id}>
              {index > 0 && <View style={styles.internalDivider} />}
              <View style={styles.officerRow}>
                <View style={styles.officerAvatar}>
                  <Text style={styles.officerAvatarText}>
                    {officer.name
                      .trim()
                      .split(' ')
                      .map((p: string) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={styles.officerInfo}>
                  <Text style={styles.officerName} numberOfLines={1}>
                    {officer.name}
                  </Text>
                  <Text style={styles.officerMeta} numberOfLines={1}>
                    {officer.badge} Â· {officer.district}
                  </Text>
                </View>
                <View style={styles.caseloadBadge}>
                  <Text style={styles.caseloadText}>{officer.caseload} cases</Text>
                </View>
              </View>
            </React.Fragment>
          ))}
        </GlassCard>

        {/* â”€â”€ 6. EMERGENCY CONTACTS â”€â”€ */}
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

        {/* â”€â”€ 7. ABOUT â”€â”€ */}
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
              <Text style={styles.rowSubLabel}>v1.0.0 — Ghana NCCP Compliant</Text>
            </View>
          </View>

          <View style={styles.internalDivider} />

          {/* Export Data */}
          <TouchableOpacity
            style={styles.row}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={styles.rowIconWrap}>
              <Download size={18} color={COLORS.gold} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Export Data</Text>
            </View>
            <ChevronRight size={18} color={COLORS.text.muted} />
          </TouchableOpacity>

          <View style={styles.internalDivider} />

          {/* Rate the App */}
          <TouchableOpacity style={styles.row} onPress={handleRateApp} activeOpacity={0.7}>
            <View style={styles.rowIconWrap}>
              <Star size={18} color={COLORS.gold} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Rate the App</Text>
            </View>
            <ChevronRight size={18} color={COLORS.text.muted} />
          </TouchableOpacity>

          <View style={styles.internalDivider} />

          {/* Share App */}
          <TouchableOpacity
            style={styles.row}
            onPress={handleShareApp}
            activeOpacity={0.7}
          >
            <View style={styles.rowIconWrap}>
              <Globe size={18} color={COLORS.primary[300]} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Share App</Text>
            </View>
            <ChevronRight size={18} color={COLORS.text.muted} />
          </TouchableOpacity>

          <View style={styles.internalDivider} />

          {/* Child Protection Resources */}
          <TouchableOpacity
            style={styles.row}
            onPress={handleChildProtectionResources}
            activeOpacity={0.7}
          >
            <View style={styles.rowIconWrap}>
              <Shield size={18} color={COLORS.secondary[500]} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Child Protection Resources</Text>
            </View>
            <ChevronRight size={18} color={COLORS.text.muted} />
          </TouchableOpacity>
        </GlassCard>

        {/* â”€â”€ 8. SIGN OUT â”€â”€ */}
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

  // â”€â”€ Screen header â”€â”€
  screenHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  screenTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },

  // â”€â”€ Admin profile card â”€â”€
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
    backgroundColor: 'rgba(245,166,35,0.25)',
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.base,
  },
  avatarInitials: {
    ...TYPOGRAPHY.h3,
    color: COLORS.gold,
    fontFamily: FONTS.heading,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  adminBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  adminBadgeText: {
    ...TYPOGRAPHY.label,
    color: COLORS.surface.dark,
    fontSize: 10,
    fontFamily: FONTS.bodySemi,
  },
  profileSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gold,
  },

  // â”€â”€ Generic section card â”€â”€
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
  sectionTitleGold: {
    color: COLORS.gold,
  },
  sectionTitleEmergency: {
    color: COLORS.emergency[300],
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
  dividerGold: {
    backgroundColor: 'rgba(245,166,35,0.30)',
  },
  dividerEmergency: {
    backgroundColor: 'rgba(224,27,27,0.30)',
  },
  internalDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.surface.glassBorder,
    marginHorizontal: SPACING.base,
  },

  // â”€â”€ Generic row â”€â”€
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

  // â”€â”€ Stats grid â”€â”€
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.base,
    gap: SPACING.sm,
  },
  statTile: {
    width: '47%',
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.25)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.gold,
    marginBottom: 2,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  // â”€â”€ Officer roster â”€â”€
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    minHeight: SPACING.touchMin,
  },
  officerAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary[700],
    borderWidth: 1,
    borderColor: COLORS.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    flexShrink: 0,
  },
  officerAvatarText: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.primary[300],
    fontSize: 11,
  },
  officerInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  officerName: {
    ...TYPOGRAPHY.bodyMed,
    color: COLORS.text.primary,
  },
  officerMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    fontFamily: FONTS.mono,
    marginTop: 1,
  },
  caseloadBadge: {
    backgroundColor: 'rgba(14,143,168,0.18)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    flexShrink: 0,
  },
  caseloadText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary[300],
    fontFamily: FONTS.mono,
  },

  // â”€â”€ Emergency contacts â”€â”€
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

  // â”€â”€ Sign out â”€â”€
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
