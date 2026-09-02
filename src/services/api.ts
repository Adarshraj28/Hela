import type { Track, Artist, Album, SearchResult } from '../types';

// ========================================
// HELA — Music API Service
// Metadata: iTunes Search API (global, CORS-friendly)
// Full playback: Apple Music embed (plays full songs)
// Lyrics: Spotify23 via RapidAPI
// ========================================

const ITUNES_BASE = 'https://itunes.apple.com';

// ---- iTunes Response Types ----

interface ItunesTrack {
  wrapperType: string;
  kind: string;
  artistId: number;
  collectionId: number;
  trackId: number;
  artistName: string;
  collectionName: string;
  trackName: string;
  previewUrl: string;
  artworkUrl100: string;
  releaseDate: string;
  trackTimeMillis: number;
  trackNumber: number;
  trackCount?: number;
  primaryGenreName: string;
}

interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
}

// ---- Transformers ----

function getArtwork(url: string, size: number = 300): string {
  return url.replace(/100x100bb/, `${size}x${size}bb`);
}

/**
 * Build an Apple Music embed URL from iTunes track data.
 * iTunes and Apple Music share the same ID system, so we can construct
 * the embed URL directly — this plays FULL songs.
 */
function getAppleMusicEmbedUrl(trackId: number, collectionId: number): string {
  return `https://embed.music.apple.com/us/album/${collectionId}?i=${trackId}`;
}

function transformTrack(it: ItunesTrack): Track {
  return {
    id: `itunes-${it.trackId}`,
    title: it.trackName,
    artist: it.artistName,
    artistId: `itunes-${it.artistId}`,
    album: it.collectionName,
    albumId: `itunes-${it.collectionId}`,
    artwork: getArtwork(it.artworkUrl100, 300),
    duration: it.trackTimeMillis ? Math.floor(it.trackTimeMillis / 1000) : 0,
    previewUrl: it.previewUrl,
    appleMusicEmbedUrl: getAppleMusicEmbedUrl(it.trackId, it.collectionId),
    appleMusicTrackId: it.trackId,
    appleMusicCollectionId: it.collectionId,
    trackNumber: it.trackNumber,
    releaseDate: it.releaseDate,
  };
}

function transformArtistFromTracks(tracks: ItunesTrack[]): Artist | null {
  if (tracks.length === 0) return null;
  const first = tracks[0];
  return {
    id: `itunes-${first.artistId}`,
    name: first.artistName,
    artwork: getArtwork(first.artworkUrl100, 300),
  };
}

function transformAlbumFromTracks(tracks: ItunesTrack[]): Album | null {
  if (tracks.length === 0) return null;
  const first = tracks[0];
  return {
    id: `itunes-${first.collectionId}`,
    title: first.collectionName,
    artist: first.artistName,
    artistId: `itunes-${first.artistId}`,
    artwork: getArtwork(first.artworkUrl100, 300),
    releaseDate: first.releaseDate,
    trackCount: first.trackCount || tracks.length,
    type: 'album',
  };
}

// ---- API Functions ----

async function fetchItunes<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${ITUNES_BASE}${endpoint}`);
  if (!response.ok) throw new Error(`iTunes API error: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function searchTracks(query: string): Promise<Track[]> {
  if (!query.trim()) return [];
  const data = await fetchItunes<ItunesSearchResponse>(
    `/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`
  );
  return data.results
    .filter((t) => t.kind === 'song')
    .map(transformTrack);
}

export async function searchArtists(query: string): Promise<Artist[]> {
  if (!query.trim()) return [];
  const data = await fetchItunes<ItunesSearchResponse>(
    `/search?term=${encodeURIComponent(query)}&media=music&entity=musicArtist&limit=20`
  );
  const artistMap = new Map<number, ItunesTrack[]>();
  for (const t of data.results) {
    if (!t.artistId) continue;
    if (!artistMap.has(t.artistId)) artistMap.set(t.artistId, []);
    artistMap.get(t.artistId)!.push(t);
  }
  const artists: Artist[] = [];
  for (const [, tracks] of artistMap) {
    const artist = transformArtistFromTracks(tracks);
    if (artist) artists.push(artist);
  }
  return artists.slice(0, 20);
}

export async function searchAlbums(query: string): Promise<Album[]> {
  if (!query.trim()) return [];
  const data = await fetchItunes<ItunesSearchResponse>(
    `/search?term=${encodeURIComponent(query)}&media=music&entity=album&limit=20`
  );
  const albumMap = new Map<number, ItunesTrack[]>();
  for (const t of data.results) {
    if (!t.collectionId) continue;
    if (!albumMap.has(t.collectionId)) albumMap.set(t.collectionId, []);
    albumMap.get(t.collectionId)!.push(t);
  }
  const albums: Album[] = [];
  for (const [, tracks] of albumMap) {
    const album = transformAlbumFromTracks(tracks);
    if (album) albums.push(album);
  }
  return albums.slice(0, 20);
}

export async function searchAll(query: string): Promise<SearchResult> {
  if (!query.trim()) return { tracks: [], artists: [], albums: [] };
  const data = await fetchItunes<ItunesSearchResponse>(
    `/search?term=${encodeURIComponent(query)}&media=music&limit=50`
  );
  const allTracks = data.results
    .filter((t) => t.kind === 'song')
    .map(transformTrack);

  const artistSeen = new Set<number>();
  const artists: Artist[] = [];
  for (const t of data.results) {
    if (t.artistId && !artistSeen.has(t.artistId)) {
      artistSeen.add(t.artistId);
      const artist = transformArtistFromTracks([t]);
      if (artist) artists.push(artist);
    }
  }

  const albumSeen = new Set<number>();
  const albums: Album[] = [];
  for (const t of data.results) {
    if (t.collectionId && !albumSeen.has(t.collectionId)) {
      albumSeen.add(t.collectionId);
      const album = transformAlbumFromTracks([t]);
      if (album) albums.push(album);
    }
  }

  return { tracks: allTracks.slice(0, 25), artists: artists.slice(0, 10), albums: albums.slice(0, 10) };
}

