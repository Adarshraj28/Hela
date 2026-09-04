import { useMemo } from 'react';
import { useThemeStore } from '../store/themeStore';
import { getColors, AppColors } from '../constants/theme';

export function useTheme(): AppColors {
  const mode = useThemeStore(s => s.mode);
  return useMemo(() => getColors(mode), [mode]);
}
