import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Text,
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  BLUR_INTENSITY,
} from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  fullScreen?: boolean;
}

export function GlassModal({
  visible,
  onClose,
  children,
  title,
  showCloseButton = true,
  fullScreen = false,
}: GlassModalProps) {
  const overlayContent = (
    <View style={styles.overlay}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={BLUR_INTENSITY}
          tint="dark"
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {/* Semi-transparent dark scrim on top of blur */}
      <View style={styles.scrim} pointerEvents="none" />
    </View>
  );

  const cardStyle = fullScreen
    ? styles.fullScreenCard
    : styles.centeredCard;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop — tap to close */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      >
        {overlayContent}
      </TouchableOpacity>

      {/* Content container — does not propagate taps to backdrop */}
      <View
        style={fullScreen ? styles.fullScreenWrapper : styles.centeredWrapper}
        pointerEvents="box-none"
      >
        <TouchableOpacity activeOpacity={1} style={cardStyle}>
          <GlassCard variant="elevated" style={styles.cardInner}>
            {/* Header row */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title ? (
                  <Text style={styles.title} numberOfLines={2}>
                    {title}
                  </Text>
                ) : (
                  <View style={styles.headerSpacer} />
                )}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.closeButton}
                  >
                    <X
                      size={20}
                      color={COLORS.text.secondary}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {children}
          </GlassCard>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const CARD_MAX_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: COLORS.surface.modalBg,
  },
  centeredWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  fullScreenWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  centeredCard: {
    width: '100%',
    maxWidth: CARD_MAX_WIDTH,
  },
  fullScreenCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.92,
  },
  cardInner: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.base,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
