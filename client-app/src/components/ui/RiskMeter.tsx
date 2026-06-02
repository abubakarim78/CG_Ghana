import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { getRiskColor, getRiskLabel, getRiskTier } from '../../utils/colorUtils';
import { COLORS, FONTS, SPACING, RADIUS } from '../../theme';

interface RiskMeterProps {
  score: number;
  isAnalyzing?: boolean;
}

export function RiskMeter({ score, isAnalyzing = false }: RiskMeterProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const fillAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate bar fill when score changes
  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: clampedScore,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clampedScore, fillAnim]);

  // Pulse animation for "Analyzing..." state
  useEffect(() => {
    if (!isAnalyzing) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isAnalyzing, pulseAnim]);

  const color = getRiskColor(clampedScore);
  const tier = getRiskTier(clampedScore);
  const label = getRiskLabel(clampedScore);

  const barWidth = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Color interpolation: green -> yellow -> orange -> red
  const barColor = fillAnim.interpolate({
    inputRange: [0, 24, 49, 74, 100],
    outputRange: [
      COLORS.risk.low,
      COLORS.risk.medium,
      COLORS.risk.high,
      COLORS.priority.high,
      COLORS.risk.critical,
    ],
  });

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>Risk Assessment</Text>
        {isAnalyzing ? (
          <Animated.Text style={[styles.analyzeText, { opacity: pulseAnim }]}>
            Analyzing...
          </Animated.Text>
        ) : (
          <View style={[styles.tierBadge, { backgroundColor: `${color}20`, borderColor: `${color}50` }]}>
            <Text style={[styles.tierText, { color }]}>{label}</Text>
          </View>
        )}
      </View>

      {/* Score display */}
      {!isAnalyzing && (
        <Text style={[styles.scoreText, { color }]}>{clampedScore}</Text>
      )}

      {/* Progress bar */}
      <View style={styles.trackOuter}>
        <View style={styles.trackInner}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: barWidth,
                backgroundColor: barColor,
              },
            ]}
          />
        </View>
        {/* Tick marks */}
        <View style={styles.ticks} pointerEvents="none">
          {[25, 50, 75].map((tick) => (
            <View
              key={tick}
              style={[styles.tick, { left: `${tick}%` as unknown as number }]}
            />
          ))}
        </View>
      </View>

      {/* Scale labels */}
      <View style={styles.scaleRow}>
        <Text style={styles.scaleLabel}>0</Text>
        <Text style={[styles.scaleLabel, { color: COLORS.risk.medium }]}>25</Text>
        <Text style={[styles.scaleLabel, { color: COLORS.risk.high }]}>50</Text>
        <Text style={[styles.scaleLabel, { color: COLORS.priority.high }]}>75</Text>
        <Text style={[styles.scaleLabel, { color: COLORS.risk.critical }]}>100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.text.secondary,
    letterSpacing: 0.4,
  },
  analyzeText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.primary['300'],
  },
  tierBadge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  tierText: {
    fontFamily: FONTS.bodySemi,
    fontSize: 11,
    lineHeight: 16,
  },
  scoreText: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    lineHeight: 34,
  },
  trackOuter: {
    position: 'relative',
    height: 10,
  },
  trackInner: {
    height: 10,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral[800],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  ticks: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
  },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.surface.dark,
    opacity: 0.6,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.text.muted,
    lineHeight: 14,
  },
});
