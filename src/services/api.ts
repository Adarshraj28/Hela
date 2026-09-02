import type { Track, Artist, Album, SearchResult } from '../types';

// ========================================
// FREEBUFF — Music API Service
// Deezer API for metadata + preview playback
// Spotify embed for full-track playback
// ========================================

const BASE_URL = 'https://api.deezer.com';

// CORS proxy — try multiple fallbacks
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

async function fetchWithProxy(url: string): Promise<Response> {
  // Try direct first
  try {
    const res = await fetch(url);
    if (res.ok) return res;
  } catch { /* continue to proxy */ }

  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(url));
      if (res.ok) return res;
    } catch { /* continue */ }
  }

  throw new Error('All fetch attempts failed');
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetchWithProxy(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// ---------- Lyrics API (Spotify23 via RapidAPI) ----------

const LYRICS_API_BASE = 'https://spotify23.p.rapidapi.com';
const LYRICS_API_KEY = '46c9a2ca18msh67d65dbbe5433c7p1db88djsn92e0cfb46e12';

export interface LyricLine {
  startTimeMs: number;
  words: string;
  syllables: any[];
}

export interface LyricsResponse {
  lyrics?: {
    lines: LyricLine[];
    syncType: string;
  };
  error?: string;
}

export async function getTrackLyrics(spotifyTrackId: string): Promise<LyricLine[]> {
  try {
    const response = await fetch(
      `${LYRICS_API_BASE}/track_lyrics/?id=${spotifyTrackId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'spotify23.p.rapidapi.com',
          'x-rapidapi-key': LYRICS_API_KEY,
        },
      }
    );
    if (!response.ok) return [];
    const data: LyricsResponse = await response.json();
    return data.lyrics?.lines || [];
  } catch {
    return [];
  }
}

// ---------- Deezer Response Types ----------

interface DzTrack {
  id: number;
  title: string;
  title_short: string;
  duration: number;
  preview: string;
  artist: { id: number; name: string };
  album: { id: number; title: string; cover_big: string; cover_medium: string; cover_small: string };
  track_position?: number;
  disk_number?: number;
  release_date?: string;
  isrc?: string;
  rank?: number;
}

interface DzArtist {
  id: number;
  name: string;
  picture_big: string;
  picture_medium: string;
  nb_album?: number;
  nb_fan?: number;
  radio?: boolean;
}

interface DzAlbum {
  id: number;
  title: string;
  cover_big: string;
  cover_medium: string;
  cover_small: string;
  artist: { id: number; name: string };
  release_date?: string;
  nb_tracks?: number;
  type?: string;
}

interface DzSearchResult {
  data: DzTrack[];
  total: number;
}

interface DzArtistSearchResult {
  data: DzArtist[];
  total: number;
}

interface DzAlbumSearchResult {
  data: DzAlbum[];
  total: number;
}

interface DzChartResult {
  data: DzTrack[];
}

interface DzArtistTracks {
  data: DzTrack[];
}

interface DzArtistAlbums {
  data: DzAlbum[];
  total: number;
}

interface DzAlbumTracks {
  data: DzTrack[];
  total: number;
}

// ---------- Transformers ----------

function transformTrack(dz: DzTrack): Track {
  return {
    id: `dz-${dz.id}`,
    title: dz.title_short || dz.title,
    artist: dz.artist.name,
    artistId: `dz-${dz.artist.id}`,
    album: dz.album.title,
    albumId: `dz-${dz.album.id}`,
    artwork: dz.album.cover_big || dz.album.cover_medium,
    duration: dz.duration,
    previewUrl: dz.preview,
    trackNumber: dz.track_position,
    releaseDate: dz.release_date,
    isrc: dz.isrc,
  };
}

function transformArtist(dz: DzArtist): Artist {
  return {
    id: `dz-${dz.id}`,
    name: dz.name,
    artwork: dz.picture_big || dz.picture_medium,
    followers: dz.nb_fan,
  };
}

function transformAlbum(dz: DzAlbum): Album {
  return {
    id: `dz-${dz.id}`,
    title: dz.title,
    artist: dz.artist.name,
    artistId: `dz-${dz.artist.id}`,
    artwork: dz.cover_big || dz.cover_medium,
    releaseDate: dz.release_date,
    trackCount: dz.nb_tracks,
    type: (dz.type as Album['type']) || 'album',
  };
}

// ---------- API Functions ----------

export async function searchTracks(query: string): Promise<Track[]> {
  if (!query.trim()) return [];
  const result = await fetchAPI<DzSearchResult>(`/search?q=${encodeURIComponent(query)}&limit=25`);
  return result.data.map(transformTrack);
}

export async function searchArtists(query: string): Promise<Artist[]> {
  if (!query.trim()) return [];
  const result = await fetchAPI<DzArtistSearchResult>(`/search/artist?q=${encodeURIComponent(query)}&limit=20`);
  return result.data.map(transformArtist);
}

export async function searchAlbums(query: string): Promise<Album[]> {
  if (!query.trim()) return [];
  const result = await fetchAPI<DzAlbumSearchResult>(`/search/album?q=${encodeURIComponent(query)}&limit=20`);
  return result.data.map(transformAlbum);
}

export async function searchAll(query: string): Promise<SearchResult> {
  if (!query.trim()) return { tracks: [], artists: [], albums: [] };
  const [tracks, artists, albums] = await Promise.all([
    searchTracks(query),
    searchArtists(query),
    searchAlbums(query),
  ]);
  return { tracks, artists, albums };
}

export async function getChartTracks(): Promise<Track[]> {
  const result = await fetchAPI<DzChartResult>('/chart/0/tracks?limit=25');
  return result.data.map(transformTrack);
}

export async function getChartArtists(): Promise<Artist[]> {
  const result = await fetchAPI<{ data: DzArtist[] }>('/chart/0/artists?limit=20');
  return result.data.map(transformArtist);
}

export async function getChartAlbums(): Promise<Album[]> {
  const result = await fetchAPI<{ data: DzAlbum[] }>('/chart/0/albums?limit=20');
  return result.data.map(transformAlbum);
}

export async function getArtist(id: string): Promise<Artist> {
  const numericId = id.replace('dz-', '');
  const dz = await fetchAPI<DzArtist>(`/artist/${numericId}`);
  return transformArtist(dz);
}

export async function getArtistTopTracks(id: string): Promise<Track[]> {
  const numericId = id.replace('dz-', '');
  const result = await fetchAPI<DzArtistTracks>(`/artist/${numericId}/top?limit=10`);
  return result.data.map(transformTrack);
}

export async function getArtistAlbums(id: string): Promise<Album[]> {
  const numericId = id.replace('dz-', '');
  const result = await fetchAPI<DzArtistAlbums>(`/artist/${numericId}/albums?limit=20`);
  return result.data.map(transformAlbum);
}

export async function getAlbum(id: string): Promise<Album> {
  const numericId = id.replace('dz-', '');
  const dz = await fetchAPI<DzAlbum>(`/album/${numericId}`);
  return transformAlbum(dz);
}

export async function getAlbumTracks(id: string): Promise<Track[]> {
  const numericId = id.replace('dz-', '');
  const result = await fetchAPI<DzAlbumTracks>(`/album/${numericId}/tracks`);
  const album = await getAlbum(id);
  return result.data.map((t) => {
    const track = transformTrack(t);
    track.artwork = album.artwork;
    track.album = album.title;
    return track;
  });
}

export async function getEditorial(): Promise<Track[]> {
  const result = await fetchAPI<DzChartResult>('/editorial/0/releases?limit=25');
  return result.data.map(transformTrack);
}

// ---------- Spotify Embed Helpers ----------

export function getSpotifyEmbedUrl(trackId: string, isrc?: string): string | null {
  // Extract the numeric Deezer ID
  const dzId = trackId.replace('dz-', '');
  // We can use Deezer ID to construct an embed link
  // Note: This won't map 1:1, but provides a "Listen on Spotify" fallback
  return `https://open.spotify.com/embed/track/${dzId}?utm_source=generator&theme=0`;
}

// ---------- Exported Service Object ----------

export const musicApi = {
  searchTracks,
  searchArtists,
  searchAlbums,
  searchAll,
  getChartTracks,
  getChartArtists,
  getChartAlbums,
  getArtist,
  getArtistTopTracks,
  getArtistAlbums,
  getAlbum,
  getAlbumTracks,
  getEditorial,
  getTrackLyrics,
  getSpotifyEmbedUrl,
};

export default musicApi;
