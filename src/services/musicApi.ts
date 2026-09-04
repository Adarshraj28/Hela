import { Track, Artist, Album, SearchResult } from '../types';

const ITUNES_BASE = 'https://itunes.apple.com';

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

interface ItunesResponse {
  resultCount: number;
  results: ItunesTrack[];
}

function getArtwork(url: string, size = 300): string {
  if (!url) return '';
  return url.replace(/100x100bb/, `${size}x${size}bb`);
}

function getEmbedUrl(trackId: number, collectionId: number): string {
  return `https://embed.music.apple.com/us/album/${collectionId}?i=${trackId}`;
}

function transformTrack(t: ItunesTrack): Track {
  return {
    id: `itunes-${t.trackId}`,
    title: t.trackName,
    artist: t.artistName,
    artistId: `itunes-${t.artistId}`,
    album: t.collectionName,
    albumId: `itunes-${t.collectionId}`,
    artwork: getArtwork(t.artworkUrl100, 300),
    duration: t.trackTimeMillis ? Math.floor(t.trackTimeMillis / 1000) : 0,
    previewUrl: t.previewUrl,
    appleMusicEmbedUrl: getEmbedUrl(t.trackId, t.collectionId),
    appleMusicTrackId: t.trackId,
    appleMusicCollectionId: t.collectionId,
    trackNumber: t.trackNumber,
    releaseDate: t.releaseDate,
  };
}

function transformArtist(results: ItunesTrack[]): Artist | null {
  if (results.length === 0) return null;

  // Find artist wrapper first
  const artistWrapper = results.find(r => r.wrapperType === 'artist');
  // Find first track with artwork (artist wrappers don't have artworkUrl100)
  const trackWithArt = results.find(r => r.artworkUrl100 && r.wrapperType !== 'artist');
  // Also check album results for artwork
  const albumWithArt = results.find(r => r.artworkUrl100 && r.wrapperType === 'collection');

  const artwork = trackWithArt?.artworkUrl100 || albumWithArt?.artworkUrl100 || '';

  if (artistWrapper) {
    return {
      id: `itunes-${artistWrapper.artistId}`,
      name: artistWrapper.artistName,
      artwork: getArtwork(artwork, 300),
    };
  }

  // Fallback: use first result
  const t = results[0];
  return {
    id: `itunes-${t.artistId}`,
    name: t.artistName,
    artwork: getArtwork(t.artworkUrl100 || artwork, 300),
  };
}

function transformAlbum(tracks: ItunesTrack[]): Album | null {
  if (tracks.length === 0) return null;
  const t = tracks[0];
  return {
    id: `itunes-${t.collectionId}`,
    title: t.collectionName,
    artist: t.artistName,
    artistId: `itunes-${t.artistId}`,
    artwork: getArtwork(t.artworkUrl100, 300),
    releaseDate: t.releaseDate,
    trackCount: t.trackCount || tracks.length,
  };
}

