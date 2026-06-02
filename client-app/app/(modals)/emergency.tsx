import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { useEmergencyStore } from '../../src/store';
import { GlassCard } from '../../src/components/glass';
import {
  Phone,
  X,
  MapPin,
  AlertTriangle,
  Shield,
  User,
  CheckCircle,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, FONTS } from '../../src/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/* ────────────────────────────────────────────────────────────
   Emergency contacts
──────────────────────────────────────────────────────────── */
const EMERGENCY_CONTACTS = [
  { label: 'ChildLine', number: '116', icon: Phone },
  { label: 'Police', number: '191', icon: Shield },
  { label: 'Social Welfare', number: '0302-666-441', icon: User },
];

/* ────────────────────────────────────────────────────────────
   Animated pulsing ring component
──────────────────────────────────────────────────────────── */
function PulseRing({
  delay,
  size,
  color,
}: {
  delay: number;
  size: number;
  color: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 2.5,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   Radio-wave ring for dispatching state
──────────────────────────────────────────────────────────── */
function RadioWave({ delay }: { delay: number }) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 3,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.3, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.9, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.radioWave,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

/* ────────────────────────────────────────────────────────────
   Animated dots for "Alerting officers..."
──────────────────────────────────────────────────────────── */
function AnimatedDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      );
    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 250);
    const a3 = pulse(dot3, 500);
    a1.start();
    a2.start();
    a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const dotStyle = (val: Animated.Value) => ({
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
  });

  return (
    <View style={styles.dotsRow}>
      <Animated.Text style={[styles.dot, dotStyle(dot1)]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, dotStyle(dot2)]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, dotStyle(dot3)]}>.</Animated.Text>
    </View>
  );
}

