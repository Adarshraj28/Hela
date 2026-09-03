export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  artwork: string;
  duration?: number;
  previewUrl?: string;
  appleMusicEmbedUrl?: string;
  appleMusicTrackId?: number;
  appleMusicCollectionId?: number;
  genre?: string;
  releaseDate?: string;
  trackNumber?: number;
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  genres?: string[];
  followers?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  artwork: string;
  releaseDate?: string;
  trackCount?: number;
  genre?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  showFullPlayer: boolean;
}

export interface LibraryState {
  favorites: Track[];
  favoriteAlbums: Album[];
  favoriteArtists: Artist[];
  recentlyPlayed: { track: Track; playedAt: string }[];
}

export interface SearchResult {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
}
