import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useCasesStore } from '../../src/store/casesStore';
import { useOfflineStore } from '../../src/store/offlineStore';
import { GlassCard } from '../../src/components/glass/GlassCard';
import { StatCard } from '../../src/components/ui/StatCard';
import { CaseCard } from '../../src/components/ui/CaseCard';
import { CaseBadge } from '../../src/components/ui/CaseBadge';
import { OfflineBanner } from '../../src/components/ui/OfflineBanner';
import {
  Shield,
  Bell,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import { COLORS, FONTS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';
import { Case, CaseStatus } from '../../src/types/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterTab = 'all' | 'mine' | 'active' | 'critical' | 'resolved';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Mine' },
  { key: 'active', label: 'Active' },
  { key: 'critical', label: 'Critical' },
  { key: 'resolved', label: 'Resolved' },
];

function filterCases(cases: Case[], tab: FilterTab, officerId?: string): Case[] {
  switch (tab) {
    case 'mine':
      return cases.filter((c) => officerId && c.assignedOfficerId === officerId);
    case 'active':
      return cases.filter((c) =>
        ['assigned', 'investigating', 'intervention'].includes(c.status)
      );
    case 'critical':
      return cases.filter((c) => c.priority === 'critical');
    case 'resolved':
      return cases.filter((c) => c.status === 'resolved');
    default:
      return cases;
  }
}

export default function OfficerDashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { cases, officers, loadCases, loadOfficers } = useCasesStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [notificationCount] = useState(3);

  useEffect(() => {
    loadCases();
    loadOfficers();
  }, []);

  const officer = officers.find((o: any) => o.id === user?.officerId);
  const myOfficerId: string | undefined = user?.officerId ?? officer?.id;

  // All cases are visible; "Mine" tab narrows to assigned cases
  const filteredCases = filterCases(cases, activeTab, myOfficerId);

  // Stats computed from all cases
  const myCases = myOfficerId
    ? cases.filter((c) => c.assignedOfficerId === myOfficerId)
    : [];
  const assignedCount = myCases.filter((c) =>
    ['assigned', 'investigating', 'intervention'].includes(c.status)
  ).length;
  const pendingReviewCount = cases.filter((c) => c.status === 'submitted').length;
  const resolvedThisMonth = officer?.resolvedThisMonth ?? 0;
  const criticalCount = cases.filter((c) => c.priority === 'critical').length;

  const displayName = officer?.name ?? user?.name ?? 'Officer';
  const badgeNumber = officer?.badge ?? '—';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient.background}
        style={StyleSheet.absoluteFill}
      />

      <OfflineBanner />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarCircle}>
                <Shield size={20} color={COLORS.primary[500]} strokeWidth={2} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.officerName} numberOfLines={1}>
                  {displayName}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>OFFICER</Text>
                  </View>
                  <Text style={styles.badgeNumber}>{badgeNumber}</Text>
                </View>
              </View>
            </View>

            {/* Bell with notification badge */}
            <TouchableOpacity style={styles.bellButton} activeOpacity={0.75}>
              <Bell size={22} color={COLORS.text.primary} strokeWidth={2} />
              {notificationCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

          </View>
        </MotiView>

        {/* ─── Stats Row ─── */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 420, delay: 80 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
            style={styles.statsScroll}
          >
            <View style={styles.statCardWrapper}>
              <StatCard
                label="Assigned"
                value={assignedCount}
                icon={<Users size={18} color={COLORS.primary[500]} strokeWidth={2} />}
                color={COLORS.primary[500]}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                label="Pending Review"
                value={pendingReviewCount}
                icon={<Clock size={18} color={COLORS.status.assigned} strokeWidth={2} />}
                color={COLORS.status.assigned}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                label="Resolved This Month"
                value={resolvedThisMonth}
                icon={<CheckCircle size={18} color={COLORS.secondary[500]} strokeWidth={2} />}
                color={COLORS.secondary[500]}
                trend={`+${resolvedThisMonth}`}
              />
            </View>
            <View style={styles.statCardWrapper}>
              <StatCard
                label="Critical"
                value={criticalCount}
                icon={<AlertTriangle size={18} color={COLORS.emergency[500]} strokeWidth={2} />}
                color={COLORS.emergency[500]}
                variant={criticalCount > 0 ? 'critical' : 'default'}
              />
            </View>
          </ScrollView>
        </MotiView>

        {/* ─── Filter Tabs ─── */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 380, delay: 140 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={styles.tabsScroll}
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  activeOpacity={0.75}
                  style={[
                    styles.tabPill,
                    isActive && styles.tabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      isActive && styles.tabPillTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </MotiView>

        {/* ─── Cases List ─── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 440, delay: 180 }}
          style={styles.casesList}
        >
          {filteredCases.length === 0 ? (
            <View style={styles.emptyState}>
              <Filter size={36} color={COLORS.text.muted} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No cases found</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'all'
                  ? 'You have no assigned cases.'
                  : `No ${activeTab} cases match this filter.`}
              </Text>
            </View>
          ) : (
            filteredCases.map((caseItem, index) => (
              <MotiView
                key={caseItem.id}
                from={{ opacity: 0, translateX: -8 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 320, delay: index * 50 }}
              >
                <View style={styles.caseItemWrapper}>
                  {/* Critical pulsing left border */}
                  {caseItem.priority === 'critical' && (
                    <CriticalPulseBar />
                  )}
                  <CaseCard
                    caseItem={caseItem}
                    showOfficer={false}
                    onPress={() =>
                      router.push(`/(officer)/case/${caseItem.id}` as any)
                    }
                  />
                </View>
              </MotiView>
            ))
          )}
        </MotiView>
      </ScrollView>
    </View>
  );
}

/** Animated pulsing red left border for critical cases. */
function CriticalPulseBar() {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.criticalBar, { opacity }]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface.dark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.xxxl + SPACING.lg,
    paddingBottom: SPACING.xxxl + SPACING.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screen,
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary[500]}22`,
    borderWidth: 1.5,
    borderColor: `${COLORS.primary[500]}55`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.muted,
    lineHeight: 16,
  },
  officerName: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: `${COLORS.gold}22`,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: `${COLORS.gold}66`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  rolePillText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    color: COLORS.gold,
    letterSpacing: 1,
    lineHeight: 14,
  },
  badgeNumber: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    lineHeight: 16,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.emergency[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 9,
    color: COLORS.text.primary,
    lineHeight: 14,
  },
  // Stats
  statsScroll: {
    marginBottom: SPACING.xl,
  },
  statsRow: {
    paddingHorizontal: SPACING.screen,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  statCardWrapper: {
    width: 130,
  },

  // Filter Tabs
  tabsScroll: {
    marginBottom: SPACING.base,
  },
  tabsRow: {
    paddingHorizontal: SPACING.screen,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  tabPill: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
  },
  tabPillActive: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  tabPillText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  tabPillTextActive: {
    color: COLORS.text.primary,
  },

  // Cases list
  casesList: {
    paddingHorizontal: SPACING.screen,
    marginTop: SPACING.sm,
  },
  caseItemWrapper: {
    position: 'relative',
  },
  criticalBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: SPACING.sm,
    width: 4,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
    backgroundColor: COLORS.emergency[500],
    zIndex: 10,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl + SPACING.xxl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.text.secondary,
    lineHeight: 26,
  },
  emptySubtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.text.muted,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 260,
  },
});
