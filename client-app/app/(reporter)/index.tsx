import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore, useReportsStore, useNotificationStore } from '../../src/store';
import { OfflineBanner } from '../../src/components/ui/OfflineBanner';
import { GlassCard } from '../../src/components/glass/GlassCard';
import { EmergencyFAB } from '../../src/components/ui/EmergencyFAB';
import { CaseCard } from '../../src/components/ui/CaseCard';
import { StatCard } from '../../src/components/ui/StatCard';
import {
  Flag,
  Search,
  BookOpen,
  AlertTriangle,
  Bell,
  Shield,
  ChevronRight,
  FileText,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SAFE_TOP = Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 24) + 8;

const ACTION_ITEMS = [
  {
    id: 'report',
    title: 'Report Case',
    subtitle: 'Submit a new incident',
    icon: Flag,
    iconBg: COLORS.primary['500'],
    route: '/(reporter)/report' as const,
    pulsing: false,
  },
  {
    id: 'track',
    title: 'Track Case',
    subtitle: 'Check report status',
    icon: Search,
    iconBg: '#7C3AED',
    route: '/(reporter)/track' as const,
    pulsing: false,
  },
  {
    id: 'learn',
    title: 'Learn',
    subtitle: 'Child protection tips',
    icon: BookOpen,
    iconBg: COLORS.secondary['500'],
    route: '/(reporter)/learn' as const,
    pulsing: false,
  },
  {
    id: 'emergency',
    title: 'Emergency',
    subtitle: 'Immediate danger alert',
    icon: AlertTriangle,
    iconBg: COLORS.emergency['500'],
    route: '/(modals)/emergency' as const,
    pulsing: true,
  },
];

export default function ReporterHomeScreen() {
  const { user } = useAuthStore();
  const { myReports } = useReportsStore();
  const { unreadCount } = useNotificationStore();

  const userName = user?.name?.split(' ')[0] ?? 'Guardian';

  return (
    <View style={styles.rootContainer}>
      {/* Offline banner sits above everything */}
      <OfflineBanner />

      {/* Gradient background behind scroll */}
      <LinearGradient
        colors={COLORS.gradient.background}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Shield size={22} color={COLORS.primary['300']} strokeWidth={2} />
            <Text style={styles.headerTitle}>ChildGuard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => router.push('/(reporter)/track')}
              activeOpacity={0.75}
            >
              <Bell size={22} color={COLORS.text.primary} strokeWidth={2} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : String(unreadCount)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── GREETING CARD ── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 480 }}
          style={styles.greetingWrapper}
        >
          <GlassCard variant="elevated" style={styles.greetingCard}>
            <LinearGradient
              colors={['rgba(14,143,168,0.18)', 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
            />
            <View style={styles.greetingContent}>
              <View style={styles.greetingTextBlock}>
                <Text style={styles.greetingName}>Hello, {userName}</Text>
                <Text style={styles.greetingSubtitle}>
                  Stay vigilant, protect children
                </Text>
              </View>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBadgeText}>Active Protector</Text>
              </View>
            </View>
          </GlassCard>
        </MotiView>

        {/* ── STATS STRIP ── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 480, delay: 100 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsStrip}
          >
            <View style={styles.statCardWrapper}>
              <StatCard
                label="Cases Reported"
                value={myReports.length}
                icon={<Flag size={18} color={COLORS.primary['300']} strokeWidth={2} />}
                color={COLORS.primary['500']}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                label="Community Cases"
                value={147}
                icon={<Shield size={18} color={COLORS.gold} strokeWidth={2} />}
                color={COLORS.gold}
                trend="+12"
              />
            </View>
          </ScrollView>
        </MotiView>

        {/* ── ACTION GRID ── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 160 }}
          style={styles.sectionContainer}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {ACTION_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <MotiView
                  key={item.id}
                  from={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: 'spring',
                    delay: 200 + index * 80,
                    stiffness: 160,
                    damping: 18,
                  }}
                  style={styles.actionCardWrapper}
                >
                  <GlassCard
                    style={styles.actionCard}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.82}
                  >
                    {/* Icon circle */}
                    <View
                      style={[
                        styles.actionIconCircle,
                        { backgroundColor: `${item.iconBg}28`, borderColor: `${item.iconBg}55` },
                      ]}
                    >
                      {item.pulsing ? (
                        <MotiView
                          from={{ scale: 1, opacity: 0.7 }}
                          animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
                          transition={{
                            type: 'timing',
                            duration: 1200,
                            loop: true,
                          }}
                        >
                          <Icon size={24} color={item.iconBg} strokeWidth={2} />
                        </MotiView>
                      ) : (
                        <Icon size={24} color={item.iconBg} strokeWidth={2} />
                      )}
                    </View>

                    {/* Text block */}
                    <View style={styles.actionTextBlock}>
                      <Text style={styles.actionTitle}>{item.title}</Text>
                      <Text style={styles.actionSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>

                    {/* Chevron */}
                    <ChevronRight
                      size={16}
                      color={COLORS.text.muted}
                      strokeWidth={2}
                      style={styles.actionChevron}
                    />
                  </GlassCard>
                </MotiView>
              );
            })}
          </View>
        </MotiView>

        {/* ── RECENT REPORTS ── */}
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 480, delay: 380 }}
          style={styles.sectionContainer}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Reports</Text>
            {myReports.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/(reporter)/track')}
                activeOpacity={0.75}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={14} color={COLORS.primary['300']} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>

          {myReports.length > 0 ? (
            myReports.slice(0, 3).map((report) => (
              <CaseCard
                key={report.id}
                caseItem={report}
                onPress={() =>
                  router.push({
                    pathname: '/(reporter)/track',
                    params: { caseId: report.id },
                  } as any)
                }
              />
            ))
          ) : (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <FileText size={28} color={COLORS.text.muted} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>No reports yet</Text>
                <Text style={styles.emptyBody}>
                  Reports you submit will appear here so you can track their progress.
                </Text>
                <TouchableOpacity
                  style={styles.emptyAction}
                  onPress={() => router.push('/(reporter)/report')}
                  activeOpacity={0.8}
                >
                  <Flag size={14} color={COLORS.primary['300']} strokeWidth={2} />
                  <Text style={styles.emptyActionText}>File a Report</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}
        </MotiView>

        {/* Bottom spacer for FAB + tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Emergency FAB */}
      <EmergencyFAB />
    </View>
  );
}

