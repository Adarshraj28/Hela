import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hela-search-history';

interface SearchStore {
  history: string[];
  loaded: boolean;
  loadHistory: () => Promise<void>;
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  history: [],
  loaded: false,

  loadHistory: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({ history: raw ? JSON.parse(raw) : [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  addSearch: (query) => {
    const q = query.trim();
    if (!q) return;
    const filtered = get().history.filter(h => h.toLowerCase() !== q.toLowerCase());
    const updated = [q, ...filtered].slice(0, 20);
    set({ history: updated });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  removeSearch: (query) => {
    const updated = get().history.filter(h => h !== query);
    set({ history: updated });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  },

  clearHistory: () => {
    set({ history: [] });
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  },
}));
