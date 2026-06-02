import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { useAuthStore, useCasesStore } from '../../src/store';
import { GlassCard } from '../../src/components/glass';
import { StatCard } from '../../src/components/ui';
import { MOCK_STATS } from '../../src/mock/stats';
import { MOCK_OFFICERS } from '../../src/mock/officers';
import { HEATMAP_DATA } from '../../src/mock/heatmap';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, FONTS } from '../../src/theme';
import { getCaseTypeLabel } from '../../src/utils';
import {
  BarChart2,
  Users,
  MapPin,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  ClipboardList,
  X,
  UserCheck,
  Share2,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.82);

const BAR_MAX_HEIGHT = 100;

// ─── STATUS BADGE COLORS ────────────────────────────────────────────────────
function getStatusColor(status: string): string {
  switch (status) {
    case 'submitted': return COLORS.gold;
    case 'assigned': return COLORS.primary['300'];
    case 'investigating': return '#7EC8F4';
    case 'intervention': return COLORS.emergency['300'];
    case 'resolved': return COLORS.secondary['500'];
    default: return COLORS.text.muted;
  }
}

// ─── ASSIGN CASES MODAL ─────────────────────────────────────────────────────
interface AssignCasesModalProps {
  visible: boolean;
  onClose: () => void;
}

