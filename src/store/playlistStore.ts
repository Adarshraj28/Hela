import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, Track } from '../types';

const STORAGE_KEY = 'hela-playlists';

interface PlaylistStore {
  playlists: Playlist[];
  loaded: boolean;

  loadPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  getPlaylist: (id: string) => Playlist | undefined;
}

function genId(): string {
  return `pl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function save(playlists: Playlist[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ playlists }));
  } catch {}
}

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  loaded: false,

  loadPlaylists: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({ playlists: data.playlists || [], loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch { set({ loaded: true }); }
  },

  createPlaylist: (name, description) => {
    const playlist: Playlist = {
      id: genId(), name, description,
      tracks: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    const updated = [...get().playlists, playlist];
    set({ playlists: updated });
    save(updated);
    return playlist;
  },

  deletePlaylist: (id) => {
    const updated = get().playlists.filter(p => p.id !== id);
    set({ playlists: updated });
    save(updated);
  },

  renamePlaylist: (id, name) => {
    const updated = get().playlists.map(p =>
      p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
    );
    set({ playlists: updated });
    save(updated);
  },

  addTrackToPlaylist: (playlistId, track) => {
    const updated = get().playlists.map(p => {
      if (p.id !== playlistId) return p;
      if (p.tracks.find(t => t.id === track.id)) return p;
      return { ...p, tracks: [...p.tracks, track], updatedAt: new Date().toISOString() };
    });
    set({ playlists: updated });
    save(updated);
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    const updated = get().playlists.map(p =>
      p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId), updatedAt: new Date().toISOString() } : p
    );
    set({ playlists: updated });
    save(updated);
  },

  getPlaylist: (id) => get().playlists.find(p => p.id === id),
}));
