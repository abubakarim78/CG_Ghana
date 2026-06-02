import React from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';

interface SafeScrollViewProps extends Pick<ScrollViewProps, 'bounces' | 'showsVerticalScrollIndicator'> {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export function SafeScrollView({
  children,
  style,
  contentContainerStyle,
  bounces = true,
  showsVerticalScrollIndicator = false,
}: SafeScrollViewProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          bounces={bounces}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface.dark,
  },
  flex: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