// ---- Home page data ----

const TRENDING_QUERIES = ['top hits 2024', 'billboard hot 100', 'popular songs', 'chart toppers'];

export async function getChartTracks(): Promise<Track[]> {
  for (const query of TRENDING_QUERIES) {
    try {
      const data = await fetchItunes<ItunesSearchResponse>(
        `/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`
      );
      const tracks = data.results
        .filter((t) => t.kind === 'song')
        .map(transformTrack);
      if (tracks.length > 0) return tracks;
    } catch { continue; }
  }
  return [];
}

export async function getChartArtists(): Promise<Artist[]> {
  const queries = ['taylor swift', 'drake', 'bad bunny', 'the weeknd', 'billie eilish', 'ed sheeran', 'dua lipa', 'post malone'];
  const artistSeen = new Set<number>();
  const artists: Artist[] = [];

  for (const q of queries) {
    if (artists.length >= 12) break;
    try {
      const data = await fetchItunes<ItunesSearchResponse>(
        `/search?term=${encodeURIComponent(q)}&media=music&entity=musicArtist&limit=5`
      );
      for (const t of data.results) {
        if (t.artistId && !artistSeen.has(t.artistId) && artists.length < 12) {
          artistSeen.add(t.artistId);
          const artist = transformArtistFromTracks([t]);
          if (artist) artists.push(artist);
        }
      }
    } catch { continue; }
  }
  return artists;
}

export async function getChartAlbums(): Promise<Album[]> {
  const queries = ['trending albums 2024', 'new music albums', 'popular albums'];
  const albumSeen = new Set<number>();
  const albums: Album[] = [];

  for (const q of queries) {
    if (albums.length >= 12) break;
    try {
      const data = await fetchItunes<ItunesSearchResponse>(
        `/search?term=${encodeURIComponent(q)}&media=music&entity=album&limit=10`
      );
      for (const t of data.results) {
        if (t.collectionId && !albumSeen.has(t.collectionId) && albums.length < 12) {
          albumSeen.add(t.collectionId);
          const album = transformAlbumFromTracks([t]);
          if (album) albums.push(album);
        }
      }
    } catch { continue; }
  }
  return albums;
}

export async function getArtist(id: string): Promise<Artist> {
  const numericId = id.replace('itunes-', '');
  const data = await fetchItunes<ItunesSearchResponse>(
    `/lookup?id=${numericId}&entity=song&limit=1`
  );
  if (data.results.length === 0) throw new Error('Artist not found');
  const artist = transformArtistFromTracks(data.results);
  if (!artist) throw new Error('Artist not found');
  return artist;
}

export async function getArtistTopTracks(id: string): Promise<Track[]> {
  const numericId = id.replace('itunes-', '');
  const data = await fetchItunes<ItunesSearchResponse>(
    `/lookup?id=${numericId}&entity=song&limit=10`
  );
  return data.results
    .filter((t) => t.kind === 'song')
    .map(transformTrack);
}

export async function getArtistAlbums(id: string): Promise<Album[]> {
  const numericId = id.replace('itunes-', '');
  const data = await fetchItunes<ItunesSearchResponse>(
    `/lookup?id=${numericId}&entity=album&limit=20`
  );
  const albumSeen = new Set<number>();
  const albums: Album[] = [];
  for (const t of data.results) {
    if (t.collectionId && !albumSeen.has(t.collectionId)) {
      albumSeen.add(t.collectionId);
      const album = transformAlbumFromTracks([t]);
      if (album) albums.push(album);
    }
  }
  return albums;
}

export async function getAlbum(id: string): Promise<Album> {
  const numericId = id.replace('itunes-', '');
  const data = await fetchItunes<ItunesSearchResponse>(
    `/lookup?id=${numericId}&entity=song`
  );
  if (data.results.length === 0) throw new Error('Album not found');
  const album = transformAlbumFromTracks(data.results);
  if (!album) throw new Error('Album not found');
  return album;
}

export async function getAlbumTracks(id: string): Promise<Track[]> {
  const numericId = id.replace('itunes-', '');
  const data = await fetchItunes<ItunesSearchResponse>(
    `/lookup?id=${numericId}&entity=song`
  );
  return data.results
    .filter((t) => t.kind === 'song')
    .sort((a, b) => a.trackNumber - b.trackNumber)
    .map(transformTrack);
}

export async function getEditorial(): Promise<Track[]> {
  return getChartTracks();
}

// ---- Lyrics API (Spotify23 via RapidAPI) ----

const LYRICS_API_BASE = 'https://spotify23.p.rapidapi.com';
const LYRICS_API_KEY = '46c9a2ca18msh67d65dbbe5433c7p1db88djsn92e0cfb46e12';

export interface LyricLine {
  startTimeMs: number;
  words: string;
  syllables: any[];
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
    const data = await response.json();
    if (data.lyrics?.lines) return data.lyrics.lines;
    if (Array.isArray(data.lyrics)) return data.lyrics;
    if (data.lines) return data.lines;
    return [];
  } catch {
    return [];
  }
}

// ---- Exported Service ----

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
};

export default musicApi;
