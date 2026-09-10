/**
 * Punnaigai Small Finances - Central Theme Colors Definition
 * Calibrated to exact UI/UX design specifications from reference design.
 * All project screens and components call colors from this central file.
 */
export const colors = {
  // Brand Deep Forest Emerald Green (Exact Match to Design Reference)
  primary: '#0D523B',
  primaryDark: '#083827',
  primaryLight: '#15803D',
  primarySoft: '#EAF5EE',
  primaryBackground: '#F2FAF6',
  soft: '#EAF5EE',

  // Secondary / Neutrals
  secondary: '#0F172A',
  secondaryLight: 'rgba(15, 23, 42, 0.08)',
  secondaryMuted: 'rgba(15, 23, 42, 0.6)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Semantic Status
  success: '#0D523B',
  successLight: '#EAF5EE',
  successDark: '#083827',
  successBorder: '#A7F3D0',
  successText: '#0D523B',

  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#991B1B',
  errorBorder: '#FECACA',
  errorText: '#DC2626',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#92400E',
  warningBorder: '#FDE68A',
  warningText: '#D97706',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#1E40AF',
  infoBorder: '#BFDBFE',
  infoText: '#2563EB',

  pending: '#F59E0B',
  pendingLight: '#FEF3C7',
  approved: '#0D523B',
  approvedLight: '#EAF5EE',
  rejected: '#EF4444',
  rejectedLight: '#FEE2E2',
  active: '#0D523B',
  activeLight: '#EAF5EE',
  overdue: '#DC2626',
  overdueLight: '#FEE2E2',

  // Surfaces & Backgrounds
  background: '#F4F9F6',
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF5EE',
  surfaceSubtle: '#F4F9F6',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textLight: '#64748B',
  textInverse: '#FFFFFF',
  textGreen: '#0D523B',
  textDisabled: '#94A3B8',

  // Borders & Dividers
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  borderLight: '#F1F5F9',
  borderGreen: '#A7F3D0',
  borderHighlight: '#A7F3D0',
  divider: '#E2E8F0',
  dividerLight: 'rgba(255, 255, 255, 0.18)',

  // Gradients
  gradientStart: '#168A53',
  gradientMiddle: '#0D523B',
  gradientEnd: '#083827',

  heroGradient: ['#083827', '#0D523B', '#15803D'] as [string, string, string],
  buttonGradient: ['#168A53', '#0D523B'] as [string, string],
  bannerGradient: ['#F2FAF6', '#EAF5EE'] as [string, string],
  alertGradient: ['#FF6B6B', '#E53935'] as [string, string],
  goldGradient: ['#F59E0B', '#FBBF24'] as [string, string],
  cardGradient: ['#FFFFFF', '#F8FAFC'] as [string, string],
  splashGradient: ['#082E20', '#0D523B', '#051D14'] as [string, string, string],

  heroCardStart: '#083827',
  heroCardEnd: '#15803D',

  alertGradientStart: '#FF6B6B',
  alertGradientEnd: '#E53935',

  goldGradientStart: '#F59E0B',
  goldGradientEnd: '#FBBF24',

  // Overlays & Alpha Tints
  overlay: 'rgba(15, 23, 42, 0.6)',
  modalOverlay: 'rgba(15, 23, 42, 0.65)',
  lightOverlay: 'rgba(255, 255, 255, 0.2)',
  primaryAlpha10: 'rgba(13, 82, 59, 0.1)',
  primaryAlpha20: 'rgba(13, 82, 59, 0.2)',
  shadowColor: '#083827',
};

export type AppColors = typeof colors;
