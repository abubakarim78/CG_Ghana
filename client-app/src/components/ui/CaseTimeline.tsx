import React, { useEffect, useRef } from 'react';
import { useTimeTick } from '../../hooks/useTimeTick';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CaseTimelineEvent, CaseStatus } from '../../types/models';
import { getStatusColor } from '../../utils/colorUtils';
import { getStatusLabel, formatRelativeTime } from '../../utils/formatters';
import { CheckCircle, Clock, Circle } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

interface CaseTimelineProps {
  timeline: CaseTimelineEvent[];
  currentStatus: CaseStatus;
}

interface TimelineItemProps {
  event: CaseTimelineEvent;
  isFirst: boolean;
  isLast: boolean;
  isCurrent: boolean;
  isPast: boolean;
}

function TimelineItem({ event, isFirst, isLast, isCurrent, isPast }: TimelineItemProps) {
  const color = getStatusColor(event.status);
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!isCurrent) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isCurrent, glowAnim]);

  const dotSize = isCurrent ? 20 : 14;
  const dotColor = isPast || isCurrent ? color : COLORS.text.muted;
  const textColor = isPast || isCurrent ? COLORS.text.primary : COLORS.text.muted;
  const subColor = isPast || isCurrent ? COLORS.text.secondary : COLORS.text.muted;

  return (
    <View style={styles.item}>
      {/* Left column: dot + connector */}
      <View style={styles.leftCol}>
        {/* Top connector line (hidden for first item) */}
        {!isFirst && (
          <View
            style={[
              styles.connectorTop,
              { backgroundColor: isPast || isCurrent ? color : COLORS.text.muted },
            ]}
          />
        )}

        {/* Dot indicator */}
        <Animated.View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isPast || isCurrent ? dotColor : 'transparent',
              borderWidth: isPast || isCurrent ? 0 : 2,
              borderColor: dotColor,
            },
            isCurrent && {
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: glowAnim,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
        >
          {isPast && !isCurrent && (
            <CheckCircle
              size={dotSize}
              color={color}
              strokeWidth={2.5}
              style={{ position: 'absolute' }}
            />
          )}
          {isCurrent && (
            <Clock
              size={dotSize - 6}
              color={COLORS.text.primary}
              strokeWidth={2.5}
            />
          )}
          {!isPast && !isCurrent && (
            <Circle size={dotSize} color={COLORS.text.muted} strokeWidth={2} />
          )}
        </Animated.View>

        {/* Bottom connector line (hidden for last item) */}
        {!isLast && (
          <View
            style={[
              styles.connectorBottom,
              { backgroundColor: isPast ? color : COLORS.text.muted },
            ]}
          />
        )}
      </View>

      {/* Right column: text content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: textColor }]}>{event.title}</Text>
          <Text style={[styles.timestamp, { color: subColor }]}>
            {formatRelativeTime(event.timestamp)}
          </Text>
        </View>

        <Text style={[styles.description, { color: subColor }]} numberOfLines={3}>
          {event.description}
        </Text>

        {event.officerName != null && (
          <View
            style={[
              styles.officerBadge,
              { backgroundColor: `${color}18`, borderColor: `${color}40` },
            ]}
          >
            <Text style={[styles.officerText, { color }]}>
              {event.officerName}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const STATUS_ORDER: CaseStatus[] = [
  'submitted',
  'assigned',
  'investigating',
  'intervention',
  'resolved',
];

export function CaseTimeline({ timeline, currentStatus }: CaseTimelineProps) {
  useTimeTick();
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Case Progress</Text>
      {timeline.map((event, index) => {
        const eventStatusIdx = STATUS_ORDER.indexOf(event.status);
        const isPast = eventStatusIdx < currentIdx;
        const isCurrent = eventStatusIdx === currentIdx;

        return (
          <TimelineItem
            key={event.id}
            event={event}
            isFirst={index === 0}
            isLast={index === timeline.length - 1}
            isCurrent={isCurrent}
            isPast={isPast}
          />
        );
      })}
    </View>
  );
}

const DOT_COLUMN_WIDTH = 28;

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    color: COLORS.text.secondary,
    letterSpacing: 0.5,
    marginBottom: SPACING.base,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  leftCol: {
    width: DOT_COLUMN_WIDTH,
    alignItems: 'center',
  },
  connectorTop: {
    width: 2,
    flex: 1,
    minHeight: SPACING.md,
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectorBottom: {
    width: 2,
    flex: 1,
    minHeight: SPACING.xl,
  },
  content: {
    flex: 1,
    paddingBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  title: {
    fontFamily: FONTS.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  timestamp: {
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 16,
    flexShrink: 0,
    marginTop: 2,
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: 13,
    lineHeight: 19,
  },
  officerBadge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  officerText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    lineHeight: 16,
  },
});
