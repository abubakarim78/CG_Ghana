import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Search,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  FileText,
} from 'lucide-react-native';
import { useReportsStore, useCasesStore } from '../../src/store';
import { CaseTimeline } from '../../src/components/ui/CaseTimeline';
import { CaseCard } from '../../src/components/ui/CaseCard';
import { CaseBadge } from '../../src/components/ui/CaseBadge';
import { GlassCard } from '../../src/components/glass/GlassCard';
import { GlassInput } from '../../src/components/glass/GlassInput';
import { GlassButton } from '../../src/components/glass/GlassButton';
import {
  getStatusLabel,
  formatDate,
  getCaseTypeLabel,
} from '../../src/utils/formatters';
import { Case } from '../../src/types/models';
import { COLORS, FONTS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/theme';

type TabId = 'my_reports' | 'track_by_id';

export default function TrackScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('my_reports');
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundCase, setFoundCase] = useState<Case | null>(null);
  const [lastSynced] = useState<Date>(new Date());

  const { myReports } = useReportsStore();
  const { cases, loadCases, getCaseById } = useCasesStore();

  useEffect(() => {
    if (cases.length === 0) loadCases();
  }, []);

  function handleSearch() {
    const trimmed = searchId.trim().toUpperCase();
    if (!trimmed) {
      setSearchError('Please enter a case ID.');
      return;
    }

    // Accept both "CG-00001" and bare numeric "1"
    const normalised = trimmed.startsWith('CG-')
      ? trimmed
      : `CG-${trimmed.padStart(5, '0')}`;

    setIsSearching(true);
    setSearchError('');
    setFoundCase(null);

    // Simulate async lookup
    setTimeout(() => {
      // First check user's own reports, then the full cases store
      const result =
        myReports.find((r) => r.id === normalised) ?? getCaseById(normalised);

      setIsSearching(false);
      if (result) {
        setFoundCase(result);
      } else {
        setSearchError(`No case found for "${normalised}". Check the ID and try again.`);
      }
    }, 600);
  }

  return (
    <LinearGradient
      colors={COLORS.gradient.background}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.text.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Case</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my_reports' && styles.tabActive]}
          onPress={() => setActiveTab('my_reports')}
          activeOpacity={0.75}
        >
          <FileText
            size={15}
            color={activeTab === 'my_reports' ? COLORS.primary[500] : COLORS.text.muted}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'my_reports' && styles.tabLabelActive,
            ]}
          >
            My Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'track_by_id' && styles.tabActive]}
          onPress={() => setActiveTab('track_by_id')}
          activeOpacity={0.75}
        >
          <Search
            size={15}
            color={activeTab === 'track_by_id' ? COLORS.primary[500] : COLORS.text.muted}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'track_by_id' && styles.tabLabelActive,
            ]}
          >
            Track by ID
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {activeTab === 'my_reports' ? (
        <MyReportsTab myReports={myReports} />
      ) : (
        <TrackByIdTab
          searchId={searchId}
          onChangeSearchId={(t) => {
            setSearchId(t);
            if (searchError) setSearchError('');
            if (foundCase) setFoundCase(null);
          }}
          onSearch={handleSearch}
          isSearching={isSearching}
          searchError={searchError}
          foundCase={foundCase}
          lastSynced={lastSynced}
        />
      )}
    </LinearGradient>
  );
}

// ── My Reports tab ────────────────────────────────────────────────────────────

function MyReportsTab({ myReports }: { myReports: Case[] }) {
  if (myReports.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
          <FileText size={40} color={COLORS.text.muted} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>No reports yet</Text>
        <Text style={styles.emptyCaption}>
          Reports you submit will appear here so you can track their progress.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.listScroll}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.listCountLabel}>
        {myReports.length} report{myReports.length !== 1 ? 's' : ''}
      </Text>
      {myReports.map((item) => (
        <CaseCard
          key={item.id}
          caseItem={item}
          onPress={() => {}}
          showOfficer
        />
      ))}
    </ScrollView>
  );
}

// ── Track by ID tab ───────────────────────────────────────────────────────────

