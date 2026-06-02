import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore, useCasesStore } from '../../src/store';
import { GlassCard } from '../../src/components/glass/GlassCard';
import { CaseStatus, CasePriority } from '../../src/types/models';
import {
  getCaseTypeLabel,
  getStatusLabel,
  formatRelativeTime,
} from '../../src/utils/formatters';
import { getStatusColor, getPriorityColor } from '../../src/utils/colorUtils';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, FONTS } from '../../src/theme';
import {
  Search,
  Filter,
  CheckCircle,
  UserCheck,
  AlertTriangle,
  Clock,
  MapPin,
  X,
  ChevronDown,
  Users,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_FILTERS: Array<{ label: string; value: CaseStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Investigating', value: 'investigating' },
  { label: 'Intervention', value: 'intervention' },
  { label: 'Resolved', value: 'resolved' },
];

const PRIORITY_ORDER: Record<CasePriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function AdminCasesScreen() {
  const { cases, officers, updateCaseStatus, assignOfficer } = useCasesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<CaseStatus | 'all'>('all');
  const [filterPriority] = useState<CasePriority | 'all'>('all');
  const [sessionAssigned, setSessionAssigned] = useState<Record<string, string>>({});
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalCases = cases.length;
  const unassigned = cases.filter((c) => c.status === 'submitted').length;
  const inProgress = cases.filter(
    (c) => c.status === 'assigned' || c.status === 'investigating'
  ).length;
  const resolved = cases.filter((c) => c.status === 'resolved').length;

  // ── Filtered & sorted list ────────────────────────────────────────────────
  const filteredCases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return cases
      .filter((c) => {
        if (filterStatus !== 'all' && c.status !== filterStatus) return false;
        if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
        if (q) {
          const typeLabel = getCaseTypeLabel(c.type).toLowerCase();
          const district = c.location.district.toLowerCase();
          const id = c.id.toLowerCase();
          if (!id.includes(q) && !typeLabel.includes(q) && !district.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const pDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (pDiff !== 0) return pDiff;
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      });
  }, [cases, searchQuery, filterStatus, filterPriority]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleAssignOfficer(
    caseId: string,
    officerId: string,
    officerName: string
  ) {
    updateCaseStatus(
      caseId,
      'assigned',
      `Assigned to ${officerName} by admin`,
      officerName
    );
    if (officerId) assignOfficer?.(caseId, officerId);
    setSessionAssigned((prev) => ({ ...prev, [caseId]: officerName }));
    setExpandedCaseId(null);
  }

  function handleCardPress(caseId: string) {
    setExpandedCaseId((prev) => (prev === caseId ? null : caseId));
  }

  function clearSession() {
    setSessionAssigned({});
  }

  const sessionCount = Object.keys(sessionAssigned).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={COLORS.gradient.background}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          sessionCount > 0 && styles.scrollContentWithBar,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Case Management</Text>
          <Text style={styles.headerSubtitle}>
            Assign and track all active cases
          </Text>
        </View>

        {/* ── Search Bar ── */}
        <View style={styles.searchContainer}>
          <GlassCard style={styles.searchCard}>
            <View style={styles.searchRow}>
              <Search
                size={18}
                color={COLORS.text.muted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by ID, type, or district..."
                placeholderTextColor={COLORS.text.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color={COLORS.text.muted} />
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        </View>

        {/* ── Status Filter Tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContent}
          style={styles.filterTabs}
        >
          {STATUS_FILTERS.map((item) => {
            const active = filterStatus === item.value;
            const color =
              item.value === 'all'
                ? COLORS.primary[500]
                : getStatusColor(item.value as CaseStatus);
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setFilterStatus(item.value)}
                style={[
                  styles.filterPill,
                  active && { backgroundColor: color, borderColor: color },
                  !active && { borderColor: 'rgba(255,255,255,0.18)' },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    active && styles.filterPillTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Stats Row ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRowContent}
          style={styles.statsRow}
        >
          <StatCard label="Total Cases" value={totalCases} color={COLORS.primary[300]} />
          <StatCard label="Unassigned" value={unassigned} color={COLORS.status.submitted} />
          <StatCard label="In Progress" value={inProgress} color={COLORS.status.investigating} />
          <StatCard label="Resolved" value={resolved} color={COLORS.status.resolved} />
        </ScrollView>

        {/* ── Cases List ── */}
        <View style={styles.listSection}>
          {filteredCases.length === 0 ? (
            <View style={styles.emptyState}>
              <Filter size={40} color={COLORS.text.muted} />
              <Text style={styles.emptyStateText}>
                No cases match your filters
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filter selection
              </Text>
            </View>
          ) : (
            filteredCases.map((c) => {
              const isExpanded = expandedCaseId === c.id;
              const assignedName = sessionAssigned[c.id];
              const priorityColor = getPriorityColor(c.priority);
              const statusColor = getStatusColor(c.status);

              return (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.82}
                  onPress={() => handleCardPress(c.id)}
                  style={styles.caseCardWrapper}
                >
                  <GlassCard style={styles.caseCard}>
                    {/* Priority bar */}
                    <View
                      style={[
                        styles.priorityBar,
                        { backgroundColor: priorityColor },
                      ]}
                    />

                    <View style={styles.caseCardInner}>
                      {/* Header row */}
                      <View style={styles.caseHeaderRow}>
                        <Text style={styles.caseId}>{c.id}</Text>
                        <View style={styles.badgeRow}>
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: statusColor + '22', borderColor: statusColor + '66' },
                            ]}
                          >
                            <Text
                              style={[styles.badgeText, { color: statusColor }]}
                            >
                              {getStatusLabel(c.status)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor: priorityColor + '22',
                                borderColor: priorityColor + '55',
                                marginLeft: SPACING.xs,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                { color: priorityColor },
                              ]}
                            >
                              {c.priority.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.timeRow}>
                          <Clock size={11} color={COLORS.text.muted} style={{ marginRight: 3 }} />
                          <Text style={styles.timeAgo}>
                            {formatRelativeTime(c.reportedAt)}
                          </Text>
                        </View>
                      </View>

                      {/* Type row */}
                      <Text style={styles.caseTypeLabel} numberOfLines={1}>
                        {getCaseTypeLabel(c.type)}
                      </Text>
                      <View style={styles.districtRow}>
                        <MapPin size={12} color={COLORS.text.muted} style={{ marginRight: 4 }} />
                        <Text style={styles.districtText}>
                          {c.location.district}, {c.location.region}
                        </Text>
                      </View>

                      {/* Emergency tag */}
                      {c.isEmergency && (
                        <View style={styles.emergencyTag}>
                          <Text style={styles.emergencyTagText}>
                            🚨 EMERGENCY
                          </Text>
                        </View>
                      )}

                      {/* Assignment row */}
                      <View style={styles.assignmentSection}>
                        {assignedName ? (
                          <View style={styles.assignedRow}>
                            <CheckCircle size={14} color={COLORS.secondary[500]} style={{ marginRight: 5 }} />
                            <Text style={styles.assignedText}>
                              Assigned to{' '}
                              <Text style={styles.assignedName}>
                                {assignedName}
                              </Text>
                            </Text>
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation?.();
                                setExpandedCaseId(
                                  expandedCaseId === c.id ? null : c.id
                                );
                              }}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={styles.reassignLink}
                            >
                              <Text style={styles.reassignText}>Re-assign</Text>
                            </TouchableOpacity>
                          </View>
                        ) : !isExpanded ? (
                          <TouchableOpacity
                            style={styles.assignButton}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              setExpandedCaseId(c.id);
                            }}
                            activeOpacity={0.75}
                          >
                            <UserCheck size={14} color={COLORS.gold} style={{ marginRight: 6 }} />
                            <Text style={styles.assignButtonText}>
                              Assign Officer
                            </Text>
                            <ChevronDown size={13} color={COLORS.gold} style={{ marginLeft: 4 }} />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      {/* Officer picker (expanded) */}
                      {isExpanded && (
                        <View style={styles.officerPickerSection}>
                          <View style={styles.officerPickerHeader}>
                            <Users size={13} color={COLORS.text.muted} style={{ marginRight: 5 }} />
                            <Text style={styles.officerPickerLabel}>
                              Select an officer
                            </Text>
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation?.();
                                setExpandedCaseId(null);
                              }}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={styles.cancelLink}
                            >
                              <X size={13} color={COLORS.text.muted} />
                              <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.officerChipsContent}
                          >
                            {officers.map((officer: any) => {
                              const isActive =
                                c.assignedOfficerId === officer.id;
                              return (
                                <TouchableOpacity
                                  key={officer.id}
                                  style={[
                                    styles.officerChip,
                                    isActive && styles.officerChipActive,
                                  ]}
                                  onPress={(e) => {
                                    e.stopPropagation?.();
                                    handleAssignOfficer(
                                      c.id,
                                      officer.id,
                                      officer.name
                                    );
                                  }}
                                  activeOpacity={0.75}
                                >
                                  <Text
                                    style={[
                                      styles.officerChipName,
                                      isActive && styles.officerChipNameActive,
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {officer.name}
                                  </Text>
                                  <View style={styles.officerChipMeta}>
                                    <Text style={styles.officerChipBadge}>
                                      {officer.badge}
                                    </Text>
                                    <View
                                      style={[
                                        styles.caseloadBadge,
                                        officer.caseload >= 5 &&
                                          styles.caseloadBadgeHigh,
                                      ]}
                                    >
                                      <Text style={styles.caseloadText}>
                                        {officer.caseload} cases
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ── Session Summary Bar ── */}
      {sessionCount > 0 && (
        <TouchableOpacity
          style={styles.sessionBar}
          onPress={clearSession}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(245,166,35,0.92)', 'rgba(240,165,0,0.92)']}
            style={styles.sessionBarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <CheckCircle size={16} color={COLORS.surface.dark} style={{ marginRight: 8 }} />
            <Text style={styles.sessionBarText}>
              {sessionCount} case{sessionCount > 1 ? 's' : ''} assigned — tap to clear
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Sub-component: Stat Card ──────────────────────────────────────────────────
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <GlassCard style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface.dark,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  scrollContentWithBar: {
    paddingBottom: 72,
  },

  // Header
  header: {
    paddingTop: SPACING.xxl + SPACING.lg,
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.base,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.muted,
  },

  // Search
  searchContainer: {
    paddingHorizontal: SPACING.screen,
    marginBottom: SPACING.md,
  },
  searchCard: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },

  // Filter tabs
  filterTabs: {
    marginBottom: SPACING.md,
  },
  filterTabsContent: {
    paddingHorizontal: SPACING.screen,
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  filterPillText: {
    ...TYPOGRAPHY.captionSemi,
    color: COLORS.text.muted,
  },
  filterPillTextActive: {
    color: COLORS.text.primary,
  },

  // Stats row
  statsRow: {
    marginBottom: SPACING.lg,
  },
  statsRowContent: {
    paddingHorizontal: SPACING.screen,
    gap: SPACING.sm,
  },
  statCard: {
    width: 100,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    lineHeight: 28,
  },
  statLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginTop: 2,
  },

  // Cases list
  listSection: {
    paddingHorizontal: SPACING.screen,
    gap: SPACING.md,
  },
  caseCardWrapper: {
    marginBottom: SPACING.sm,
  },
  caseCard: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  priorityBar: {
    width: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  caseCardInner: {
    flex: 1,
    paddingLeft: SPACING.base + 4,
    paddingRight: SPACING.md,
    paddingVertical: SPACING.md,
  },

  // Case header row
  caseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  caseId: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    color: COLORS.gold,
    letterSpacing: 0.5,
    marginRight: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },

  // Type / district
  caseTypeLabel: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  districtText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },

  // Emergency
  emergencyTag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.emergency[500] + '22',
    borderWidth: 1,
    borderColor: COLORS.emergency[500] + '55',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.sm,
  },
  emergencyTagText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    color: COLORS.emergency[300],
    letterSpacing: 0.5,
  },

  // Assignment section
  assignmentSection: {
    marginTop: SPACING.xs,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  assignedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary[300],
  },
  assignedName: {
    fontFamily: FONTS.bodySemi,
    color: COLORS.secondary[300],
  },
  reassignLink: {
    marginLeft: SPACING.sm,
  },
  reassignText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary[300],
    textDecorationLine: 'underline',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold + '18',
    borderWidth: 1,
    borderColor: COLORS.gold + '44',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  assignButtonText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.gold,
  },

  // Officer picker
  officerPickerSection: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: SPACING.sm,
  },
  officerPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  officerPickerLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    flex: 1,
  },
  cancelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cancelText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
  officerChipsContent: {
    gap: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  officerChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 130,
    maxWidth: 170,
  },
  officerChipActive: {
    backgroundColor: COLORS.primary[500] + '28',
    borderColor: COLORS.primary[500] + '88',
  },
  officerChipName: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.text.primary,
    marginBottom: 3,
  },
  officerChipNameActive: {
    color: COLORS.primary[300],
  },
  officerChipMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  officerChipBadge: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.text.muted,
    letterSpacing: 0.3,
  },
  caseloadBadge: {
    backgroundColor: COLORS.secondary[500] + '22',
    borderRadius: RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  caseloadBadgeHigh: {
    backgroundColor: COLORS.emergency[500] + '22',
  },
  caseloadText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    color: COLORS.text.muted,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyStateText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.muted,
    textAlign: 'center',
  },

  // Session bar
  sessionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sessionBarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.screen,
  },
  sessionBarText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    color: COLORS.surface.dark,
  },
});