const STAT_CARD_WIDTH = SCREEN_WIDTH * 0.44;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.surface.dark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SAFE_TOP,
    paddingBottom: SPACING.xxl,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.emergency['500'],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: COLORS.surface.dark,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    lineHeight: 12,
    color: COLORS.text.primary,
  },

  // ── Greeting ──
  greetingWrapper: {
    marginHorizontal: SPACING.screen,
    marginBottom: SPACING.lg,
  },
  greetingCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  greetingContent: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  greetingTextBlock: {
    gap: SPACING.xs,
  },
  greetingName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  greetingSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.gold}1A`,
    borderWidth: 1,
    borderColor: `${COLORS.gold}44`,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  activeBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.gold,
    letterSpacing: 0.3,
  },

  // ── Stats strip ──
  statsStrip: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screen,
    gap: SPACING.md,
    paddingBottom: SPACING.base,
  },
  statCardWrapper: {
    width: STAT_CARD_WIDTH,
  },

  // ── Section container ──
  sectionContainer: {
    paddingHorizontal: SPACING.screen,
    marginBottom: SPACING.section,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.primary['300'],
  },

  // ── Action grid ──
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCardWrapper: {
    width: (SCREEN_WIDTH - SPACING.screen * 2 - SPACING.md) / 2,
  },
  actionCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.sm,
    minHeight: 120,
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextBlock: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  actionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  actionChevron: {
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },

  // ── Empty state ──
  emptyCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  emptyBody: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
    backgroundColor: `${COLORS.primary['500']}1A`,
    borderWidth: 1,
    borderColor: `${COLORS.primary['500']}44`,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
  },
  emptyActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.primary['300'],
  },

  // ── Bottom spacer ──
  bottomSpacer: {
    height: 96,
  },
});
