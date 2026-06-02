import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../src/store';
import { UserRole } from '../src/types/models';
import {
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  Phone,
  Lock,
  AlertCircle,
  Flag,
  BarChart2,
  UserX,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, GLASS, SHADOW } from '../src/theme';

// â”€â”€â”€ Route helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function routeForRole(role: UserRole): string {
  switch (role) {
    case 'reporter':
      return '/(reporter)';
    case 'officer':
      return '/(officer)/dashboard';
    case 'admin':
      return '/(admin)/panel';
  }
}

type DemoKey = 'reporter' | 'officer' | 'admin';

// Pre-fill credentials for demo accounts (register these first via /api/auth/register)
const DEMO_CREDS: Record<DemoKey, { phone: string; password: string }> = {
  reporter: { phone: '0240000001', password: 'Reporter@123' },
  officer:  { phone: '0240000002', password: 'Officer@123' },
  admin:    { phone: '0240000003', password: 'Admin@123' },
};

const DEMO_ROLES: {
  key: DemoKey;
  label: string;
  color: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}[] = [
  { key: 'reporter', label: 'Reporter', color: COLORS.primary[500], Icon: Flag },
  { key: 'officer', label: 'Officer', color: '#6366F1', Icon: Shield },
  { key: 'admin', label: 'Admin', color: COLORS.gold, Icon: BarChart2 },
];

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function LoginScreen() {
  const { login, loginAnonymous, isLoading: authLoading } = useAuthStore();
  const params = useLocalSearchParams<{ preselect?: string }>();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Pre-fill phone when coming from role-select
  React.useEffect(() => {
    if (params.preselect && DEMO_CREDS[params.preselect as DemoKey]) {
      setPhone(DEMO_CREDS[params.preselect as DemoKey].phone);
    }
  }, [params.preselect]);

  // â”€â”€ Credential sign in â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleSignIn() {
    setError('');
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }
    try {
      await login(phone.trim(), password);
      const user = useAuthStore.getState().user;
      if (user) router.replace(routeForRole(user.role) as any);
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Check your credentials.');
    }
  }

  // â”€â”€ Quick demo login (pre-fills fields) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function handleDemoLogin(roleKey: DemoKey) {
    const creds = DEMO_CREDS[roleKey];
    setPhone(creds.phone);
    setPassword(creds.password);
    setError('');
  }

  // â”€â”€ Anonymous â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function handleAnonymous() {
    try {
      await loginAnonymous();
      router.replace('/(reporter)' as any);
    } catch (err: any) {
      setError(err.message ?? 'Failed to start anonymous session.');
    }
  }

  // â”€â”€ Forgot password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function handleForgotPassword() {
    Alert.alert(
      'Forgot Password',
      'Contact your district administrator to reset your password, or use a demo account to explore the app.',
      [{ text: 'OK' }],
    );
  }

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <LinearGradient
      colors={['#0A1628', '#0D1F35', '#091420']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.kavFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.backBtn}
            >
              <ArrowLeft size={22} color={COLORS.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sign In</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* â”€â”€ Logo + Wordmark â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <View style={styles.logoSection}>
            <View style={styles.logoRing}>
              <Shield size={40} color={COLORS.primary[500]} />
            </View>
            <Text style={styles.appName}>ChildGuard Ghana</Text>
            <Text style={styles.appTagline}>Protecting children, together</Text>
          </View>

          {/* â”€â”€ Glass form card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <View style={[styles.formCard, GLASS.elevated as any]}>
            {/* Phone field */}
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View
              style={[
                styles.inputWrap,
                phoneFocused && styles.inputWrapFocused,
              ]}
            >
              <Phone
                size={16}
                color={phoneFocused ? COLORS.primary[500] : COLORS.text.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="0241234567"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                value={phone}
                onChangeText={(v) => { setPhone(v); setError(''); }}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                editable={!authLoading}
              />
            </View>

            {/* Password field */}
            <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>Password</Text>
            <View
              style={[
                styles.inputWrap,
                styles.inputWrapRow,
                passwordFocused && styles.inputWrapFocused,
              ]}
            >
              <Lock
                size={16}
                color={passwordFocused ? COLORS.primary[500] : COLORS.text.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.text.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                editable={!authLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={18} color={COLORS.text.muted} />
                ) : (
                  <Eye size={18} color={COLORS.text.muted} />
                )}
              </TouchableOpacity>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotRow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Inline error */}
            {!!error && (
              <View style={styles.errorRow}>
                <AlertCircle size={14} color={COLORS.emergency[500] ?? '#EF4444'} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Sign In button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={authLoading}
              activeOpacity={0.85}
              style={[styles.signInBtn, authLoading && styles.signInBtnDisabled]}
            >
              <LinearGradient
                colors={[COLORS.primary[300], COLORS.primary[500], COLORS.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInGradient}
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Create Account ghost button */}
            <TouchableOpacity
              onPress={() => router.push('/register' as any)}
              activeOpacity={0.75}
              style={styles.createAccountBtn}
            >
              <Text style={styles.createAccountText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* â”€â”€ Demo Accounts section (smaller / secondary) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <View style={styles.demoSection}>
            <View style={styles.demoHeadingRow}>
              <View style={styles.demoLine} />
              <Text style={styles.demoHeading}>Demo Accounts</Text>
              <View style={styles.demoLine} />
            </View>

            <View style={styles.demoButtonsRow}>
              {DEMO_ROLES.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  onPress={() => handleDemoLogin(r.key)}
                  activeOpacity={0.75}
                  style={[styles.demoRoleBtn, { borderColor: r.color + '55', backgroundColor: r.color + '18' }]}
                >
                  <r.Icon size={14} color={r.color} />
                  <Text style={[styles.demoRoleLabel, { color: r.color }]}>{r.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* â”€â”€ Anonymous link â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <TouchableOpacity
            onPress={handleAnonymous}
            activeOpacity={0.7}
            style={styles.anonBtn}
          >
            <UserX size={14} color={COLORS.text.muted} />
            <Text style={styles.anonText}>Report anonymously</Text>
            <Text style={styles.anonArrow}> â†’</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// â”€â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  kavFlex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(14,143,168,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(14,143,168,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
    ...(SHADOW.md as object),
  },
  appName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
  },
  appTagline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    letterSpacing: 0.5,
  },

  // Form card
  formCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.xl,
  },
  fieldLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  fieldLabelSpaced: {
    marginTop: SPACING.md,
  },

  // Input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  inputWrapFocused: {
    borderColor: COLORS.primary[500],
    backgroundColor: 'rgba(14,143,168,0.08)',
  },
  inputWrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginLeft: SPACING.base,
    flexShrink: 0,
  },
  input: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    minHeight: 48,
  },
  inputFlex: {
    flex: 1,
  },
  eyeBtn: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },

  // Forgot password
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  forgotText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary[500],
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: '#EF4444',
    flex: 1,
  },

  // Sign In button
  signInBtn: {
    marginTop: SPACING.lg,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...(SHADOW.md as object),
  },
  signInBtnDisabled: {
    opacity: 0.65,
  },
  signInGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  signInText: {
    ...TYPOGRAPHY.bodySemi,
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.4,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surface.glassBorder,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    flexShrink: 0,
  },

  // Create Account ghost button
  createAccountBtn: {
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  createAccountText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.secondary,
    fontSize: 15,
  },

  // Demo section
  demoSection: {
    marginBottom: SPACING.lg,
  },
  demoHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  demoLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surface.glassBorder,
  },
  demoHeading: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  demoRoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  demoRoleLabel: {
    ...TYPOGRAPHY.label,
    fontSize: 12,
  },

  // Anonymous
  anonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  anonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    textDecorationLine: 'underline',
  },
  anonArrow: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },

  bottomSpacer: {
    height: SPACING.xxxl,
  },
});
