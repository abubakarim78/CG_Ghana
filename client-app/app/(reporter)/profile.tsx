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
  User,
  Shield,
  Globe,
  Bell,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Info,
  Star,
  Phone,
  ChevronDown,
  CheckCircle,
} from 'lucide-react-native';

const EMERGENCY_CONTACTS = [
  { name: 'ChildLine Ghana', number: '116' },
  { name: 'Police Emergency', number: '191' },
  { name: 'Social Welfare', number: '0302-666-441' },
];

export default function ProfileScreen() {
  const {
    user,
    isAnonymousMode,
    disguiseMode,
    language,
    setAnonymousMode,
    toggleDisguiseMode,
    setLanguage,
    signOut,
  } = useAuthStore();

  const [caseUpdatesEnabled, setCaseUpdatesEnabled] = useState(true);

  const isAnonymous = !user || user.isAnonymous;
  const isOfficer = user?.role === 'officer';

  const getInitials = (): string | null => {
    if (!user || !user.name) return null;
    const parts = user.name.trim().split(' ');
    if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
    return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
  };

  const initials = getInitials();

  const handleLanguageSelect = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code as 'en' | 'tw' | 'ga');
  };

  const handleAnonymousToggle = (value: boolean) => {
    setAnonymousMode(value);
    if (value) {
      Alert.alert(
        'Anonymous Mode Enabled',
        'Your identity will be hidden when submitting new reports. Existing reports are not affected.',
        [{ text: 'Understood', style: 'default' }]
      );
    }
  };

  const handleDisguiseToggle = () => {
    if (!disguiseMode) {
      Alert.alert(
        'Disguise Mode',
        'This app will appear as a Calculator on your home screen. Triple-tap the Calculator to return to ChildGuard Ghana.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            style: 'default',
            onPress: () => toggleDisguiseMode(),
          },
        ]
      );
    } else {
      toggleDisguiseMode();
    }
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
        {/* â”€â”€ SCREEN HEADER â”€â”€ */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Profile & Settings</Text>
        </View>

        {/* â”€â”€ 1. USER PROFILE CARD â”€â”€ */}
        <GlassCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileRow}>
            {/* Avatar */}
            <View
              style={[
                styles.avatarCircle,
                isAnonymous && styles.avatarCircleAnonymous,
                isOfficer && styles.avatarCircleOfficer,
              ]}
            >
              {isAnonymous ? (
                <Shield size={28} color={COLORS.secondary[500]} />
              ) : initials ? (
                <Text style={styles.avatarInitials}>{initials}</Text>
              ) : (
                <User size={28} color={COLORS.primary[300]} />
              )}
            </View>

            {/* Name + role */}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {isAnonymous ? 'Anonymous Reporter' : (user?.name ?? 'User')}
              </Text>

              {/* Role badge */}
              {isAnonymous ? (
                <View style={[styles.roleBadge, styles.roleBadgeAnonymous]}>
                  <Text style={styles.roleBadgeText}>ANONYMOUS</Text>
                </View>
              ) : isOfficer ? (
                <View style={[styles.roleBadge, styles.roleBadgeOfficer]}>
                  <Text style={styles.roleBadgeText}>OFFICER</Text>
                </View>
              ) : (
                <View style={[styles.roleBadge, styles.roleBadgeReporter]}>
                  <Text style={styles.roleBadgeText}>REPORTER</Text>
                </View>
              )}

              {/* Officer badge number */}
              {isOfficer && user?.officerId && (
                <Text style={styles.badgeNumber}>Badge #{user.officerId}</Text>
              )}

              {/* Anonymous subtitle */}
              {isAnonymous && (
                <View style={styles.anonymousSubtitle}>
                  <Shield
                    size={12}
                    color={COLORS.secondary[500]}
                    style={styles.subtitleIcon}
                  />
                  <Text style={styles.anonymousSubtitleText}>
                    Your identity is protected
                  </Text>
                </View>
              )}
            </View>
          </View>
        </GlassCard>

        {/* â”€â”€ 2. LANGUAGE SECTION â”€â”€ */}
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
                {isActive && (
                  <CheckCircle size={20} color={COLORS.primary[500]} />
                )}
              </TouchableOpacity>
            );
          })}
        </GlassCard>

        {/* â”€â”€ 3. PRIVACY & SECURITY â”€â”€ */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Shield size={16} color={COLORS.primary[300]} />
            <Text style={styles.sectionTitle}>Privacy</Text>
          </View>

          <View style={styles.divider} />

          {/* Anonymous Mode */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <EyeOff size={18} color={COLORS.text.secondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Anonymous Mode</Text>
              <Text style={styles.rowSubLabel}>Hide your identity when reporting</Text>
            </View>
            <Switch
              value={isAnonymousMode}
              onValueChange={handleAnonymousToggle}
              trackColor={{ false: COLORS.neutral[700], true: COLORS.primary[500] }}
              thumbColor={isAnonymousMode ? COLORS.primary[300] : COLORS.neutral[400]}
            />
          </View>

          <View style={styles.internalDivider} />

          {/* Disguise Mode */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Lock size={18} color={COLORS.text.secondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Disguise Mode</Text>
              <Text style={styles.rowSubLabel}>Show calculator as app cover</Text>
            </View>
            <Switch
              value={disguiseMode}
              onValueChange={handleDisguiseToggle}
              trackColor={{ false: COLORS.neutral[700], true: COLORS.primary[500] }}
              thumbColor={disguiseMode ? COLORS.primary[300] : COLORS.neutral[400]}
            />
          </View>
        </GlassCard>

        {/* â”€â”€ 4. NOTIFICATIONS â”€â”€ */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Bell size={16} color={COLORS.primary[300]} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.divider} />

          {/* Case Updates */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <ChevronRight size={18} color={COLORS.text.secondary} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Case Updates</Text>
              <Text style={styles.rowSubLabel}>
                Get notified when your case status changes
              </Text>
            </View>
            <Switch
              value={caseUpdatesEnabled}
              onValueChange={setCaseUpdatesEnabled}
              trackColor={{ false: COLORS.neutral[700], true: COLORS.primary[500] }}
              thumbColor={caseUpdatesEnabled ? COLORS.primary[300] : COLORS.neutral[400]}
            />
          </View>

          <View style={styles.internalDivider} />

          {/* Emergency Alerts â€” always on, disabled */}
          <View style={styles.row}>
            <View style={styles.rowIconWrap}>
              <Bell size={18} color={COLORS.emergency[300]} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Emergency Alerts</Text>
              <Text style={styles.rowSubLabel}>
                Always on â€” required for child safety
              </Text>
            </View>
            <Switch
              value={true}
              disabled
              trackColor={{ false: COLORS.neutral[700], true: COLORS.emergency[500] }}
              thumbColor={COLORS.neutral[200]}
            />
          </View>
        </GlassCard>

        {/* â”€â”€ 5. EMERGENCY CONTACTS â”€â”€ */}
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

        {/* â”€â”€ 6. ABOUT â”€â”€ */}
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

        {/* â”€â”€ 7. SIGN OUT â”€â”€ */}
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

  // â”€â”€ Profile card â”€â”€
  profileCard: {
    marginBottom: SPACING.base,
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary[700],
    borderWidth: 2,
    borderColor: COLORS.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.base,
  },
  avatarCircleAnonymous: {
    backgroundColor: 'rgba(30,154,63,0.20)',
    borderColor: COLORS.secondary[500],
  },
  avatarCircleOfficer: {
    backgroundColor: 'rgba(99,102,241,0.20)',
    borderColor: '#6366F1',
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
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xs,
  },
  roleBadgeReporter: {
    backgroundColor: COLORS.primary[500],
  },
  roleBadgeAnonymous: {
    backgroundColor: COLORS.gold,
  },
  roleBadgeOfficer: {
    backgroundColor: '#6366F1',
  },
  roleBadgeText: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.primary,
    fontSize: 10,
  },
  badgeNumber: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontFamily: FONTS.mono,
  },
  anonymousSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitleIcon: {
    marginRight: 4,
  },
  anonymousSubtitleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary[500],
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