function AssignCasesModal({ visible, onClose }: AssignCasesModalProps) {
  const updateCaseStatus = useCasesStore((s) => s.updateCaseStatus);
  const liveCases = useCasesStore((s) => s.cases);
  const officers = useCasesStore((s) => s.officers);
  // Permanent per-session assignment tracking: caseId -> officerName
  const [sessionAssigned, setSessionAssigned] = useState<Record<string, string>>({});

  // Show all non-resolved cases so admin can also re-assign investigating cases
  const assignableCases = liveCases.filter((c) => c.status !== 'resolved');

  function handleAssign(caseId: string, officer: any) {
    updateCaseStatus(
      caseId,
      'assigned',
      `Case assigned to ${officer.name} via Admin Panel.`,
      officer.name
    );
    // Permanently mark this case as assigned in this session (no timeout)
    setSessionAssigned((prev) => ({ ...prev, [caseId]: officer.name }));
  }

  function handleClose() {
    // Reset session state when modal closes
    setSessionAssigned({});
    onClose();
  }

  const sessionCount = Object.keys(sessionAssigned).length;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          {/* Header */}
          <View style={modalStyles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <UserCheck size={20} color={COLORS.primary['300']} strokeWidth={2} />
              <Text style={modalStyles.sheetTitle}>Assign Cases</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={modalStyles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={COLORS.text.muted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={modalStyles.sheetSub}>
            {assignableCases.length} case{assignableCases.length !== 1 ? 's' : ''} awaiting assignment
          </Text>

          {/* Session summary banner */}
          {sessionCount > 0 && (
            <View style={modalStyles.sessionBanner}>
              <CheckCircle size={14} color={COLORS.gold} strokeWidth={2} />
              <Text style={modalStyles.sessionBannerText}>
                {sessionCount} case{sessionCount !== 1 ? 's' : ''} assigned this session
              </Text>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: SPACING.xxxl }}
          >
            {assignableCases.length === 0 ? (
              <View style={modalStyles.emptyState}>
                <CheckCircle size={36} color={COLORS.secondary['500']} strokeWidth={1.5} />
                <Text style={modalStyles.emptyText}>All cases are assigned.</Text>
              </View>
            ) : (
              assignableCases.map((c) => {
                const statusColor = getStatusColor(c.status);
                const assignedOfficerName = sessionAssigned[c.id];
                return (
                  <View key={c.id} style={modalStyles.caseCard}>
                    {/* Case info row */}
                    <View style={modalStyles.caseInfoRow}>
                      <Text style={modalStyles.caseId} numberOfLines={1}>{(c as any).caseNumber ?? c.id}</Text>
                      <View style={[modalStyles.statusBadge, { borderColor: statusColor }]}>
                        <Text style={[modalStyles.statusBadgeText, { color: statusColor }]}>
                          {c.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={modalStyles.caseType} numberOfLines={1}>
                      {getCaseTypeLabel(c.type)}
                    </Text>
                    <Text style={modalStyles.caseDistrict}>
                      {c.location.district}, {c.location.region}
                    </Text>

                    {/* Assigned-this-session state: permanent green checkmark + re-assign link */}
                    {assignedOfficerName ? (
                      <View>
                        <View style={modalStyles.successRow}>
                          <CheckCircle size={14} color={COLORS.secondary['500']} strokeWidth={2} />
                          <Text style={modalStyles.successText}>
                            Assigned to {assignedOfficerName}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            setSessionAssigned((prev) => {
                              const next = { ...prev };
                              delete next[c.id];
                              return next;
                            })
                          }
                          activeOpacity={0.7}
                          style={{ marginTop: SPACING.xs }}
                        >
                          <Text style={modalStyles.reassignLink}>Re-assign</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <Text style={modalStyles.assignLabel}>Assign to officer:</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={{ marginTop: SPACING.xs }}
                        >
                          <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                            {officers.map((officer: any) => (
                              <TouchableOpacity
                                key={officer.id}
                                style={[
                                  modalStyles.officerBtn,
                                  c.assignedOfficerId === officer.id && modalStyles.officerBtnActive,
                                ]}
                                activeOpacity={0.75}
                                onPress={() => handleAssign(c.id, officer)}
                              >
                                <Text
                                  style={[
                                    modalStyles.officerBtnText,
                                    c.assignedOfficerId === officer.id && modalStyles.officerBtnTextActive,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {officer.name}
                                </Text>
                                <Text style={modalStyles.officerBtnBadge}>{officer.badge}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </>
                    )}
                  </View>
                );
              })
            )}
            <View style={{ height: SPACING.xl }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── GENERATE REPORT MODAL ───────────────────────────────────────────────────
interface GenerateReportModalProps {
  visible: boolean;
  onClose: () => void;
}

const REPORT_CASE_TYPES = [
  { label: 'Child Labour', count: 62, color: COLORS.gold },
  { label: 'Trafficking', count: 31, color: COLORS.emergency['300'] },
  { label: 'Physical Abuse', count: 28, color: '#E07B4F' },
  { label: 'Early Marriage', count: 15, color: COLORS.primary['300'] },
  { label: 'Neglect', count: 11, color: COLORS.text.muted },
];
const REPORT_TOTAL_TYPES = REPORT_CASE_TYPES.reduce((s, x) => s + x.count, 0);

const REPORT_REGIONS = [
  { region: 'Greater Accra', count: 38 },
  { region: 'Ashanti', count: 31 },
  { region: 'Volta', count: 24 },
  { region: 'Northern', count: 19 },
  { region: 'Western', count: 14 },
];

const REPORT_RECOMMENDATIONS = [
  'Increase rapid-response capacity in Accra Metropolitan and Kumasi Metropolitan, which together account for 47% of open cases.',
  'Establish dedicated anti-trafficking task force in Volta Region due to 40% rise in fishing-related child labour cases since Q1 2026.',
  'Prioritise school re-enrollment outreach in Bono East and Upper East regions where early withdrawal rates exceed national average by 2.1x.',
];

function GenerateReportModal({ visible, onClose }: GenerateReportModalProps) {
  async function handleShare() {
    const summary =
      `CHILDGUARD GHANA — DISTRICT REPORT (MAY 2026)\n` +
      `============================================\n\n` +
      `EXECUTIVE SUMMARY\n` +
      `  Total Cases Tracked:    147\n` +
      `  Open Cases:              89\n` +
      `  Resolved This Month:     23\n` +
      `  Critical Cases:          12\n\n` +
      `CASE TYPE BREAKDOWN\n` +
      REPORT_CASE_TYPES
        .map((t) => `  ${t.label.padEnd(20)} ${t.count} cases (${Math.round((t.count / REPORT_TOTAL_TYPES) * 100)}%)`)
        .join('\n') +
      `\n\nTOP REGIONS BY CASE LOAD\n` +
      REPORT_REGIONS.map((r) => `  ${r.region.padEnd(22)} ${r.count} cases`).join('\n') +
      `\n\nOFFICER PERFORMANCE\n` +
      useCasesStore.getState().officers.map(
        (o: any) => `  ${o.name.padEnd(24)} ${o.caseload} active  ${o.resolvedThisMonth} resolved`
      ).join('\n') +
      `\n\nKEY RECOMMENDATIONS\n` +
      REPORT_RECOMMENDATIONS.map((r, i) => `  ${i + 1}. ${r}`).join('\n') +
      `\n\nGenerated by ChildGuard Ghana Admin Panel — May 2026`;

    try {
      await Share.share({
        title: 'ChildGuard District Report — May 2026',
        message: summary,
      });
    } catch {
      // dismissed
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.sheet, { paddingBottom: 0 }]}>
          {/* Header */}
          <View style={modalStyles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
              <FileText size={20} color={COLORS.gold} strokeWidth={2} />
              <Text style={[modalStyles.sheetTitle, { color: COLORS.gold }]}>
                District Report
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn} activeOpacity={0.7}>
              <X size={20} color={COLORS.text.muted} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Coat-of-arms inspired banner */}
            <LinearGradient
              colors={['rgba(245,166,35,0.18)', 'rgba(245,166,35,0.04)']}
              style={reportStyles.banner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={reportStyles.bannerInner}>
                <View style={reportStyles.shieldIcon}>
                  <Shield size={28} color={COLORS.gold} strokeWidth={1.5} />
                </View>
                <View>
                  <Text style={reportStyles.bannerTitle}>District Report — May 2026</Text>
                  <Text style={reportStyles.bannerSub}>
                    ChildGuard Ghana  •  Republic of Ghana
                  </Text>
                  <Text style={reportStyles.bannerSub}>
                    Department of Social Welfare — Child Protection Unit
                  </Text>
                </View>
              </View>
              <View style={reportStyles.goldDivider} />
            </LinearGradient>

            {/* Executive Summary */}
            <View style={reportStyles.section}>
              <Text style={reportStyles.sectionTitle}>Executive Summary</Text>
              <View style={reportStyles.summaryGrid}>
                {[
                  { label: 'Total Cases', value: '147', color: COLORS.primary['300'] },
                  { label: 'Open Cases', value: '89', color: COLORS.gold },
                  { label: 'Resolved (May)', value: '23', color: COLORS.secondary['500'] },
                  { label: 'Critical', value: '12', color: COLORS.emergency['300'] },
                ].map((item) => (
                  <View key={item.label} style={reportStyles.summaryCard}>
                    <Text style={[reportStyles.summaryValue, { color: item.color }]}>
                      {item.value}
                    </Text>
                    <Text style={reportStyles.summaryLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Case Type Breakdown */}
            <View style={reportStyles.section}>
              <Text style={reportStyles.sectionTitle}>Case Type Breakdown</Text>
              {REPORT_CASE_TYPES.map((item) => {
                const pct = Math.round((item.count / REPORT_TOTAL_TYPES) * 100);
                return (
                  <View key={item.label} style={reportStyles.typeRow}>
                    <Text style={reportStyles.typeLabel}>{item.label}</Text>
                    <View style={reportStyles.typeBarTrack}>
                      <View
                        style={[
                          reportStyles.typeBarFill,
                          { width: `${pct}%`, backgroundColor: item.color },
                        ]}
                      />
                    </View>
                    <Text style={[reportStyles.typePct, { color: item.color }]}>
                      {item.count} ({pct}%)
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Regional Distribution */}
            <View style={reportStyles.section}>
              <Text style={reportStyles.sectionTitle}>Regional Distribution (Top 5)</Text>
              {REPORT_REGIONS.map((r, i) => (
                <View key={r.region} style={reportStyles.regionRow}>
                  <Text style={reportStyles.regionRank}>{i + 1}</Text>
                  <Text style={reportStyles.regionName}>{r.region}</Text>
                  <Text style={reportStyles.regionCount}>{r.count} cases</Text>
                </View>
              ))}
            </View>

            {/* Officer Performance */}
            <View style={reportStyles.section}>
              <Text style={reportStyles.sectionTitle}>Officer Performance</Text>
              <View style={reportStyles.tableHeader}>
                <Text style={[reportStyles.tableCell, { flex: 2 }]}>Officer</Text>
                <Text style={[reportStyles.tableCell, reportStyles.tableCellRight]}>Active</Text>
                <Text style={[reportStyles.tableCell, reportStyles.tableCellRight]}>Resolved</Text>
              </View>
              {useCasesStore.getState().officers.map((o: any) => (
                <View key={o.id} style={reportStyles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={reportStyles.officerNameCell}>{o.name}</Text>
                    <Text style={reportStyles.officerBadgeCell}>{o.badge}</Text>
                  </View>
                  <Text style={[reportStyles.tableCell, reportStyles.tableCellRight, { color: COLORS.gold }]}>
                    {o.caseload}
                  </Text>
                  <Text style={[reportStyles.tableCell, reportStyles.tableCellRight, { color: COLORS.secondary['500'] }]}>
                    {o.resolvedThisMonth}
                  </Text>
                </View>
              ))}
            </View>

            {/* Key Recommendations */}
            <View style={reportStyles.section}>
              <Text style={reportStyles.sectionTitle}>Key Recommendations</Text>
              {REPORT_RECOMMENDATIONS.map((rec, i) => (
                <View key={i} style={reportStyles.recRow}>
                  <View style={reportStyles.recBullet}>
                    <Text style={reportStyles.recBulletText}>{i + 1}</Text>
                  </View>
                  <Text style={reportStyles.recText}>{rec}</Text>
                </View>
              ))}
            </View>

            {/* Share Button */}
            <TouchableOpacity
              style={reportStyles.shareBtn}
              activeOpacity={0.8}
              onPress={handleShare}
            >
              <Share2 size={16} color='#0A1E2A' strokeWidth={2.5} />
              <Text style={reportStyles.shareBtnText}>Share Report</Text>
            </TouchableOpacity>

            <View style={{ height: SPACING.xxxl }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminPanelScreen() {
  const user = useAuthStore((s) => s.user);
  const { loadCases, loadStats, loadOfficers, stats, officers } = useCasesStore();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  React.useEffect(() => {
    loadCases();
    loadStats();
    loadOfficers();
  }, []);

  const barMaxValue = Math.max(1, ...(stats?.monthlyTrend ?? []).map((d: any) => d.count));

  return (
    <LinearGradient
      colors={COLORS.gradient.background}
      style={styles.root}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            {user?.name ? (
              <Text style={styles.headerSub}>Welcome, {user.name}</Text>
            ) : null}
          </View>
          <View style={styles.adminBadge}>
            <Shield size={14} color={COLORS.gold} strokeWidth={2.5} />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </MotiView>

        {/* ── STAT CARDS ROW ── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 420, delay: 60 }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            <View style={styles.statWrapper}>
              <StatCard
                label="Total Cases"
                value={stats?.totalCases ?? 0}
                icon={<ClipboardList size={18} color={COLORS.primary['500']} strokeWidth={2} />}
                color={COLORS.primary['500']}
                trend="+8%"
              />
            </View>
            <View style={styles.statWrapper}>
              <StatCard
                label="Open Cases"
                value={stats?.openCases ?? 0}
                icon={<AlertTriangle size={18} color={COLORS.gold} strokeWidth={2} />}
                color={COLORS.gold}
                trend="+3"
              />
            </View>
            <View style={styles.statWrapper}>
              <StatCard
                label="Resolved This Month"
                value={stats?.resolvedThisMonth ?? 0}
                icon={<CheckCircle size={18} color={COLORS.secondary['500']} strokeWidth={2} />}
                color={COLORS.secondary['500']}
                trend="+5"
              />
            </View>
            <View style={styles.statWrapper}>
              <StatCard
                label="Critical"
                value={stats?.criticalCases ?? 0}
                icon={<AlertTriangle size={18} color={COLORS.emergency['500']} strokeWidth={2} />}
                color={COLORS.emergency['500']}
                variant="critical"
                trend="-2"
              />
            </View>
          </ScrollView>
        </MotiView>

        {/* ── TREND BAR CHART ── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 440, delay: 120 }}
          style={styles.section}
        >
          <GlassCard style={styles.chartCard}>
            <View style={styles.sectionHeader}>
              <BarChart2 size={18} color={COLORS.primary['300']} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Monthly Cases</Text>
            </View>
            <View style={styles.barChart}>
              {(stats?.monthlyTrend ?? []).map((item: any, i: number) => {
                const barH = Math.round((item.count / barMaxValue) * BAR_MAX_HEIGHT);
                return (
                  <View key={item.month} style={styles.barColumn}>
                    <Text style={styles.barValue}>{item.count}</Text>
                    <MotiView
                      from={{ height: 0 }}
                      animate={{ height: barH }}
                      transition={{ type: 'spring', delay: i * 80, damping: 18 }}
                      style={[
                        styles.bar,
                        {
                          backgroundColor:
                            i === (stats?.monthlyTrend?.length ?? 1) - 1
                              ? COLORS.primary['300']
                              : COLORS.primary['500'],
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{item.month}</Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        </MotiView>

        {/* ── CASE TYPE DISTRIBUTION ── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 440, delay: 180 }}
          style={styles.section}
        >
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={18} color={COLORS.primary['300']} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Cases by Type</Text>
            </View>
            {(stats?.casesByType ?? []).map((item: any) => {
              const total = (stats?.casesByType ?? []).reduce((s: number, x: any) => s + x.value, 0);
              const pct = Math.round((item.value / total) * 100);
              return (
                <View key={item.label} style={styles.typeRow}>
                  <Text style={styles.typeLabel}>{item.label}</Text>
                  <View style={styles.progressTrack}>
                    <MotiView
                      from={{ width: '0%' as unknown as number }}
                      animate={{ width: `${pct}%` as unknown as number }}
                      transition={{ type: 'timing', duration: 600, delay: 200 }}
                      style={[styles.progressFill, { backgroundColor: item.color }]}
                    />
                  </View>
                  <Text style={[styles.typePct, { color: item.color }]}>{pct}%</Text>
                </View>
              );
            })}
          </GlassCard>
        </MotiView>

        {/* ── OFFICER PERFORMANCE TABLE ── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 440, delay: 240 }}
          style={styles.section}
        >
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Users size={18} color={COLORS.primary['300']} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Officers</Text>
            </View>
            {officers.map((officer: any, i: number) => {
              const caseloadPct = Math.min((officer.caseload / 10) * 100, 100);
              const roleColor =
                officer.role === 'police_dovvsu'
                  ? COLORS.primary['500']
                  : officer.role === 'ngo_agent'
                  ? COLORS.gold
                  : COLORS.secondary['500'];

              return (
                <MotiView
                  key={officer.id}
                  from={{ opacity: 0, translateX: -12 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', delay: i * 60, duration: 320 }}
                  style={styles.officerRow}
                >
                  {/* Name + badge */}
                  <View style={styles.officerLeft}>
                    <View style={styles.officerNameRow}>
                      <Text style={styles.officerName} numberOfLines={1}>
                        {officer.name}
                      </Text>
                      <View style={[styles.badgePill, { borderColor: roleColor }]}>
                        <Text style={[styles.badgePillText, { color: roleColor }]}>
                          {officer.badge}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.officerDistrict}>{officer.district}</Text>
                    <View style={styles.officerCaseloadRow}>
                      <View style={styles.caseloadTrack}>
                        <View
                          style={[
                            styles.caseloadFill,
                            {
                              width: `${caseloadPct}%`,
                              backgroundColor: roleColor,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.caseloadLabel}>{officer.caseload} active</Text>
                    </View>
                  </View>
                  {/* Resolved badge */}
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedNum}>{officer.resolvedThisMonth}</Text>
                    <Text style={styles.resolvedText}>resolved</Text>
                  </View>
                </MotiView>
              );
            })}
          </GlassCard>
        </MotiView>

        {/* ── HEATMAP PREVIEW ── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 440, delay: 300 }}
          style={styles.section}
        >
          <GlassCard style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MapPin size={18} color={COLORS.primary['300']} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Case Distribution</Text>
            </View>

            {/* Map placeholder */}
            <View style={styles.mapPlaceholder}>
              <LinearGradient
                colors={['#0E2A3A', '#0A1E2A', '#071420']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              {/* Decorative dots */}
              {HEATMAP_DATA.slice(0, 6).map((pt: typeof HEATMAP_DATA[0], i: number) => (
                <View
                  key={pt.district}
                  style={[
                    styles.mapDot,
                    {
                      width: 8 + pt.intensity * 16,
                      height: 8 + pt.intensity * 16,
                      borderRadius: 99,
                      backgroundColor: `rgba(224,27,27,${pt.intensity * 0.7})`,
                      top: `${15 + i * 12}%`,
                      left: `${10 + (i % 3) * 30}%`,
                    },
                  ]}
                />
              ))}
              <Text style={styles.mapOverlayText}>District Heatmap</Text>
              <Text style={styles.mapOverlaySub}>Ghana Child Protection Cases</Text>
            </View>

            {/* District intensity rows */}
            {HEATMAP_DATA.map((pt: typeof HEATMAP_DATA[0], i: number) => (
              <MotiView
                key={pt.district}
                from={{ opacity: 0, translateX: 12 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', delay: i * 50, duration: 300 }}
                style={styles.heatRow}
              >
                <Text style={styles.heatDistrict} numberOfLines={1}>
                  {pt.district}
                </Text>
                <View style={styles.intensityTrack}>
                  <View
                    style={[
                      styles.intensityFill,
                      {
                        width: `${pt.intensity * 100}%`,
                        backgroundColor: `rgba(224,27,27,${0.4 + pt.intensity * 0.6})`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.heatCountBadge}>
                  <Text style={styles.heatCount}>{pt.caseCount}</Text>
                </View>
              </MotiView>
            ))}
          </GlassCard>
        </MotiView>

        {/* ── QUICK ACTIONS ── */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 440, delay: 360 }}
          style={styles.actionsRow}
        >
          <TouchableOpacity
            style={styles.ghostButton}
            activeOpacity={0.75}
            onPress={() => setShowAssignModal(true)}
          >
            <ClipboardList size={16} color={COLORS.primary['300']} strokeWidth={2} />
            <Text style={styles.ghostButtonText}>Assign Cases</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ghostButton}
            activeOpacity={0.75}
            onPress={() => setShowReportModal(true)}
          >
            <FileText size={16} color={COLORS.primary['300']} strokeWidth={2} />
            <Text style={styles.ghostButtonText}>Generate Report</Text>
          </TouchableOpacity>
        </MotiView>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <AssignCasesModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
      />
      <GenerateReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.xl + 8,
    paddingHorizontal: SPACING.base,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  headerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderColor: 'rgba(245,166,35,0.4)',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  adminBadgeText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.gold,
  },
  logoutButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },

  /* Stats row */
  statsRow: {
    gap: SPACING.sm,
    paddingRight: SPACING.base,
    paddingBottom: SPACING.xs,
  },
  statWrapper: {
    width: 148,
  },

  /* Section */
  section: {
    marginTop: SPACING.lg,
  },
  sectionCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },

  /* Bar Chart */
  chartCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.xl,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 40,
    paddingTop: SPACING.lg,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
  },
  bar: {
    width: 28,
    borderRadius: RADIUS.sm,
    minHeight: 4,
  },
  barValue: {
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  barLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    marginTop: 4,
  },

  /* Case type */
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typeLabel: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.secondary,
    width: 100,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  typePct: {
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    width: 36,
    textAlign: 'right',
  },

  /* Officer rows */
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: SPACING.sm,
  },
  officerLeft: {
    flex: 1,
    gap: 4,
  },
  officerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'nowrap',
  },
  officerName: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.text.primary,
    flexShrink: 1,
  },
  badgePill: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 1,
  },
  badgePillText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  officerDistrict: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
  },
  officerCaseloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
  },
  caseloadTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  caseloadFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  caseloadLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.text.muted,
    width: 50,
  },
  resolvedBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(30,154,63,0.15)',
    borderColor: 'rgba(30,154,63,0.3)',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minWidth: 52,
  },
  resolvedNum: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.secondary['300'],
  },
  resolvedText: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.text.muted,
    letterSpacing: 0.3,
  },

  /* Heatmap */
  mapPlaceholder: {
    height: 140,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapDot: {
    position: 'absolute',
  },
  mapOverlayText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  mapOverlaySub: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  heatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs + 2,
  },
  heatDistrict: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.text.secondary,
    width: 130,
  },
  intensityTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  heatCountBadge: {
    width: 30,
    alignItems: 'flex-end',
  },
  heatCount: {
    fontFamily: FONTS.bodySemi,
    fontSize: 12,
    color: COLORS.emergency['300'],
  },

  /* Quick actions */
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  ghostButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    backgroundColor: COLORS.surface.glass,
  },
  ghostButtonText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.primary['300'],
  },

  bottomSpacer: {
    height: SPACING.xxxl,
  },
});

// ─── MODAL STYLES ────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,18,30,0.82)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface.glassBorder,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.surface.glassBorder,
    borderRightWidth: 1,
    borderRightColor: COLORS.surface.glassBorder,
    height: MODAL_SHEET_HEIGHT,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 0,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  sheetTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  sheetSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginBottom: SPACING.base,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.muted,
  },
  caseCard: {
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  caseInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  caseId: {
    ...TYPOGRAPHY.code,
    color: COLORS.gold,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.captionSemi,
    fontSize: 10,
  },
  caseType: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  caseDistrict: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    marginBottom: SPACING.sm,
  },
  assignLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  officerBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    alignItems: 'center',
  },
  officerBtnActive: {
    backgroundColor: 'rgba(14,143,168,0.18)',
    borderColor: COLORS.primary['500'],
  },
  officerBtnText: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.text.secondary,
  },
  officerBtnTextActive: {
    color: COLORS.primary['500'],
  },
  officerBtnBadge: {
    ...TYPOGRAPHY.label,
    fontSize: 9,
    color: COLORS.text.muted,
    marginTop: 1,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  successText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary['500'],
  },
  reassignLink: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    textDecorationLine: 'underline',
    marginLeft: SPACING.xs,
  },
  sessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sessionBannerText: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.gold,
  },
});

