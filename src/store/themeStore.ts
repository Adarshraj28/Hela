import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hela-theme';

export type ThemeMode = 'dark' | 'light';

interface ThemeStore {
  mode: ThemeMode;
  loaded: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'dark',
  loaded: false,

  loadTheme: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark') {
        set({ mode: raw, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  setMode: (mode) => {
    set({ mode });
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  },

  toggleTheme: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark';
    set({ mode: next });
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  },
}));
