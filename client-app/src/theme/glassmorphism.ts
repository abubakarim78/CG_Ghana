import { Platform } from 'react-native';
import { COLORS } from './colors';

export const BLUR_INTENSITY = 25;
export const GLASS_BLUR_TINT = 'dark' as const;

export const GLASS = {
  default: {
    backgroundColor: COLORS.surface.glass,
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    borderRadius: 16,
  },
  elevated: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
  },
  emergency: {
    backgroundColor: 'rgba(224,27,27,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(224,27,27,0.35)',
    borderRadius: 20,
  },
  gold: {
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.30)',
    borderRadius: 16,
  },
  success: {
    backgroundColor: 'rgba(30,154,63,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(30,154,63,0.35)',
    borderRadius: 16,
  },
} as const;

export const SHADOW = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 3,
    },
    android: {
      elevation: 3,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.24,
      shadowRadius: 6,
    },
    android: {
      elevation: 6,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.32,
      shadowRadius: 12,
    },
    android: {
      elevation: 12,
    },
  }),
};
