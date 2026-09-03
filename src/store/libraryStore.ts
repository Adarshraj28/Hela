import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Artist, Album } from '../types';

const STORAGE_KEY = 'hela-library';

interface LibraryStore {
  favorites: Track[];
  favoriteAlbums: Album[];
  favoriteArtists: Artist[];
  recentlyPlayed: { track: Track; playedAt: string }[];
  loaded: boolean;

  loadLibrary: () => Promise<void>;
  addFavorite: (track: Track) => void;
  removeFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  addFavoriteAlbum: (album: Album) => void;
  removeFavoriteAlbum: (albumId: string) => void;
  isFavoriteAlbum: (albumId: string) => boolean;
  addFavoriteArtist: (artist: Artist) => void;
  removeFavoriteArtist: (artistId: string) => void;
  isFavoriteArtist: (artistId: string) => boolean;
  addToRecentlyPlayed: (track: Track) => void;
  clearRecentlyPlayed: () => void;
}

async function saveLibrary(state: Partial<LibraryStore>) {
  try {
    const data = {
      favorites: state.favorites,
      favoriteAlbums: state.favoriteAlbums,
      favoriteArtists: state.favoriteArtists,
      recentlyPlayed: state.recentlyPlayed,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  favorites: [],
  favoriteAlbums: [],
  favoriteArtists: [],
  recentlyPlayed: [],
  loaded: false,

  loadLibrary: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          favorites: data.favorites || [],
          favoriteAlbums: data.favoriteAlbums || [],
          favoriteArtists: data.favoriteArtists || [],
          recentlyPlayed: data.recentlyPlayed || [],
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  addFavorite: (track) => {
    const { favorites } = get();
    if (favorites.find(t => t.id === track.id)) return;
    const updated = [track, ...favorites];
    set({ favorites: updated });
    saveLibrary({ favorites: updated });
  },

  removeFavorite: (trackId) => {
    const updated = get().favorites.filter(t => t.id !== trackId);
    set({ favorites: updated });
    saveLibrary({ favorites: updated });
  },

  isFavorite: (trackId) => get().favorites.some(t => t.id === trackId),

  addFavoriteAlbum: (album) => {
    const { favoriteAlbums } = get();
    if (favoriteAlbums.find(a => a.id === album.id)) return;
    const updated = [album, ...favoriteAlbums];
    set({ favoriteAlbums: updated });
    saveLibrary({ favoriteAlbums: updated });
  },

  removeFavoriteAlbum: (albumId) => {
    const updated = get().favoriteAlbums.filter(a => a.id !== albumId);
    set({ favoriteAlbums: updated });
    saveLibrary({ favoriteAlbums: updated });
  },

  isFavoriteAlbum: (albumId) => get().favoriteAlbums.some(a => a.id === albumId),

  addFavoriteArtist: (artist) => {
    const { favoriteArtists } = get();
    if (favoriteArtists.find(a => a.id === artist.id)) return;
    const updated = [artist, ...favoriteArtists];
    set({ favoriteArtists: updated });
    saveLibrary({ favoriteArtists: updated });
  },

  removeFavoriteArtist: (artistId) => {
    const updated = get().favoriteArtists.filter(a => a.id !== artistId);
    set({ favoriteArtists: updated });
    saveLibrary({ favoriteArtists: updated });
  },

  isFavoriteArtist: (artistId) => get().favoriteArtists.some(a => a.id === artistId),

  addToRecentlyPlayed: (track) => {
    const { recentlyPlayed } = get();
    const filtered = recentlyPlayed.filter(e => e.track.id !== track.id);
    const entry = { track, playedAt: new Date().toISOString() };
    const updated = [entry, ...filtered].slice(0, 50);
    set({ recentlyPlayed: updated });
    saveLibrary({ recentlyPlayed: updated });
  },

  clearRecentlyPlayed: () => {
    set({ recentlyPlayed: [] });
    saveLibrary({ recentlyPlayed: [] });
  },
}));