// ─── REPORT STYLES ───────────────────────────────────────────────────────────
const reportStyles = StyleSheet.create({
  banner: {
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  bannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    padding: SPACING.base,
  },
  shieldIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.gold,
    marginBottom: 2,
  },
  bannerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
  goldDivider: {
    height: 1,
    backgroundColor: 'rgba(245,166,35,0.25)',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
    marginBottom: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  summaryTile: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: COLORS.surface.glass,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    padding: SPACING.md,
    alignItems: 'center',
  },
  summaryValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    flex: 1,
  },
  typeBar: {
    height: 6,
    borderRadius: 3,
    flex: 2,
    backgroundColor: COLORS.surface.glass,
    overflow: 'hidden',
  },
  typeBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  typePct: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.text.muted,
    width: 32,
    textAlign: 'right',
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.glass,
  },
  regionName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  regionCount: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.primary['500'],
  },
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.glass,
    gap: SPACING.sm,
  },
  officerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary['50'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  officerInitials: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.primary['500'],
  },
  officerName: {
    ...TYPOGRAPHY.bodyMed,
    color: COLORS.text.primary,
    flex: 1,
  },
  officerStats: {
    alignItems: 'flex-end',
  },
  officerCaseload: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.text.secondary,
  },
  officerResolved: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary['500'],
  },
  recoItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface.glass,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  recoNum: {
    ...TYPOGRAPHY.h4,
    color: COLORS.gold,
    width: 20,
  },
  recoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.40)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  shareBtnText: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.gold,
  },
  // aliases used in modal JSX
  summaryCard: {
    flex: 1,
    minWidth: '44%' as unknown as number,
    backgroundColor: COLORS.surface.glass,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    padding: SPACING.md,
    alignItems: 'center' as const,
  },
  typeBarTrack: {
    height: 6,
    borderRadius: 3,
    flex: 2,
    backgroundColor: COLORS.surface.glass,
    overflow: 'hidden' as const,
  },
  regionRank: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.muted,
    width: 20,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.glassBorder,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tableRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.glass,
  },
  tableCell: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    flex: 1,
  },
  tableCellRight: {
    textAlign: 'right' as const,
  },
  officerNameCell: {
    ...TYPOGRAPHY.bodyMed,
    color: COLORS.text.primary,
  },
  officerBadgeCell: {
    ...TYPOGRAPHY.label,
    fontSize: 9,
    color: COLORS.text.muted,
  },
  recRow: {
    flexDirection: 'row' as const,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface.glass,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  recBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(245,166,35,0.18)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 1,
  },
  recBulletText: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.gold,
    fontSize: 10,
  },
  recText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
});
