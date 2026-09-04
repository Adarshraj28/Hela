import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'hela-auth';
const PROFILE_KEY = 'hela-profile';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  isGuest: boolean;
  createdAt: string;
}

interface AuthStore {
  user: UserProfile | null;
  loaded: boolean;
  loadUser: () => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loaded: false,

  loadUser: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) {
        set({ user: JSON.parse(raw), loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  signup: async (username, email, password) => {
    // Check if user already exists
    const usersRaw = await AsyncStorage.getItem('hela-users');
    const users: Record<string, { password: string; profile: UserProfile }> = usersRaw ? JSON.parse(usersRaw) : {};

    if (users[email]) return false; // Email already taken

    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      username,
      email,
      isGuest: false,
      createdAt: new Date().toISOString(),
    };

    users[email] = { password, profile };
    await AsyncStorage.setItem('hela-users', JSON.stringify(users));
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(profile));
    set({ user: profile });
    return true;
  },

  login: async (email, password) => {
    const usersRaw = await AsyncStorage.getItem('hela-users');
    const users: Record<string, { password: string; profile: UserProfile }> = usersRaw ? JSON.parse(usersRaw) : {};

    const entry = users[email];
    if (!entry || entry.password !== password) return false;

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(entry.profile));
    set({ user: entry.profile });
    return true;
  },

  loginAsGuest: async () => {
    const guest: UserProfile = {
      id: `guest-${Date.now()}`,
      username: 'Guest',
      email: '',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(guest));
    set({ user: guest });
  },

  logout: async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    set({ user: null });
  },

  updateProfile: (updates) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, ...updates };
    set({ user: updated });
    AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated)).catch(() => {});
  },

  isLoggedIn: () => get().user !== null,
}));
