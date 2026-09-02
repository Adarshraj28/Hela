import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlaylistState, Playlist, Track } from '../types';

function generateId(): string {
  return `pl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],

      createPlaylist: (name: string, description?: string): Playlist => {
        const playlist: Playlist = {
          id: generateId(),
          name,
          description,
          tracks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ playlists: [...state.playlists, playlist] }));
        return playlist;
      },

      deletePlaylist: (playlistId: string) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== playlistId),
        }));
      },

      renamePlaylist: (playlistId: string, name: string) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, name, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      addTrackToPlaylist: (playlistId: string, track: Track) => {
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            if (p.tracks.find((t) => t.id === track.id)) return p;
            return {
              ...p,
              tracks: [...p.tracks, track],
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  tracks: p.tracks.filter((t) => t.id !== trackId),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => {
        set((state) => ({
          playlists: state.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const tracks = [...p.tracks];
            const [moved] = tracks.splice(fromIndex, 1);
            tracks.splice(toIndex, 0, moved);
            return { ...p, tracks, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      getPlaylist: (playlistId: string) => {
        return get().playlists.find((p) => p.id === playlistId);
      },
    }),
    {
      name: 'hela-playlists',
    }
  )
);