/* ────────────────────────────────────────────────────────────
   Main screen
──────────────────────────────────────────────────────────── */
export default function EmergencyModal() {
  const {
    phase,
    description,
    assignedOfficerName,
    caseNumber,
    setDescription,
    triggerSOS,
    reset,
  } = useEmergencyStore();

  const handleClose = () => {
    reset();
    router.back();
  };

  /* ── IDLE ── */
  if (phase === 'idle') {
    return (
      <LinearGradient
        colors={['#1A0808', '#2E0A0A', '#1A0000']}
        style={styles.root}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.75}>
          <X size={22} color={COLORS.text.secondary} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Title */}
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 350 }}
          style={styles.titleRow}
        >
          <AlertTriangle size={20} color={COLORS.emergency['500']} strokeWidth={2.5} />
          <Text style={styles.emergencyTitle}>EMERGENCY</Text>
          <AlertTriangle size={20} color={COLORS.emergency['500']} strokeWidth={2.5} />
        </MotiView>

        {/* Hold button + rings */}
        <View style={styles.holdArea}>
          <PulseRing delay={0} size={220} color={COLORS.emergency['500']} />
          <PulseRing delay={200} size={220} color={COLORS.emergency['500']} />
          <PulseRing delay={400} size={220} color={COLORS.emergency['500']} />

          <Pressable
            onLongPress={() => triggerSOS({ district: 'Unknown', region: 'Unknown', lat: 5.6037, lng: -0.187 })}
            delayLongPress={2000}
            style={({ pressed }) => [
              styles.sosCircle,
              pressed && styles.sosCirclePressed,
            ]}
          >
            <AlertTriangle size={40} color={COLORS.text.primary} strokeWidth={2} />
          </Pressable>
        </View>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
          style={styles.holdHintWrap}
        >
          <Text style={styles.holdHint}>Hold 2 seconds to activate</Text>
          <Text style={styles.holdSub}>Emergency services will be notified</Text>
        </MotiView>

        {/* Description input */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 300 }}
          style={styles.inputWrap}
        >
          <GlassCard variant="emergency" style={styles.inputCard}>
            <View style={styles.inputRow}>
              <MapPin size={16} color={COLORS.emergency['300']} strokeWidth={2} />
              <Text style={styles.locationHint}>Location: Detecting...</Text>
            </View>
            <TextInput
              style={styles.descInput}
              placeholder="Briefly describe the situation..."
              placeholderTextColor={COLORS.text.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={280}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/280</Text>
          </GlassCard>
        </MotiView>

        {/* Emergency contacts */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 400 }}
          style={styles.contactsSection}
        >
          <Text style={styles.contactsTitle}>EMERGENCY CONTACTS</Text>
          <View style={styles.contactsRow}>
            {EMERGENCY_CONTACTS.map((c) => (
              <TouchableOpacity
                key={c.label}
                style={styles.contactCard}
                activeOpacity={0.75}
                onPress={() =>
                  Alert.alert(
                    c.label,
                    `Calling ${c.number}...`,
                    [{ text: 'Call', style: 'default' }, { text: 'Cancel', style: 'cancel' }]
                  )
                }
              >
                <c.icon size={18} color={COLORS.emergency['300']} strokeWidth={2} />
                <Text style={styles.contactNumber}>{c.number}</Text>
                <Text style={styles.contactLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>
      </LinearGradient>
    );
  }

  /* ── DISPATCHING ── */
  if (phase === 'dispatching') {
    return (
      <LinearGradient
        colors={['#1A0808', '#2E0A0A', '#1A0000']}
        style={styles.root}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.75}>
          <X size={22} color={COLORS.text.secondary} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.dispatchCenter}>
          {/* Radio waves */}
          <View style={styles.radioWaveContainer}>
            <RadioWave delay={0} />
            <RadioWave delay={600} />
            <RadioWave delay={1200} />
            <View style={styles.dispatchCore}>
              <AlertTriangle size={32} color={COLORS.emergency['500']} strokeWidth={2} />
            </View>
          </View>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 200 }}
            style={styles.dispatchTextWrap}
          >
            <View style={styles.alertingRow}>
              <Text style={styles.alertingText}>Alerting officers</Text>
              <AnimatedDots />
            </View>
            <Text style={styles.dispatchSub}>SOS signal sent. Locating nearest officer.</Text>
            <View style={styles.caseGenRow}>
              <Text style={styles.caseGenLabel}>Case ID: </Text>
              <Text style={styles.caseGenId}>
                CG-{String(Math.floor(10000 + Math.random() * 89999)).substring(0, 5)}
              </Text>
            </View>
          </MotiView>
        </View>
      </LinearGradient>
    );
  }

  /* ── OFFICER FOUND ── */
  if (phase === 'officer_found') {
    return (
      <LinearGradient
        colors={['#071A0E', '#0A2E18', '#071A0E']}
        style={styles.root}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.75}>
          <X size={22} color={COLORS.text.secondary} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.foundCenter}>
          {/* Checkmark */}
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 16, stiffness: 160 }}
            style={styles.checkCircle}
          >
            <CheckCircle size={56} color={COLORS.secondary['500']} strokeWidth={2} />
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 300 }}
            style={styles.foundTextWrap}
          >
            <Text style={styles.officerFoundTitle}>Officer Found</Text>
            {assignedOfficerName ? (
              <Text style={styles.officerFoundName}>{assignedOfficerName}</Text>
            ) : null}
            <View style={styles.onTheWayBadge}>
              <View style={styles.onTheWayDot} />
              <Text style={styles.onTheWayText}>On the way</Text>
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 420, delay: 500 }}
            style={styles.foundActions}
          >
            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Call Officer',
                  `Connecting to ${assignedOfficerName ?? 'Officer'}...\n+233 24 400 0421`,
                  [{ text: 'Call', style: 'default' }, { text: 'Cancel', style: 'cancel' }]
                )
              }
            >
              <Phone size={18} color={COLORS.text.primary} strokeWidth={2.5} />
              <Text style={styles.callBtnText}>Call Officer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trackBtn}
              activeOpacity={0.8}
              onPress={() => {
                const cn = caseNumber;
                reset();
                router.back();
                // Navigate to the Track screen; the case is already in myReports
                router.push({
                  pathname: '/(reporter)/track',
                  params: cn ? { prefill: cn } : {},
                } as any);
              }}
            >
              <Text style={styles.trackBtnText}>Track This Case</Text>
            </TouchableOpacity>
          </MotiView>
        </View>

        {/* Reassurance footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 700 }}
          style={styles.reassuranceWrap}
        >
          <Shield size={14} color={COLORS.secondary['300']} strokeWidth={2} />
          <Text style={styles.reassuranceText}>
            You are safe. Help is on the way.
          </Text>
        </MotiView>
      </LinearGradient>
    );
  }

  /* Fallback (activating/holding) */
  return (
    <LinearGradient
      colors={['#1A0808', '#2E0A0A', '#1A0000']}
      style={styles.root}
    >
      <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.75}>
        <X size={22} color={COLORS.text.secondary} strokeWidth={2.5} />
      </TouchableOpacity>
      <View style={styles.dispatchCenter}>
        <Text style={styles.alertingText}>Activating SOS...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
  },

  /* Close button */
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 32,
    left: SPACING.base,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── IDLE ── */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  emergencyTitle: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    letterSpacing: 4,
    color: COLORS.emergency['500'],
    textShadowColor: 'rgba(224,27,27,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  /* Hold area */
  holdArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
    marginTop: SPACING.xl,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: COLORS.emergency['500'],
  },
  sosCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.emergency['500'],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.emergency['500'],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  sosCirclePressed: {
    backgroundColor: COLORS.emergency['600'],
    transform: [{ scale: 0.94 }],
  },
  holdHintWrap: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  holdHint: {
    fontFamily: FONTS.bodySemi,
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  holdSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
    marginTop: 4,
  },

  /* Description input */
  inputWrap: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
  },
  inputCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    gap: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  locationHint: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.emergency['300'],
  },
  descInput: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.primary,
    minHeight: 72,
    paddingTop: SPACING.xs,
  },
  charCount: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    textAlign: 'right',
  },

  /* Emergency contacts */
  contactsSection: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.xl,
  },
  contactsTitle: {
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.text.muted,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  contactsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(224,27,27,0.12)',
    borderColor: 'rgba(224,27,27,0.25)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  contactNumber: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.emergency['300'],
  },
  contactLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.text.muted,
    textAlign: 'center',
  },

  /* ── DISPATCHING ── */
  dispatchCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxxl,
  },
  radioWaveContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioWave: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.emergency['500'],
  },
  dispatchCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(224,27,27,0.2)',
    borderColor: COLORS.emergency['500'],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchTextWrap: {
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  alertingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  alertingText: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.text.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 2,
  },
  dot: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.emergency['300'],
    lineHeight: 28,
  },
  dispatchSub: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  caseGenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  caseGenLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  caseGenId: {
    fontFamily: FONTS.mono ?? FONTS.bodySemi,
    fontSize: 14,
    color: COLORS.primary['300'],
    letterSpacing: 1,
  },

  /* ── OFFICER FOUND ── */
  foundCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.xl,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(30,154,63,0.15)',
    borderColor: COLORS.secondary['500'],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary['500'],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  foundTextWrap: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  officerFoundTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  officerFoundName: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.gold,
    textShadowColor: 'rgba(245,166,35,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  onTheWayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(30,154,63,0.15)',
    borderColor: 'rgba(30,154,63,0.35)',
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.xs,
  },
  onTheWayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary['500'],
  },
  onTheWayText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.secondary['300'],
  },
  foundActions: {
    width: '100%',
    gap: SPACING.md,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary['500'],
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    shadowColor: COLORS.secondary['500'],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  callBtnText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  trackBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface.glass,
  },
  trackBtnText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  reassuranceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  reassuranceText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    color: COLORS.secondary['300'],
  },
});
