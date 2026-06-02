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
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../src/store';
import { RegisterUserPayload } from '../src/store/authStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, FONTS } from '../src/theme';
import {
  Shield,
  User,
  Mail,
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

type Role = 'reporter' | 'officer' | 'admin';

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const { registerUser } = useAuthStore();

  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('reporter');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep0 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep0()) {
      setStep(1);
    }
  };

  const handleRegister = async () => {
    if (!selectedRole) {
      Alert.alert('Role Required', 'Please select a role to continue.');
      return;
    }

    setIsLoading(true);

    const payload: RegisterUserPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: selectedRole,
      badgeNumber: selectedRole === 'officer' && badgeNumber.trim() ? badgeNumber.trim() : undefined,
      district: selectedRole === 'admin' && district.trim() ? district.trim() : undefined,
    };

    try {
      const result = await registerUser(payload);

      if (result.success) {
        setTimeout(() => {
          setIsLoading(false);
          if (selectedRole === 'reporter') {
            router.replace('/(reporter)' as any);
          } else if (selectedRole === 'officer') {
            router.replace('/(officer)/dashboard' as any);
          } else if (selectedRole === 'admin') {
            router.replace('/(admin)/panel' as any);
          }
        }, 800);
      } else {
        setIsLoading(false);
        Alert.alert('Registration Failed', result.error ?? 'An unexpected error occurred. Please try again.');
      }
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Registration Failed', e?.message ?? 'An unexpected error occurred.');
    }
  };

  const renderProgressDots = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressDot, step === 0 ? styles.progressDotActive : styles.progressDotInactive]} />
      <View style={styles.progressLine} />
      <View style={[styles.progressDot, step === 1 ? styles.progressDotActive : styles.progressDotInactive]} />
    </View>
  );

  const renderFieldError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <View style={styles.errorRow}>
        <AlertCircle size={12} color={COLORS.emergency[500]} />
        <Text style={styles.errorText}>{errors[field]}</Text>
      </View>
    );
  };

  const renderStep0 = () => (
    <View style={styles.stepContainer}>
      {/* Header */}
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
            onChangeText={(v) => { setName(v); if (errors.name) setErrors((e) => ({ ...e, name: '' })); }}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>
        {renderFieldError('name')}
      </View>

      {/* Email */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Email Address</Text>
        <View style={[styles.inputContainer, errors.email ? styles.inputContainerError : null]}>
          <Mail size={16} color={COLORS.text.muted} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.text.muted}
            value={email}
            onChangeText={(v) => { setEmail(v); if (errors.email) setErrors((e) => ({ ...e, email: '' })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>
        {renderFieldError('email')}
      </View>

      {/* Password */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Password</Text>
        <View style={[styles.inputContainer, errors.password ? styles.inputContainerError : null]}>
          <Lock size={16} color={COLORS.text.muted} style={styles.inputIcon} />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Min. 6 characters"
            placeholderTextColor={COLORS.text.muted}
            value={password}
            onChangeText={(v) => { setPassword(v); if (errors.password) setErrors((e) => ({ ...e, password: '' })); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeButton} activeOpacity={0.7}>
            {showPassword
              ? <EyeOff size={16} color={COLORS.text.muted} />
              : <Eye size={16} color={COLORS.text.muted} />
            }
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
            onChangeText={(v) => { setConfirmPassword(v); if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: '' })); }}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleNextStep}
          />
          <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} style={styles.eyeButton} activeOpacity={0.7}>
            {showConfirm
              ? <EyeOff size={16} color={COLORS.text.muted} />
              : <Eye size={16} color={COLORS.text.muted} />
            }
          </TouchableOpacity>
        </View>
        {renderFieldError('confirmPassword')}
      </View>

      {/* Next Button */}
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

      {/* Sign In Link */}
      <TouchableOpacity
        style={styles.signInLink}
        onPress={() => router.replace('/login' as any)}
        activeOpacity={0.7}
      >
        <Text style={styles.signInLinkText}>
          Already have an account?{' '}
          <Text style={styles.signInLinkAccent}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const roleCards: Array<{
    id: Role;
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

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      {/* Header */}
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

      {/* Role Cards */}
      {roleCards.map((card) => {
        const isSelected = selectedRole === card.id;
        return (
          <View key={card.id}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                isSelected && { borderColor: card.iconBg, backgroundColor: `${card.iconBg}18` },
              ]}
              onPress={() => setSelectedRole(card.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.roleIconCircle, { backgroundColor: card.iconBg }]}>
                {card.icon}
              </View>
              <View style={styles.roleCardText}>
                <Text style={styles.roleCardTitle}>{card.title}</Text>
                <Text style={styles.roleCardSubtitle}>{card.subtitle}</Text>
                {card.note ? (
                  <Text style={styles.roleCardNote}>{card.note}</Text>
                ) : null}
              </View>
              <View style={[styles.roleRadio, isSelected && { borderColor: card.iconBg }]}>
                {isSelected && <View style={[styles.roleRadioInner, { backgroundColor: card.iconBg }]} />}
              </View>
            </TouchableOpacity>

            {/* Badge Number field for Officer */}
            {card.id === 'officer' && isSelected && (
              <View style={[styles.fieldGroup, styles.roleExtraField]}>
                <Text style={styles.fieldLabel}>Badge Number (optional)</Text>
                <View style={styles.inputContainer}>
                  <Shield size={16} color={COLORS.text.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. GH-SWD-042"
                    placeholderTextColor={COLORS.text.muted}
                    value={badgeNumber}
                    onChangeText={setBadgeNumber}
                    autoCapitalize="characters"
                    returnKeyType="done"
                  />
                </View>
              </View>
            )}

            {/* District field for Admin */}
            {card.id === 'admin' && isSelected && (
              <View style={[styles.fieldGroup, styles.roleExtraField]}>
                <Text style={styles.fieldLabel}>District (optional)</Text>
                <View style={styles.inputContainer}>
                  <BarChart2 size={16} color={COLORS.text.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Greater Accra"
                    placeholderTextColor={COLORS.text.muted}
                    value={district}
                    onChangeText={setDistrict}
                    autoCapitalize="words"
                    returnKeyType="done"
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}

      {/* Create Account Button */}
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

      {/* Back Ghost Button */}
      <TouchableOpacity
        style={styles.ghostButton}
        onPress={() => setStep(0)}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        <Text style={styles.ghostButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0A1628', '#0D1F35', '#091420']}
      style={styles.gradientContainer}
    >
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
          {/* Logo / Brand */}
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
  flex: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: SPACING.xxl,
  },

  // Brand
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
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
  brandName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    letterSpacing: 0.3,
  },

  // Step container
  stepContainer: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
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
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: 2,
  },

  // Progress dots
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary[300],
    shadowColor: COLORS.primary[300],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 4,
  },
  progressDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: SPACING.sm,
  },

  // Field
  fieldGroup: {
    marginBottom: SPACING.base,
  },
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
  inputContainerError: {
    borderColor: COLORS.emergency[500],
    backgroundColor: 'rgba(224,27,27,0.06)',
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    paddingVertical: SPACING.md,
  },
  eyeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },

  // Error
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.emergency[500],
    flex: 1,
  },

  // Primary Button
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
  primaryButtonText: {
    ...TYPOGRAPHY.bodySemi,
    color: '#fff',
    marginRight: SPACING.xs,
  },

  // Sign in link
  signInLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  signInLinkText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.muted,
  },
  signInLinkAccent: {
    color: COLORS.primary[300],
    fontFamily: FONTS.bodySemi,
  },

  // Role cards
  roleInstructions: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.muted,
    marginBottom: SPACING.base,
  },
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
  roleCardText: {
    flex: 1,
  },
  roleCardTitle: {
    ...TYPOGRAPHY.bodyMed,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  roleCardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  roleCardNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary[300],
    marginTop: 3,
    fontStyle: 'italic',
  },
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
  roleRadioInner: {
    width: 10,
    height: 10,
    borderRadius: RADIUS.full,
  },

  // Extra fields under role cards
  roleExtraField: {
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

  // Ghost Button
  ghostButton: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  ghostButtonText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.secondary,
  },

  bottomSpacer: {
    height: SPACING.xxl,
  },
});
