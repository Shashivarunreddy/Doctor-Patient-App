export const Colors = {
  primary: '#0058bc',
  primaryDark: '#004494',
  primaryDeep: '#001a41',
  primaryLight: '#adc6ff',
  primaryFaded: '#f0f3ff',
  accent: '#ff9f43',

  background: '#f9f9ff',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  card: '#ffffff',
  navyDark: '#151c27',

  text: '#151c27',
  textSecondary: '#5c6571',
  textTertiary: '#727784',
  textInverse: '#ffffff',
  textLink: '#0058bc',

  border: '#c2c6d5',
  borderLight: '#e2e8f8',
  divider: '#c2c6d5',

  success: '#10B981',
  successLight: '#d1fae5',
  warning: '#af6100',
  warningLight: '#ffdcc2',
  danger: '#ba1a1a',
  dangerLight: '#ffdad6',
  info: '#0058bc',
  infoLight: '#d8e2ff',

  overlay: 'rgba(21, 28, 39, 0.4)',
  shadow: 'rgba(0, 88, 188, 0.05)',

  statusConfirmed: '#0058bc',
  statusCompleted: '#10B981',
  statusCancelled: '#ba1a1a',
  statusPending: '#af6100',
  statusApproved: '#10B981',
  statusRejected: '#ba1a1a',
  statusInProgress: '#8b4c00',
  statusScheduled: '#0058bc',
  statusPaid: '#10B981',
  statusRefunded: '#af6100',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',

  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
  },

  lineHeights: {
    xs: 16,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 40,
    hero: 48,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  massive: 80,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 10,
  },
};

export const Gradients = {
  primary: ['#0058bc', '#004494'] as const,
  primaryLight: ['#adc6ff', '#0058bc'] as const,
  accent: ['#2e72da', '#0058bc'] as const,
  dark: ['#151c27', '#2a313d'] as const,
  card: ['#ffffff', '#f9f9ff'] as const,
  success: ['#10B981', '#059669'] as const,
  danger: ['#ba1a1a', '#93000a'] as const,
};
