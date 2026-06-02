import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassCard } from '../glass/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  variant?: 'default' | 'critical';
  onPress?: () => void;
}

export function StatCard({
  label,
  value,
  icon,
  color,
  trend,
  variant = 'default',
  onPress,
}: StatCardProps) {
  const isCritical = variant === 'critical';
  const cardVariant = isCritical ? 'emergency' : 'default';

  const isTrendPositive =
    trend != null && (trend.startsWith('+') || !trend.startsWith('-'));

  const content = (
    <GlassCard variant={cardVariant} style={styles.card}>
      {/* Background gradient tint */}
      <LinearGradient
        colors={[`${color}18`, 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
      />

      {/* Icon circle */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: `${color}22`,
            borderColor: `${color}44`,
          },
        ]}
      >
        {icon}
      </View>

      {/* Value */}
      <Text style={[styles.value, isCritical && styles.valueCritical]}>
        {value}
      </Text>

      {/* Label row */}
      <View style={styles.bottomRow}>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>

        {trend != null && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: isTrendPositive
                  ? 'rgba(30,154,63,0.15)'
                  : 'rgba(224,27,27,0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                { color: isTrendPositive ? COLORS.secondary['500'] : COLORS.emergency['500'] },
              ]}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>
    </GlassCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    padding: SPACING.base,
    gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: FONTS.heading,
    fontSize: 26,
    lineHeight: 32,
    color: COLORS.text.primary,
  },
  valueCritical: {
    color: COLORS.emergency['300'],
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  label: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.text.secondary,
  },
  trendBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
  },
  trendText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    lineHeight: 14,
  },
});
