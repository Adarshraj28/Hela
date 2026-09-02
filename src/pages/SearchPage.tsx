import { useState, useEffect } from 'react';
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

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const playTrack = usePlayerStore((s) => s.playTrack);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setTracks([]);
      setArtists([]);
      setAlbums([]);
      setHasSearched(false);
      return;
    }

    const search = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await musicApi.searchAll(debouncedQuery);
        setTracks(result.tracks);
        setArtists(result.artists);
        setAlbums(result.albums);
        setHasSearched(true);
      } catch (err) {
        setError('Search failed. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const noResults = hasSearched && !loading && tracks.length === 0 && artists.length === 0 && albums.length === 0;

  return (
    <div style={{ paddingBottom: 'var(--space-2xl)' }}>
      {/* Search input */}
      <div style={{ padding: 'var(--space-xl) 0' }}>
        <div style={{
          position: 'relative',
          maxWidth: 600,
        }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            autoFocus
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--bg-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div>
          <SectionHeader title="Searching..." />
          <SongRowSkeleton />
          <SongRowSkeleton />
          <SongRowSkeleton />
          <div style={{ marginTop: 'var(--space-xl)' }}>
            <GridSkeleton count={4} variant="artist" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <EmptyState
          icon="⚠️"
          title="Search Error"
          description={error}
          action={
            <button
              onClick={() => { setError(null); if (debouncedQuery) setQuery(query); }}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Try Again
            </button>
          }
        />
      )}

      {/* No results */}
      {noResults && (
        <EmptyState
          icon="🔍"
          title="No results found"
          description={`We couldn't find anything for "${debouncedQuery}". Try a different search.`}
        />
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Artists */}
          {artists.length > 0 && (
            <section style={{ marginBottom: 'var(--space-2xl)' }}>
              <SectionHeader title="Artists" icon="🎤" />
              <HorizontalScroll gap={20}>
                {artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </HorizontalScroll>
            </section>
          )}

          {/* Albums */}
          {albums.length > 0 && (
            <section style={{ marginBottom: 'var(--space-2xl)' }}>
              <SectionHeader title="Albums" icon="💿" />
              <HorizontalScroll gap={20}>
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </HorizontalScroll>
            </section>
          )}

          {/* Tracks */}
          {tracks.length > 0 && (
            <section style={{ marginBottom: 'var(--space-2xl)' }}>
              <SectionHeader title="Songs" icon="🎵" subtitle={`${tracks.length} results`} />
              <div>
                {tracks.map((track, i) => (
                  <SongRow
                    key={track.id}
                    track={track}
                    tracks={tracks}
                    index={i}
                    showIndex
                    showAlbum
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty query state */}
          {!hasSearched && !query && (
            <EmptyState
              icon="🔍"
              title="Search for music"
              description="Find your favorite songs, artists, and albums"
            />
          )}
        </>
      )}
    </div>
  );
}
