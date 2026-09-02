// ========================================
// HELA — TypeScript Types
// ========================================

// Track / Song
export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  artwork: string;
  duration?: number; // seconds
  previewUrl?: string;
  appleMusicEmbedUrl?: string;
  appleMusicTrackId?: number;
  appleMusicCollectionId?: number;
  genre?: string;
  releaseDate?: string;
  trackNumber?: number;
  isrc?: string;
}

// Artist
export interface Artist {
  id: string;
  name: string;
  artwork: string;
  genres?: string[];
  followers?: number;
  bio?: string;
  topTracks?: Track[];
  albums?: Album[];
  relatedArtists?: Artist[];
}

// Album
export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  artwork: string;
  releaseDate?: string;
  trackCount?: number;
  tracks?: Track[];
  genre?: string;
  type?: 'album' | 'single' | 'ep' | 'compilation';
}

// Playlist
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  artwork?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

// Player State
export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  progress: number; // seconds
  duration: number; // seconds
  isLoading: boolean;
  error: string | null;
  showFullPlayer: boolean;

  // Actions
  playTrack: (track: Track, queue?: Track[], index?: number) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleFullPlayer: () => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
}

// Library State
export interface LibraryState {
  favorites: Track[];
  favoriteAlbums: Album[];
  favoriteArtists: Artist[];
  recentlyPlayed: RecentlyPlayedEntry[];

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

export interface RecentlyPlayedEntry {
  track: Track;
  playedAt: string;
}

// Playlist State
export interface PlaylistState {
  playlists: Playlist[];

  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => void;
  getPlaylist: (playlistId: string) => Playlist | undefined;
}

// Search
export interface SearchResult {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
}

// API Response Types (generic)
export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}
