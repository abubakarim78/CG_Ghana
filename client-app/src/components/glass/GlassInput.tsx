import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  BLUR_INTENSITY,
  GLASS_BLUR_TINT,
} from '../../theme';

interface GlassInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  error?: string;
  rightIcon?: React.ReactNode;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function GlassInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 3,
  keyboardType = 'default',
  secureTextEntry = false,
  error,
  rightIcon,
  editable = true,
  onFocus,
  onBlur,
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);

  function handleFocus() {
    setFocused(true);
    onFocus?.();
  }

  function handleBlur() {
    setFocused(false);
    onBlur?.();
  }

  const borderColor = error
    ? COLORS.emergency[500]
    : focused
    ? COLORS.primary[500]
    : COLORS.surface.glassBorder;

  const inputContainerStyle: ViewStyle = {
    borderWidth: 1,
    borderColor,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    minHeight: multiline ? 80 : 48,
  };

  const inputStyle = {
    flex: 1,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: TYPOGRAPHY.body.fontSize,
    lineHeight: TYPOGRAPHY.body.lineHeight,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    textAlignVertical: multiline ? ('top' as const) : ('center' as const),
    minHeight: multiline ? 80 : undefined,
  };

  const inputInner = (
    <View style={styles.inputRow}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.muted}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : undefined}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={inputStyle}
        selectionColor={COLORS.primary[500]}
        underlineColorAndroid="transparent"
      />
      {rightIcon && (
        <View style={styles.rightIconContainer}>{rightIcon}</View>
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <View style={inputContainerStyle}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={BLUR_INTENSITY}
            tint={GLASS_BLUR_TINT}
            style={styles.blurFill}
          >
            {inputInner}
          </BlurView>
        ) : (
          <View
            style={[
              styles.androidFill,
              { backgroundColor: 'rgba(255,255,255,0.10)' },
            ]}
          >
            {inputInner}
          </View>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.base,
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  blurFill: {
    flex: 1,
  },
  androidFill: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightIconContainer: {
    paddingRight: SPACING.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.emergency[500],
    marginTop: SPACING.xs,
  },
});
