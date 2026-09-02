import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LibraryState, Track, Artist, Album, RecentlyPlayedEntry } from '../types';

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      favorites: [],
      favoriteAlbums: [],
      favoriteArtists: [],
      recentlyPlayed: [],

      addFavorite: (track: Track) => {
        const { favorites } = get();
        if (!favorites.find((t) => t.id === track.id)) {
          set({ favorites: [track, ...favorites] });
        }
      },

      removeFavorite: (trackId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((t) => t.id !== trackId),
        }));
      },

      isFavorite: (trackId: string) => {
        return get().favorites.some((t) => t.id === trackId);
      },

      addFavoriteAlbum: (album: Album) => {
        const { favoriteAlbums } = get();
        if (!favoriteAlbums.find((a) => a.id === album.id)) {
          set({ favoriteAlbums: [album, ...favoriteAlbums] });
        }
      },

      removeFavoriteAlbum: (albumId: string) => {
        set((state) => ({
          favoriteAlbums: state.favoriteAlbums.filter((a) => a.id !== albumId),
        }));
      },

      isFavoriteAlbum: (albumId: string) => {
        return get().favoriteAlbums.some((a) => a.id === albumId);
      },

      addFavoriteArtist: (artist: Artist) => {
        const { favoriteArtists } = get();
        if (!favoriteArtists.find((a) => a.id === artist.id)) {
          set({ favoriteArtists: [artist, ...favoriteArtists] });
        }
      },

      removeFavoriteArtist: (artistId: string) => {
        set((state) => ({
          favoriteArtists: state.favoriteArtists.filter((a) => a.id !== artistId),
        }));
      },

      isFavoriteArtist: (artistId: string) => {
        return get().favoriteArtists.some((a) => a.id === artistId);
      },

      addToRecentlyPlayed: (track: Track) => {
        const { recentlyPlayed } = get();
        // Remove existing entry of same track
        const filtered = recentlyPlayed.filter((e) => e.track.id !== track.id);
        const entry: RecentlyPlayedEntry = {
          track,
          playedAt: new Date().toISOString(),
        };
        // Add to front, keep max 50
        set({ recentlyPlayed: [entry, ...filtered].slice(0, 50) });
      },

      clearRecentlyPlayed: () => {
        set({ recentlyPlayed: [] });
      },
    }),
    {
      name: 'hela-library',
    }
  )
);