interface TrackByIdProps {
  searchId: string;
  onChangeSearchId: (t: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  searchError: string;
  foundCase: Case | null;
  lastSynced: Date;
}

function TrackByIdTab({
  searchId,
  onChangeSearchId,
  onSearch,
  isSearching,
  searchError,
  foundCase,
  lastSynced,
}: TrackByIdProps) {
  return (
    <ScrollView
      style={styles.listScroll}
      contentContainerStyle={styles.trackContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search input */}
      <GlassInput
        label="Case Reference Number"
        value={searchId}
        onChangeText={onChangeSearchId}
        placeholder="e.g. CG-00001"
        error={searchError}
        rightIcon={
          isSearching ? (
            <ActivityIndicator size="small" color={COLORS.primary[500]} />
          ) : undefined
        }
      />

      <GlassButton
        label="Search"
        variant="primary"
        icon={<Search size={18} color={COLORS.text.primary} strokeWidth={2} />}
        onPress={onSearch}
        loading={isSearching}
        style={styles.searchButton}
      />

      {/* Result card */}
      {foundCase != null && (
        <>
          <CaseHeaderCard caseItem={foundCase} />
          <GlassCard style={styles.timelineCard}>
            <CaseTimeline
              timeline={foundCase.timeline}
              currentStatus={foundCase.status}
            />
          </GlassCard>

          {/* Last synced */}
          <View style={styles.syncRow}>
            <Clock size={12} color={COLORS.text.muted} strokeWidth={2} />
            <Text style={styles.syncLabel}>
              Last synced {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// ── Case header card (shown in Track by ID results) ───────────────────────────

function CaseHeaderCard({ caseItem }: { caseItem: Case }) {
  return (
    <GlassCard style={styles.caseHeaderCard}>
      {/* Type + badges */}
      <View style={styles.caseHeaderTop}>
        <Text style={styles.caseType} numberOfLines={2}>
          {getCaseTypeLabel(caseItem.type)}
        </Text>
        <View style={styles.badgeGroup}>
          <CaseBadge type="status" value={caseItem.status} size="sm" />
          <View style={{ width: SPACING.xs }} />
          <CaseBadge type="priority" value={caseItem.priority} size="sm" />
        </View>
      </View>

      {/* Meta rows */}
      <View style={styles.caseMetaRow}>
        <MapPin size={13} color={COLORS.text.muted} strokeWidth={2} />
        <Text style={styles.caseMetaText}>
          {caseItem.location.district}, {caseItem.location.region}
        </Text>
      </View>

      {caseItem.assignedOfficerName != null && (
        <View style={styles.caseMetaRow}>
          <User size={13} color={COLORS.text.muted} strokeWidth={2} />
          <Text style={styles.caseMetaText}>
            Assigned to {caseItem.assignedOfficerName}
          </Text>
        </View>
      )}

      <View style={styles.caseMetaRow}>
        <Clock size={13} color={COLORS.text.muted} strokeWidth={2} />
        <Text style={styles.caseMetaText}>
          Reported {formatDate(caseItem.reportedAt)}
        </Text>
      </View>

      {/* Status sentence */}
      <View
        style={[
          styles.statusBanner,
          { borderColor: getStatusBannerColor(caseItem.status) },
        ]}
      >
        <Text
          style={[
            styles.statusBannerText,
            { color: getStatusBannerColor(caseItem.status) },
          ]}
        >
          {getStatusSentence(caseItem.status)}
        </Text>
      </View>
    </GlassCard>
  );
}

function getStatusBannerColor(status: Case['status']): string {
  return COLORS.status[status];
}

function getStatusSentence(status: Case['status']): string {
  const map: Record<Case['status'], string> = {
    submitted: 'Your report has been received and is awaiting review.',
    assigned: 'An officer has been assigned and will reach out shortly.',
    investigating: 'The officer is actively investigating this case.',
    intervention: 'A field intervention is currently underway.',
    resolved: 'This case has been resolved. Thank you for reporting.',
  };
  return map[status];
}

// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header ────────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.xxxl + SPACING.sm,
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.base,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Tabs ──────────────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.screen,
    backgroundColor: COLORS.surface.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    marginBottom: SPACING.base,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  tabActive: {
    backgroundColor: 'rgba(14,143,168,0.15)',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary[500],
  },
  tabLabel: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text.muted,
  },
  tabLabelActive: {
    color: COLORS.primary[500],
  },

  // My Reports tab ────────────────────────────────────────────────────────────
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.xxxl,
  },
  listCountLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.muted,
    marginBottom: SPACING.sm,
  },

  // Empty state ───────────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  emptyCaption: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Track by ID tab ───────────────────────────────────────────────────────────
  trackContent: {
    paddingHorizontal: SPACING.screen,
    paddingBottom: SPACING.xxxl,
  },
  searchButton: {
    marginBottom: SPACING.xl,
  },

  // Found case header card ────────────────────────────────────────────────────
  caseHeaderCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.base,
  },
  caseHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  caseType: {
    ...TYPOGRAPHY.bodySemi,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  caseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  caseMetaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
    flex: 1,
  },
  statusBanner: {
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  statusBannerText: {
    ...TYPOGRAPHY.caption,
    lineHeight: 18,
  },

  // Timeline card ─────────────────────────────────────────────────────────────
  timelineCard: {
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },

  // Sync footer ───────────────────────────────────────────────────────────────
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  syncLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.muted,
  },
});
