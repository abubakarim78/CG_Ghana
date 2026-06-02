import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
} from 'react-native';
import { MotiView } from 'moti';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle,
  Share2,
  Search,
  Home,
  Shield,
  Copy,
} from 'lucide-react-native';
import { useReportsStore } from '../../src/store';
import { GlassCard } from '../../src/components/glass/GlassCard';
import { GlassButton } from '../../src/components/glass/GlassButton';
import { COLORS, FONTS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';

// ── Retrieval code generator ─────────────────────────────────────────────────
const WORD_LISTS = [
  ['river', 'mountain', 'forest', 'ocean', 'valley', 'desert'],
  ['swift', 'gentle', 'bright', 'quiet', 'steady', 'brave'],
  ['kente', 'baobab', 'harmattan', 'savanna', 'lagoon', 'volta'],
  ['eagle', 'lion', 'dolphin', 'falcon', 'turtle', 'crane'],
  ['amber', 'silver', 'copper', 'indigo', 'crimson', 'emerald'],
  ['dawn', 'dusk', 'noon', 'midnight', 'twilight', 'sunrise'],
];

function generateRetrievalCode(caseId: string): string {
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = ((hash * 31) + caseId.charCodeAt(i)) >>> 0;
  }
  return WORD_LISTS
    .map((list, i) => list[(hash >> (i * 3)) % list.length])
    .join(' ');
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SubmittedScreen() {
  const params = useLocalSearchParams<{ caseId?: string; isAnonymous?: string }>();
  const { myReports } = useReportsStore();

  const [copied, setCopied] = useState(false);

  // Prefer route param; fall back to last submitted report
  const caseId =
    params.caseId ??
    (myReports.length > 0 ? myReports[myReports.length - 1].id : 'CG-00001');

  const isAnonymous =
    params.isAnonymous === 'true' ||
    (myReports.length > 0 && myReports[myReports.length - 1].isAnonymous);

  const retrievalCode = isAnonymous ? generateRetrievalCode(caseId) : null;

  async function handleCopyId() {
    // Share the case ID — doubles as a copy-to-clipboard flow on both platforms
    try {
      await Share.share({ message: caseId, title: 'Case ID' });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // user dismissed
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `I submitted a child protection report via ChildGuard Ghana.\nCase ID: ${caseId}\nTrack it at childguardghana.gov.gh`,
        title: 'ChildGuard Ghana — Case Submitted',
      });
    } catch (_) {
      // user dismissed share sheet — no action needed
    }
  }

  return (
    <LinearGradient
      colors={COLORS.gradient.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Success animation ─────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 100 }}
            style={styles.checkCircleOuter}
          >
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 260, delay: 300 }}
              style={styles.checkCircleInner}
            >
              <CheckCircle
                size={56}
                color={COLORS.secondary[500]}
                strokeWidth={2}
              />
            </MotiView>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 450 }}
          >
            <Text style={styles.headline}>Report Submitted!</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 600 }}
          >
            <Text style={styles.warmMessage}>
              Thank you for speaking up. A child protection officer will review
              this within 24 hours. You are not alone in this.
            </Text>
          </MotiView>
        </View>

        {/* ── Case ID card ──────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 750 }}
          style={styles.cardWrapper}
        >
          <GlassCard variant="gold" style={styles.caseIdCard}>
            <Text style={styles.caseIdLabel}>YOUR CASE ID</Text>
            <Text style={styles.caseIdValue}>{caseId}</Text>
            <Text style={styles.caseIdCaption}>
              Save this reference number to track your report
            </Text>
            <View style={styles.caseIdActions}>
              <TouchableOpacity
                style={styles.iconAction}
                onPress={handleCopyId}
                activeOpacity={0.7}
              >
                <Copy
                  size={16}
                  color={copied ? COLORS.secondary[500] : COLORS.gold}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.iconActionLabel,
                    copied && styles.iconActionLabelCopied,
                  ]}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconAction}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Share2 size={16} color={COLORS.gold} strokeWidth={2} />
                <Text style={styles.iconActionLabel}>Share</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </MotiView>

        {/* ── Anonymous retrieval code ──────────────────────────────────── */}
        {isAnonymous && retrievalCode != null && (
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 900 }}
            style={styles.cardWrapper}
          >
            <GlassCard style={styles.anonCard}>
              <View style={styles.anonHeader}>
                <Shield size={18} color={COLORS.primary[300]} strokeWidth={2} />
                <Text style={styles.anonTitle}>Anonymous Retrieval Code</Text>
              </View>
              <Text style={styles.anonDescription}>
                Since you reported anonymously, save this phrase to retrieve
                your case status without logging in.
              </Text>
              <View style={styles.codeBox}>
                <Text style={styles.codePhrase}>{retrievalCode}</Text>
              </View>
            </GlassCard>
          </MotiView>
        )}

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 1000 }}
          style={styles.buttonSection}
        >
          <GlassButton
            label="Track This Case"
            variant="primary"
            icon={<Search size={18} color={COLORS.text.primary} strokeWidth={2} />}
            onPress={() => router.push('/(reporter)/track')}
            style={styles.fullWidth}
          />
          <GlassButton
            label="Go Home"
            variant="ghost"
            icon={<Home size={18} color={COLORS.text.secondary} strokeWidth={2} />}
            onPress={() => router.replace('/(reporter)' as any)}
            style={styles.fullWidth}
          />
        </MotiView>

        {/* ── Emergency contacts ────────────────────────────────────────── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 1150 }}
          style={styles.emergencySection}
        >
          <Text style={styles.emergencyTitle}>Emergency Numbers</Text>
          <View style={styles.emergencyRow}>
            <GlassCard style={styles.emergencyChip}>
              <Text style={styles.emergencyName}>ChildLine</Text>
              <Text style={styles.emergencyNumber}>116</Text>
            </GlassCard>
            <GlassCard style={styles.emergencyChip}>
              <Text style={styles.emergencyName}>Police</Text>
              <Text style={styles.emergencyNumber}>191</Text>
            </GlassCard>
          </View>
        </MotiView>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.xxxl + SPACING.xl,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
  },

  // Hero ──────────────────────────────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    width: '100%',
  },
  checkCircleOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(30,154,63,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.secondary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  checkCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30,154,63,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  warmMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },

  // Case ID card ──────────────────────────────────────────────────────────────
  cardWrapper: {
    width: '100%',
    marginBottom: SPACING.base,
  },
  caseIdCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderRadius: RADIUS.xl,
  },
  caseIdLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.gold,
    opacity: 0.85,
    marginBottom: SPACING.sm,
  },
  caseIdValue: {
    fontFamily: FONTS.mono,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 2,
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  caseIdCaption: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.base,
  },
  caseIdActions: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  iconAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  iconActionLabel: {
    ...TYPOGRAPHY.caption,
    fontFamily: FONTS.bodySemi,
    color: COLORS.gold,
  },
  iconActionLabelCopied: {
    color: COLORS.secondary[500],
  },

  // Anon retrieval code ───────────────────────────────────────────────────────
  anonCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
  },
  anonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  anonTitle: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.primary[300],
  },
  anonDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  codeBox: {
    backgroundColor: 'rgba(14,143,168,0.10)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(14,143,168,0.30)',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  codePhrase: {
    fontFamily: FONTS.mono,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.8,
    color: COLORS.primary[300],
    textAlign: 'center',
  },

  // Buttons ───────────────────────────────────────────────────────────────────
  buttonSection: {
    width: '100%',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  fullWidth: {
    width: '100%',
  },

  // Emergency contacts ────────────────────────────────────────────────────────
  emergencySection: {
    width: '100%',
    alignItems: 'center',
  },
  emergencyTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
    marginBottom: SPACING.sm,
  },
  emergencyRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  emergencyChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  emergencyName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginBottom: 2,
  },
  emergencyNumber: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.emergency[300],
  },
});
