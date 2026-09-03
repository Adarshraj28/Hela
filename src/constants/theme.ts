export const colors = {
  // Backgrounds
  bgBase: '#06060b',
  bgPrimary: '#0c0c14',
  bgSecondary: '#12121c',
  bgSurface: '#1a1a28',
  bgSurfaceHover: '#22223a',
  bgElevated: '#2a2a40',
  bgGlass: 'rgba(14, 14, 22, 0.78)',
  bgGlassSolid: 'rgba(12, 12, 20, 0.92)',

  // Text
  textPrimary: '#ededf4',
  textSecondary: '#8080a0',
  textTertiary: '#50506a',
  textMuted: '#38384e',

  // Accent
  accent: '#8b5cf6',
  accentHover: '#a78bfa',
  accentPink: '#ec4899',
  accentGreen: '#1ed760',
  accentRed: '#ef4444',

  // Borders
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  borderMedium: 'rgba(255, 255, 255, 0.07)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',

  // Transparent
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
} as const;

export const fontFamily = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  semibold: 'SpaceGrotesk_600SemiBold',
  bold: 'SpaceGrotesk_700Bold',
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '700' as const,
} as const;

export const layout = {
  navHeight: 64,
  miniPlayerHeight: 68,
  screenPadding: 20,
  artworkRadius: 12,
  artistCircleSize: 76,
  cardSize: 160,
  largeCardSize: 180,
} as const;