async function fetchItunes<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${ITUNES_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function searchTracks(query: string): Promise<Track[]> {
  if (!query.trim()) return [];
  const data = await fetchItunes<ItunesResponse>(
    `/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`
  );
  return data.results.filter(t => t.kind === 'song').map(transformTrack);
}

export async function searchArtists(query: string): Promise<Artist[]> {
  if (!query.trim()) return [];
  const data = await fetchItunes<ItunesResponse>(
    `/search?term=${encodeURIComponent(query)}&media=music&entity=musicArtist&limit=20`
  );
  const map = new Map<number, ItunesTrack[]>();
  for (const t of data.results) {
    if (!t.artistId) continue;
    if (!map.has(t.artistId)) map.set(t.artistId, []);
    map.get(t.artistId)!.push(t);
  }
  const artists: Artist[] = [];
  for (const [, tracks] of map) {
    const a = transformArtist(tracks);
    if (a) artists.push(a);
  }
  return artists.slice(0, 20);
}

export async function searchAlbums(query: string): Promise<Album[]> {
  if (!query.trim()) return [];
  const data = await fetchItunes<ItunesResponse>(
    `/search?term=${encodeURIComponent(query)}&media=music&entity=album&limit=20`
  );
  const map = new Map<number, ItunesTrack[]>();
  for (const t of data.results) {
    if (!t.collectionId) continue;
    if (!map.has(t.collectionId)) map.set(t.collectionId, []);
    map.get(t.collectionId)!.push(t);
  }
  const albums: Album[] = [];
  for (const [, tracks] of map) {
    const a = transformAlbum(tracks);
    if (a) albums.push(a);
  }
  return albums.slice(0, 20);
}

export async function searchAll(query: string): Promise<SearchResult> {
  if (!query.trim()) return { tracks: [], artists: [], albums: [] };
  const data = await fetchItunes<ItunesResponse>(
    `/search?term=${encodeURIComponent(query)}&media=music&limit=50`
  );
  const tracks = data.results.filter(t => t.kind === 'song').map(transformTrack);

  const artistSeen = new Set<number>();
  const artists: Artist[] = [];
  for (const t of data.results) {
    if (t.artistId && !artistSeen.has(t.artistId)) {
      artistSeen.add(t.artistId);
      const a = transformArtist([t]);
      if (a) artists.push(a);
    }
  }

  const albumSeen = new Set<number>();
  const albums: Album[] = [];
  for (const t of data.results) {
    if (t.collectionId && !albumSeen.has(t.collectionId)) {
      albumSeen.add(t.collectionId);
      const a = transformAlbum([t]);
      if (a) albums.push(a);
    }
  }

  return { tracks: tracks.slice(0, 25), artists: artists.slice(0, 10), albums: albums.slice(0, 10) };
}

export async function getChartTracks(): Promise<Track[]> {
  const queries = ['top hits 2024', 'billboard hot 100', 'popular songs'];
  for (const q of queries) {
    try {
      const data = await fetchItunes<ItunesResponse>(
        `/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=25`
      );
      const tracks = data.results.filter(t => t.kind === 'song').map(transformTrack);
      if (tracks.length > 0) return tracks;
    } catch { continue; }
  }
  return [];
}

export async function getChartArtists(): Promise<Artist[]> {
  const queries = ['taylor swift', 'drake', 'bad bunny', 'the weeknd', 'billie eilish', 'ed sheeran', 'dua lipa', 'post malone', 'ariana grande', 'morgan wallen'];
  const seen = new Set<number>();
  const artists: Artist[] = [];

  for (const q of queries) {
    if (artists.length >= 10) break;
    try {
      const data = await fetchItunes<ItunesResponse>(
        `/search?term=${encodeURIComponent(q)}&media=music&entity=album&limit=3`
      );
      for (const t of data.results) {
        if (t.artistId && !seen.has(t.artistId) && artists.length < 10) {
          seen.add(t.artistId);
          artists.push({ id: `itunes-${t.artistId}`, name: t.artistName, artwork: getArtwork(t.artworkUrl100, 300) });
        }
      }
    } catch { continue; }
  }
  return artists;
}

export async function getChartAlbums(): Promise<Album[]> {
  const queries = ['trending albums 2024', 'new music albums', 'popular albums'];
  const seen = new Set<number>();
  const albums: Album[] = [];

  for (const q of queries) {
    if (albums.length >= 12) break;
    try {
      const data = await fetchItunes<ItunesResponse>(
        `/search?term=${encodeURIComponent(q)}&media=music&entity=album&limit=10`
      );
      for (const t of data.results) {
        if (t.collectionId && !seen.has(t.collectionId) && albums.length < 12) {
          seen.add(t.collectionId);
          const a = transformAlbum([t]);
          if (a) albums.push(a);
        }
      }
    } catch { continue; }
  }
  return albums;
}

export async function getArtist(id: string): Promise<Artist> {
  const numId = id.replace('itunes-', '');
  // Fetch artist + songs to get artwork from song results
  const data = await fetchItunes<ItunesResponse>(`/lookup?id=${numId}&entity=song&limit=5`);
  if (data.results.length === 0) throw new Error('Artist not found');
  const a = transformArtist(data.results);
  if (!a) throw new Error('Artist not found');
  return a;
}

export async function getArtistTopTracks(id: string): Promise<Track[]> {
  const numId = id.replace('itunes-', '');
  // Use search instead of lookup for better track results
  try {
    const artistData = await fetchItunes<ItunesResponse>(`/lookup?id=${numId}&entity=song&limit=1`);
    const artistName = artistData.results.find(r => r.wrapperType === 'artist')?.artistName;
    if (artistName) {
      const searchData = await fetchItunes<ItunesResponse>(
        `/search?term=${encodeURIComponent(artistName)}&media=music&entity=song&limit=15`
      );
      return searchData.results
        .filter(t => t.kind === 'song' && t.artistId === parseInt(numId))
        .slice(0, 10)
        .map(transformTrack);
    }
  } catch {}
  // Fallback
  const data = await fetchItunes<ItunesResponse>(`/lookup?id=${numId}&entity=song&limit=15`);
  return data.results.filter(t => t.kind === 'song').slice(0, 10).map(transformTrack);
}

export async function getArtistAlbums(id: string): Promise<Album[]> {
  const numId = id.replace('itunes-', '');
  const data = await fetchItunes<ItunesResponse>(`/lookup?id=${numId}&entity=album&limit=20`);
  const seen = new Set<number>();
  const albums: Album[] = [];
  for (const t of data.results) {
    if (t.collectionId && !seen.has(t.collectionId)) {
      seen.add(t.collectionId);
      const a = transformAlbum([t]);
      if (a) albums.push(a);
    }
  }
  return albums;
}

export async function getAlbum(id: string): Promise<Album> {
  const numId = id.replace('itunes-', '');
  const data = await fetchItunes<ItunesResponse>(`/lookup?id=${numId}&entity=song`);
  if (data.results.length === 0) throw new Error('Album not found');
  const a = transformAlbum(data.results);
  if (!a) throw new Error('Album not found');
  return a;
}

export async function getAlbumTracks(id: string): Promise<Track[]> {
  const numId = id.replace('itunes-', '');
  const data = await fetchItunes<ItunesResponse>(`/lookup?id=${numId}&entity=song`);
  return data.results
    .filter(t => t.kind === 'song')
    .sort((a, b) => a.trackNumber - b.trackNumber)
    .map(transformTrack);
}

// ── YouTube Search for Full Songs ──
// Uses Invidious (free, open-source YouTube frontend) to find video IDs

const INVIDIOUS_INSTANCES = [
  'https://vid.puffyan.us',
  'https://invidious.fdn.fr',
  'https://y.com.sb',
  'https://invidious.nerdvpn.de',
];

export async function searchYouTubeId(query: string): Promise<string | null> {
  const searchQuery = `${query} official`;
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video&sort_by=relevance&page=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0].videoId;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// ── Lyrics API (Spotify23 via RapidAPI) ──
const LYRICS_BASE = 'https://spotify23.p.rapidapi.com';
const LYRICS_KEY = '46c9a2ca18msh67d65dbbe5433c7p1db88djsn92e0cfb46e12';

export interface LyricLine {
  startTimeMs: number;
  words: string;
}

export async function getTrackLyrics(trackId: string): Promise<LyricLine[]> {
  try {
    const res = await fetch(`${LYRICS_BASE}/track_lyrics/?id=${trackId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'spotify23.p.rapidapi.com',
        'x-rapidapi-key': LYRICS_KEY,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.lyrics?.lines) return data.lyrics.lines;
    if (Array.isArray(data.lyrics)) return data.lyrics;
    if (data.lines) return data.lines;
    return [];
  } catch {
    return [];
  }
}
