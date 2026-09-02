import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Track, Artist, Album } from '../types';
import { musicApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getGreeting } from '../utils/formatTime';
import { SectionHeader } from '../components/SectionHeader';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { SongRow } from '../components/SongRow';
import { HorizontalScroll } from '../components/HorizontalScroll';
import { GridSkeleton, SongRowSkeleton } from '../components/Skeleton';

export function HomePage() {
  const navigate = useNavigate();
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [trendingArtists, setTrendingArtists] = useState<Artist[]>([]);
  const [trendingAlbums, setTrendingAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recentlyPlayed } = useLibraryStore();
  const playTrack = usePlayerStore((s) => s.playTrack);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        const [tracks, artists, albums] = await Promise.all([
          musicApi.getChartTracks(),
          musicApi.getChartArtists(),
          musicApi.getChartAlbums(),
        ]);
        setTrendingTracks(tracks);
        setTrendingArtists(artists);
        setTrendingAlbums(albums);
      } catch (err) {
        setError('Failed to load music. Please check your connection and try again.');
        console.error('Home page error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  const handleQuickPlay = (track: Track) => {
    playTrack(track, trendingTracks, trendingTracks.indexOf(track));
  };

  return (
    <div style={{ paddingBottom: 'var(--space-2xl)' }}>
      {/* Hero */}
      <div style={{
        padding: 'var(--space-3xl) 0 var(--space-2xl)',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 'var(--space-sm)',
        }}>
          {getGreeting()}
        </h1>
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          fontWeight: 400,
        }}>
          What are you listening to?
        </p>
      </div>

      {error && (
        <div style={{
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          marginBottom: 'var(--space-xl)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.875rem' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 'var(--space-sm)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Quick Picks - recently played */}
      {recentlyPlayed.length > 0 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <SectionHeader title="Recently Played" icon="🕐" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--space-sm)',
          }}>
            {recentlyPlayed.slice(0, 6).map((entry) => (
              <button
                key={entry.track.id}
                onClick={() => playTrack(entry.track)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                  textAlign: 'left',
                }}
              >
                <img
                  src={entry.track.artwork}
                  alt=""
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {entry.track.title}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader
          title="Trending Now"
          subtitle="What's hot right now"
          icon="🔥"
        />
        {loading ? (
          <SongRowSkeleton />
        ) : (
          <div>
            {trendingTracks.slice(0, 10).map((track, i) => (
              <SongRow
                key={track.id}
                track={track}
                tracks={trendingTracks}
                index={i}
                showIndex
                showAlbum
              />
            ))}
          </div>
        )}
      </section>

      {/* Popular Artists */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader title="Popular Artists" icon="⭐" />
        {loading ? (
          <GridSkeleton count={8} variant="artist" />
        ) : (
          <HorizontalScroll gap={20}>
            {trendingArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </HorizontalScroll>
        )}
      </section>

      {/* New Releases / Albums */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader title="Albums You Might Like" icon="💿" />
        {loading ? (
          <GridSkeleton count={6} />
        ) : (
          <HorizontalScroll gap={20}>
            {trendingAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </HorizontalScroll>
        )}
      </section>

      {/* Made For You - top tracks as quick picks */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader
          title="Made For You"
          subtitle="Quick picks"
          icon="✨"
        />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-sm)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)', height: 64,
              }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--space-sm)',
          }}>
            {trendingTracks.slice(10, 16).map((track) => (
              <button
                key={track.id}
                onClick={() => handleQuickPlay(track)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                  textAlign: 'left',
                }}
              >
                <img
                  src={track.artwork}
                  alt=""
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-sm)',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {track.title}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {track.artist}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
