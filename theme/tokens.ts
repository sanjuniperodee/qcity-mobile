// Apple HIG spacing - 8pt grid system
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// Apple HIG radius - consistent rounded corners
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999, // Fully rounded
};

// Apple HIG colors - system colors with semantic naming
export const colors = {
  // Primary brand color
  primary: '#F09235',
  primaryDark: '#D67A1F',
  primaryLight: '#FFB366',
  primaryText: '#FFFFFF',
  
  // System colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D55',
  
  // Text colors
  text: '#000000',
  textSecondary: '#3C3C43',
  textTertiary: '#3C3C4399', // 60% opacity
  textMuted: '#8E8E93',
  textPlaceholder: '#C7C7CC',
  
  // Background colors
  bg: '#FFFFFF',
  bgSecondary: '#F2F2F7',
  bgTertiary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F9F9',
  
  // Border colors
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  separator: '#C6C6C8',
  
  // Semantic colors
  mutedBg: '#FFF4EA',
  error: '#FF3B30',
  errorBg: '#FFEBEE',
  success: '#34C759',
  successBg: '#E8F5E9',
  warning: '#FF9500',
  warningBg: '#FFF3E0',
  info: '#007AFF',
  infoBg: '#E3F2FD',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

// Apple HIG shadows - subtle depth
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;


