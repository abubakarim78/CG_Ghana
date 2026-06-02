import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store';
import { UserRole } from '../src/types/models';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, FONTS } from '../src/theme';
import {
  Shield,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  Flag,
  BarChart2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';

export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();

  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('reporter');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const routeForRole = (role: UserRole) => {
    if (role === 'officer') return '/(officer)/dashboard';
    if (role === 'admin') return '/(admin)/panel';
    return '/(reporter)';
  };

  const validateStep0 = (): boolean => {
    const e: Record<string, string> = {};

    if (!name.trim()) e.name = 'Full name is required.';

    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      e.phone = 'Phone number is required.';
    } else if (digits.length < 9 || digits.length > 12) {
      e.phone = 'Enter a valid Ghana phone number (e.g. 0241234567).';
    }

    if (password.length < 8) e.password = 'Password must be at least 8 characters.';

    if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep0()) setStep(1);
  };

  const handleRegister = async () => {
    try {
      await register(name.trim(), phone.trim(), password, selectedRole);
      router.replace(routeForRole(selectedRole) as any);
    } catch (err: any) {
      Alert.alert(
        'Registration Failed',
        err.message ?? 'An unexpected error occurred. Please try again.'
      );
    }
  };

  const renderFieldError = (field: string) =>
    errors[field] ? (
      <View style={styles.errorRow}>
        <AlertCircle size={12} color={COLORS.emergency[500]} />
        <Text style={styles.errorText}>{errors[field]}</Text>
      </View>
    ) : null;

  const renderProgressDots = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressDot, step === 0 ? styles.progressDotActive : styles.progressDotInactive]} />
      <View style={styles.progressLine} />
      <View style={[styles.progressDot, step === 1 ? styles.progressDotActive : styles.progressDotInactive]} />
    </View>
  );

  const roleCards: Array<{
    id: UserRole;
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    subtitle: string;
    note?: string;
  }> = [
    {
      id: 'reporter',
      icon: <Flag size={22} color="#fff" />,
      iconBg: COLORS.primary[500],
      title: 'Reporter',
      subtitle: 'Community member, teacher, or local leader',
      note: 'No account required for anonymous reporting',
    },
    {
      id: 'officer',
      icon: <Shield size={22} color="#fff" />,
      iconBg: '#6366F1',
      title: 'Officer',
      subtitle: 'Social worker or law enforcement',
    },
    {
      id: 'admin',
      icon: <BarChart2 size={22} color="#fff" />,
      iconBg: COLORS.gold,
      title: 'Administrator',
      subtitle: 'District administrator or manager',
    },
  ];

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Step 1 of 2 — Personal Info</Text>
        </View>
      </View>

      {renderProgressDots()}

      {/* Full Name */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Full Name</Text>
        <View style={[styles.inputContainer, errors.name ? styles.inputContainerError : null]}>
          <User size={16} color={COLORS.text.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Kwame Mensah"
            placeholderTextColor={COLORS.text.muted}
            value={name}
            onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>
        {renderFieldError('name')}
      </View>

      {/* Phone Number */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Phone Number</Text>
        <View style={[styles.inputContainer, errors.phone ? styles.inputContainerError : null]}>
          <Phone size={16} color={COLORS.text.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 0241234567"
            placeholderTextColor={COLORS.text.muted}
            value={phone}
            onChangeText={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: '' })); }}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>
        {renderFieldError('phone')}
      </View>

      {/* Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Password</Text>
        <View style={[styles.inputContainer, errors.password ? styles.inputContainerError : null]}>
          <Lock size={16} color={COLORS.text.muted} style={styles.inputIcon} />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Min. 8 characters"
            placeholderTextColor={COLORS.text.muted}
            value={password}
            onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: '' })); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeButton} activeOpacity={0.7}>
            {showPassword ? <EyeOff size={16} color={COLORS.text.muted} /> : <Eye size={16} color={COLORS.text.muted} />}
          </TouchableOpacity>
        </View>
        {renderFieldError('password')}
      </View>

      {/* Confirm Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Confirm Password</Text>
        <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputContainerError : null]}>
          <Lock size={16} color={COLORS.text.muted} style={styles.inputIcon} />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Re-enter your password"
            placeholderTextColor={COLORS.text.muted}
            value={confirmPassword}
            onChangeText={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: '' })); }}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleNextStep}
          />
          <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} style={styles.eyeButton} activeOpacity={0.7}>
            {showConfirm ? <EyeOff size={16} color={COLORS.text.muted} /> : <Eye size={16} color={COLORS.text.muted} />}
          </TouchableOpacity>
        </View>
        {renderFieldError('confirmPassword')}
      </View>

      {/* Next */}
      <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep} activeOpacity={0.85}>
        <LinearGradient
          colors={[COLORS.primary[300], COLORS.primary[500], COLORS.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <Text style={styles.primaryButtonText}>Next</Text>
          <ChevronRight size={18} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signInLink} onPress={() => router.replace('/login' as any)} activeOpacity={0.7}>
        <Text style={styles.signInLinkText}>
          Already have an account?{' '}
          <Text style={styles.signInLinkAccent}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(0)} activeOpacity={0.7}>
          <ArrowLeft size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Choose Your Role</Text>
          <Text style={styles.headerSubtitle}>Step 2 of 2 — Account Type</Text>
        </View>
      </View>

      {renderProgressDots()}

      <Text style={styles.roleInstructions}>
        Select the role that best describes how you will use ChildGuard Ghana.
      </Text>

      {roleCards.map((card) => {
        const isSelected = selectedRole === card.id;
        return (
          <TouchableOpacity
            key={card.id}
            style={[styles.roleCard, isSelected && { borderColor: card.iconBg, backgroundColor: `${card.iconBg}18` }]}
            onPress={() => setSelectedRole(card.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIconCircle, { backgroundColor: card.iconBg }]}>
              {card.icon}
            </View>
            <View style={styles.roleCardText}>
              <Text style={styles.roleCardTitle}>{card.title}</Text>
              <Text style={styles.roleCardSubtitle}>{card.subtitle}</Text>
              {card.note ? <Text style={styles.roleCardNote}>{card.note}</Text> : null}
            </View>
            <View style={[styles.roleRadio, isSelected && { borderColor: card.iconBg }]}>
              {isSelected && <View style={[styles.roleRadioInner, { backgroundColor: card.iconBg }]} />}
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[styles.primaryButton, { marginTop: SPACING.xl }]}
        onPress={handleRegister}
        activeOpacity={0.85}
        disabled={isLoading}
      >
        <LinearGradient
          colors={[COLORS.primary[300], COLORS.primary[500], COLORS.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <CheckCircle size={18} color="#fff" />
              <Text style={[styles.primaryButtonText, { marginLeft: SPACING.sm }]}>Create Account</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ghostButton} onPress={() => setStep(0)} activeOpacity={0.7} disabled={isLoading}>
        <Text style={styles.ghostButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#0A1628', '#0D1F35', '#091420']} style={styles.gradientContainer}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandIconWrap}>
              <Shield size={28} color={COLORS.primary[300]} />
            </View>
            <Text style={styles.brandName}>ChildGuard Ghana</Text>
          </View>

          {step === 0 ? renderStep0() : renderStep1()}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradientContainer: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: SPACING.xxl,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  brandIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(14,143,168,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(77,184,204,0.25)',
  },
  brandName: { ...TYPOGRAPHY.h3, color: COLORS.text.primary, letterSpacing: 0.3 },
  stepContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { ...TYPOGRAPHY.h2, color: COLORS.text.primary },
  headerSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.text.muted, marginTop: 2 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl },
  progressDot: { width: 10, height: 10, borderRadius: RADIUS.full },
  progressDotActive: {
    backgroundColor: COLORS.primary[300],
    shadowColor: COLORS.primary[300],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  progressDotInactive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  progressLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: SPACING.sm },
  fieldGroup: { marginBottom: SPACING.base },
  fieldLabel: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 50,
  },
  inputContainerError: { borderColor: COLORS.emergency[500], backgroundColor: 'rgba(224,27,27,0.06)' },
  inputIcon: { marginRight: SPACING.sm },
  textInput: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text.primary, paddingVertical: SPACING.md },
  eyeButton: { padding: SPACING.xs, marginLeft: SPACING.xs },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs, gap: 4 },
  errorText: { ...TYPOGRAPHY.caption, color: COLORS.emergency[500], flex: 1 },
  primaryButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    shadowColor: COLORS.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
    minHeight: SPACING.touchMin,
  },
  primaryButtonText: { ...TYPOGRAPHY.bodySemi, color: '#fff', marginRight: SPACING.xs },
  signInLink: { alignItems: 'center', marginTop: SPACING.lg, paddingVertical: SPACING.sm },
  signInLinkText: { ...TYPOGRAPHY.body, color: COLORS.text.muted },
  signInLinkAccent: { color: COLORS.primary[300], fontFamily: FONTS.bodySemi },
  roleInstructions: { ...TYPOGRAPHY.body, color: COLORS.text.muted, marginBottom: SPACING.base },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  roleCardText: { flex: 1 },
  roleCardTitle: { ...TYPOGRAPHY.bodyMed, color: COLORS.text.primary, marginBottom: 2 },
  roleCardSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.text.secondary },
  roleCardNote: { ...TYPOGRAPHY.caption, color: COLORS.primary[300], marginTop: 3, fontStyle: 'italic' },
  roleRadio: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  roleRadioInner: { width: 10, height: 10, borderRadius: RADIUS.full },
  ghostButton: { alignItems: 'center', marginTop: SPACING.md, paddingVertical: SPACING.sm },
  ghostButtonText: { ...TYPOGRAPHY.bodySemi, color: COLORS.text.secondary },
  bottomSpacer: { height: SPACING.xxl },
});
