import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react-native';
import { useNetworkSync } from '../../hooks';
import { COLORS, FONTS, SPACING } from '../../theme';

const BANNER_HEIGHT = 44;
const AUTO_HIDE_DELAY = 3000;

export function OfflineBanner() {
  const { isOnline, queueCount, isSyncing } = useNetworkSync();
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Spin animation for sync icon
  useEffect(() => {
    if (!isSyncing) {
      spinAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [isSyncing, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shouldShow = !isOnline || isSyncing;

  useEffect(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    if (shouldShow) {
      setVisible(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      // Auto-hide 3 s after coming back online and fully synced
      hideTimer.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -BANNER_HEIGHT,
          duration: 280,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, AUTO_HIDE_DELAY);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [shouldShow, translateY]);

  if (!visible) return null;

  const isOffline = !isOnline;
  const bgColor = isOffline
    ? 'rgba(224,27,27,0.92)'
    : 'rgba(14,143,168,0.92)';

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: bgColor, transform: [{ translateY }] },
      ]}
    >
      {isOffline ? (
        <>
          <WifiOff size={14} color={COLORS.text.primary} strokeWidth={2.5} />
          <Text style={styles.text}>You are offline</Text>
        </>
      ) : isSyncing ? (
        <>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <RefreshCw size={14} color={COLORS.text.primary} strokeWidth={2.5} />
          </Animated.View>
          <Text style={styles.text}>
            Syncing {queueCount} {queueCount === 1 ? 'report' : 'reports'}...
          </Text>
        </>
      ) : (
        <>
          <Wifi size={14} color={COLORS.text.primary} strokeWidth={2.5} />
          <Text style={styles.text}>Back online</Text>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
  },
  text: {
    fontFamily: FONTS.bodySemi,
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
});
