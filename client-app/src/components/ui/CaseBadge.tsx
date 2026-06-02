import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getStatusColor, getPriorityColor, hexToRgba } from '../../utils/colorUtils';
import { getStatusLabel, getPriorityLabel } from '../../utils/formatters';
import { CaseStatus, CasePriority } from '../../types/models';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface CaseBadgeProps {
  type: 'status' | 'priority';
  value: CaseStatus | CasePriority;
  size?: 'sm' | 'md';
}

export function CaseBadge({ type, value, size = 'md' }: CaseBadgeProps) {
  const color =
    type === 'status'
      ? getStatusColor(value as CaseStatus)
      : getPriorityColor(value as CasePriority);

  const label =
    type === 'status'
      ? getStatusLabel(value as CaseStatus)
      : getPriorityLabel(value as CasePriority);

  const isCritical = type === 'priority' && value === 'critical';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isCritical) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isCritical, pulseAnim]);

  const isSmall = size === 'sm';

  const containerStyle = [
    styles.badge,
    isSmall ? styles.badgeSm : styles.badgeMd,
    {
      backgroundColor: hexToRgba(color, 0.1),
      borderColor: color,
      borderWidth: isCritical ? 1.5 : 1,
    },
    ...(isCritical ? [styles.criticalGlow] : []),
  ].filter(Boolean);

  const textStyle: object[] = [
    styles.label,
    isSmall ? styles.labelSm : styles.labelMd,
    { color },
  ];

  if (isCritical) {
    return (
      <Animated.View style={[containerStyle, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={textStyle}>{label}</Text>
      </Animated.View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs - 1,
  },
  badgeMd: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  label: {
    fontFamily: TYPOGRAPHY.caption.fontFamily,
    letterSpacing: 0.3,
  },
  labelSm: {
    fontSize: 10,
    lineHeight: 14,
  },
  labelMd: {
    fontSize: 12,
    lineHeight: 16,
  },
  criticalGlow: {
    shadowColor: '#E01B1B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
});
