import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Track, Artist, Album } from '../types';
import { musicApi } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { usePlayerStore } from '../store/playerStore';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { HorizontalScroll } from '../components/HorizontalScroll';
import { SectionHeader } from '../components/SectionHeader';
import { GridSkeleton, SongRowSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';

const RECENT_KEY = 'hela-recent-searches';

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecentSearch(q: string) {
  const recent = getRecentSearches().filter((r) => r !== q);
  recent.unshift(q);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8))); } catch {}
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(getRecentSearches());

  const debounced = useDebounce(query, 350);
  const playTrack = usePlayerStore((s) => s.playTrack);

  // Search on debounce
  useEffect(() => {
    if (!debounced.trim()) { setTracks([]); setArtists([]); setAlbums([]); setSearched(false); return; }
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true); setError(null);
        const res = await musicApi.searchAll(debounced);
        if (cancelled) return;
        setTracks(res.tracks); setArtists(res.artists); setAlbums(res.albums);
        setSearched(true);
        saveRecentSearch(debounced);
        setRecentSearches(getRecentSearches());
      } catch { if (!cancelled) setError('Search failed. Try again.'); }
      finally { if (!cancelled) setLoading(false); }
    };
    run();
    return () => { cancelled = true; };
  }, [debounced]);

  // Load from URL param on mount
  useEffect(() => {
    if (initialQ) setQuery(initialQ);
  }, []); // eslint-disable-line

  const noResults = searched && !loading && tracks.length === 0 && artists.length === 0 && albums.length === 0;

  return (
    <div style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* Search bar */}
      <div style={{ padding: 'var(--space-xl) 0 var(--space-lg)' }}>
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setSearchParams(e.target.value ? { q: e.target.value } : {}); }}
            placeholder="What do you want to play?" autoFocus
            style={{
              width: '100%', padding: '12px 44px 12px 44px',
              background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-medium)', color: 'var(--text-primary)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              fontSize: '0.9375rem', outline: 'none',
              transition: 'border-color var(--t-fast), box-shadow var(--t-fast)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1), 0 0 20px rgba(139,92,246,0.08)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setSearchParams({}); }}
              aria-label="Clear"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Recent searches (when no query) */}
      {!query && recentSearches.length > 0 && (
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Recent searches</p>
            <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }}
              style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>Clear</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {recentSearches.map((q) => (
              <button key={q} onClick={() => { setQuery(q); setSearchParams({ q }); }}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)', fontSize: '0.8125rem',
                  transition: 'background var(--t-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
              >{q}</button>
            ))}
          </div>
        </section>
      )}

      {/* Loading */}
      {loading && (
        <div>
          <SongRowSkeleton /><SongRowSkeleton /><SongRowSkeleton />
          <div style={{ marginTop: 'var(--space-xl)' }}><GridSkeleton count={4} variant="artist" /></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState title="Search Error" description={error}
          action={<button onClick={() => { setError(null); if (debounced) setQuery(query); }}
            style={{ padding: '8px 20px', borderRadius: 'var(--radius-full)', background: 'var(--accent)', color: 'white', fontWeight: 600, fontSize: '0.8125rem' }}>Try Again</button>} />
      )}

      {/* No results */}
      {noResults && (
        <EmptyState title="No results found" description={`Nothing matched "${debounced}". Try something else.`} />
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {artists.length > 0 && (
            <section style={{ marginBottom: 'var(--space-2xl)' }}>
              <SectionHeader title="Artists" />
              <HorizontalScroll gap={20}>{artists.map((a) => <ArtistCard key={a.id} artist={a} />)}</HorizontalScroll>
            </section>
          )}
          {albums.length > 0 && (
            <section style={{ marginBottom: 'var(--space-2xl)' }}>
              <SectionHeader title="Albums" />
              <HorizontalScroll gap={20}>{albums.map((a) => <AlbumCard key={a.id} album={a} />)}</HorizontalScroll>
            </section>
          )}
          {tracks.length > 0 && (
            <section style={{ marginBottom: 'var(--space-2xl)' }}>
              <SectionHeader title="Songs" subtitle={`${tracks.length} results`} />
              <div>{tracks.map((t, i) => <SongRow key={t.id} track={t} tracks={tracks} index={i} showIndex showAlbum />)}</div>
            </section>
          )}
          {!searched && !query && (
            <EmptyState variant="search" title="Search for music" description="Find your favorite songs, artists, and albums" />
          )}
        </>
      )}
    </div>
  );
}
