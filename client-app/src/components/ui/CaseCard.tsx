import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../glass/GlassCard';
import { CaseBadge } from './CaseBadge';
import { Case } from '../../types/models';
import { getCaseTypeLabel, formatRelativeTime } from '../../utils/formatters';
import { getPriorityColor } from '../../utils/colorUtils';
import { MapPin, Clock, User } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

interface CaseCardProps {
  caseItem: Case;
  onPress: () => void;
  showOfficer?: boolean;
}

export function CaseCard({ caseItem, onPress, showOfficer = false }: CaseCardProps) {
  const priorityColor = getPriorityColor(caseItem.priority);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
      <GlassCard style={styles.card}>
        {/* Priority accent bar */}
        <View style={[styles.accentBar, { backgroundColor: priorityColor }]} />

        {/* Content area */}
        <View style={styles.content}>
          {/* Top row: type label + badges */}
          <View style={styles.topRow}>
            <Text style={styles.typeLabel} numberOfLines={1}>
              {getCaseTypeLabel(caseItem.type)}
            </Text>
            <View style={styles.badges}>
              <CaseBadge type="status" value={caseItem.status} size="sm" />
              <View style={styles.badgeGap} />
              <CaseBadge type="priority" value={caseItem.priority} size="sm" />
            </View>
          </View>

          {/* Location row */}
          <View style={styles.metaRow}>
            <MapPin size={12} color={COLORS.text.muted} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {caseItem.location.district}, {caseItem.location.region}
            </Text>
          </View>

          {/* Bottom row: time + officer */}
          <View style={styles.bottomRow}>
            <View style={styles.metaRow}>
              <Clock size={12} color={COLORS.text.muted} strokeWidth={2} />
              <Text style={styles.metaText}>
                {formatRelativeTime(caseItem.reportedAt)}
              </Text>
            </View>

            {showOfficer && (
              <View style={styles.metaRow}>
                <User size={12} color={COLORS.text.muted} strokeWidth={2} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {caseItem.isAnonymous
                    ? 'Anonymous'
                    : (caseItem.assignedOfficerName ?? 'Unassigned')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: RADIUS.lg,
    minHeight: 84,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  typeLabel: {
    flex: 1,
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  badgeGap: {
    width: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.text.muted,
    lineHeight: 16,
    flexShrink: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
});
