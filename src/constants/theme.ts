import { ThemeMode } from '../store/themeStore';

// ── Dark palette (default) ──
const darkColors = {
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

  // Named semantic tokens
  miniPlayerBg: 'rgba(18, 18, 30, 0.96)',
  miniPlayerBorder: 'rgba(255,255,255,0.06)',
  tabBarBg: 'rgba(8, 8, 16, 0.97)',
  tabBarBorder: 'rgba(255,255,255,0.04)',
  skeletonBg: '#1a1a28',
  sheetBg: '#12121c',
  cardBg: 'rgba(255,255,255,0.02)',
  rowHover: 'rgba(255,255,255,0.03)',
  seekBar: 'rgba(255,255,255,0.1)',
  controlBg: 'rgba(255,255,255,0.06)',
  statusBar: 'light' as const,

  // Glass tokens
  glassBg: 'rgba(18, 18, 30, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHighlight: 'rgba(255, 255, 255, 0.04)',
  glassShadow: 'rgba(0, 0, 0, 0.5)',
  glassActive: 'rgba(139, 92, 246, 0.15)',
  glassActiveBorder: 'rgba(139, 92, 246, 0.25)',
};

// ── Light palette ──
const lightColors = {
  // Backgrounds
  bgBase: '#f5f5f7',
  bgPrimary: '#ffffff',
  bgSecondary: '#f0f0f4',
  bgSurface: '#e8e8ee',
  bgSurfaceHover: '#dcdce4',
  bgElevated: '#ffffff',
  bgGlass: 'rgba(255, 255, 255, 0.85)',
  bgGlassSolid: 'rgba(255, 255, 255, 0.95)',

  // Text
  textPrimary: '#1a1a2e',
  textSecondary: '#6b6b8d',
  textTertiary: '#9494b0',
  textMuted: '#b8b8cc',

  // Accent (same as dark — brand color stays consistent)
  accent: '#8b5cf6',
  accentHover: '#7c4fe0',
  accentPink: '#ec4899',
  accentGreen: '#16a34a',
  accentRed: '#dc2626',

  // Borders
  borderSubtle: 'rgba(0, 0, 0, 0.05)',
  borderMedium: 'rgba(0, 0, 0, 0.08)',
  borderStrong: 'rgba(0, 0, 0, 0.12)',

  // Transparent
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.3)',

  // Named semantic tokens
  miniPlayerBg: 'rgba(255, 255, 255, 0.95)',
  miniPlayerBorder: 'rgba(0,0,0,0.06)',
  tabBarBg: 'rgba(255, 255, 255, 0.97)',
  tabBarBorder: 'rgba(0,0,0,0.06)',
  skeletonBg: '#e8e8ee',
  sheetBg: '#f0f0f4',
  cardBg: 'rgba(0,0,0,0.02)',
  rowHover: 'rgba(0,0,0,0.03)',
  seekBar: 'rgba(0,0,0,0.1)',
  controlBg: 'rgba(0,0,0,0.06)',
  statusBar: 'dark' as const,

  // Glass tokens
  glassBg: 'rgba(255, 255, 255, 0.65)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
  glassHighlight: 'rgba(255, 255, 255, 0.5)',
  glassShadow: 'rgba(0, 0, 0, 0.12)',
  glassActive: 'rgba(139, 92, 246, 0.12)',
  glassActiveBorder: 'rgba(139, 92, 246, 0.2)',
};

export type AppColors = Omit<typeof darkColors, 'statusBar'> & {
  statusBar: 'light' | 'dark';
  glassBg: string;
  glassBorder: string;
  glassHighlight: string;
  glassShadow: string;
  glassActive: string;
  glassActiveBorder: string;
};

export function getColors(mode: ThemeMode): AppColors {
  return mode === 'dark' ? darkColors : lightColors;
}

// Default export for backward compatibility (dark mode)
export const colors = darkColors;

// ── Shared design tokens (unchanged by theme) ──

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
  navHeight: 76,
  miniPlayerHeight: 64,
  screenPadding: 20,
  artworkRadius: 12,
  artistCircleSize: 76,
  cardSize: 160,
  largeCardSize: 180,
} as const;
