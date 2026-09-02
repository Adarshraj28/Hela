import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Track, Artist, Album } from '../types';
import { musicApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getGreeting } from '../utils/formatTime';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { SongRow } from '../components/SongRow';
import { HorizontalScroll } from '../components/HorizontalScroll';
import { GridSkeleton, SongRowSkeleton } from '../components/Skeleton';

export function HomePage() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recentlyPlayed, favorites } = useLibraryStore();
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [t, a, al] = await Promise.all([
          musicApi.getChartTracks(),
          musicApi.getChartArtists(),
          musicApi.getChartAlbums(),
        ]);
        setTrending(t);
        setArtists(a);
        setAlbums(al);
      } catch {
        setError('Could not load music. Check your connection.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickPlay = (track: Track) => playTrack(track, trending, trending.indexOf(track));

  return (
    <div style={{ paddingBottom: 'var(--space-3xl)' }}>
      {/* ---- Hero Greeting ---- */}
      <div style={{ padding: 'var(--space-xl) 0 var(--space-2xl)', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -100, left: '20%', width: 500, height: 400,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.035em', lineHeight: 1.1,
        }}>{getGreeting()}</h1>
        <p style={{
          fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
          color: 'var(--text-secondary)', marginTop: 'var(--space-sm)',
        }}>What do you want to listen to?</p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-md)',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)',
          marginBottom: 'var(--space-xl)', textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>{error}</p>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 'var(--space-sm)', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.8125rem', fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {/* ---- Artist Recommendation ---- */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{
          fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', marginBottom: 'var(--space-lg)',
        }}>Artist Recommendation</h2>
        {loading ? (
          <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="skeleton" style={{ width: 100, height: 100, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 60, height: 12, marginTop: 'var(--space-sm)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : (
          <HorizontalScroll gap={24}>
            {artists.map((artist) => (
              <button key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)}
                style={{ textAlign: 'center', flexShrink: 0, width: 100 }}>
                <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  overflow: 'hidden', marginBottom: 'var(--space-sm)',
                  border: '3px solid rgba(255,255,255,0.06)',
                  transition: 'border-color 0.3s, transform 0.3s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <img src={artist.artwork} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <p style={{
                  fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{artist.name}</p>
              </button>
            ))}
          </HorizontalScroll>
        )}
      </section>

      {/* ---- Recently Played (large cards) ---- */}
      {recentlyPlayed.length > 0 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Recently Played
            </h2>
            <button onClick={() => navigate('/library')} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              See More
            </button>
          </div>
          <HorizontalScroll gap={16}>
            {recentlyPlayed.slice(0, 8).map((entry) => (
              <button key={entry.track.id} onClick={() => playTrack(entry.track)}
                style={{ flexShrink: 0, width: 180, textAlign: 'left' }}>
                <div style={{
                  width: 180, height: 180, borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden', marginBottom: 'var(--space-sm)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s var(--ease-out)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <img src={entry.track.artwork} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <p style={{
                  fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{entry.track.title}</p>
                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2,
                }}>{entry.track.artist}</p>
              </button>
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* ---- Favorites (quick grid) ---- */}
      {favorites.length > 0 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Your Favorites
            </h2>
            <button onClick={() => navigate('/library')} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              See More
            </button>
          </div>
          <HorizontalScroll gap={16}>
            {favorites.slice(0, 8).map((track) => (
              <button key={track.id} onClick={() => playTrack(track, favorites, favorites.indexOf(track))}
                style={{ flexShrink: 0, width: 180, textAlign: 'left' }}>
                <div style={{
                  width: 180, height: 180, borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden', marginBottom: 'var(--space-sm)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s var(--ease-out)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <img src={track.artwork} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <p style={{
                  fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{track.title}</p>
                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-secondary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2,
                }}>{track.artist}</p>
              </button>
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* ---- Trending Now (song list) ---- */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{
          fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', marginBottom: 'var(--space-lg)',
        }}>Trending Now</h2>
        {loading ? (
          <>{Array.from({ length: 5 }).map((_, i) => <SongRowSkeleton key={i} />)}</>
        ) : (
          <div>{trending.slice(0, 10).map((t, i) => (
            <SongRow key={t.id} track={t} tracks={trending} index={i} showIndex showAlbum />
          ))}</div>
        )}
      </section>

      {/* ---- New Releases (album carousel) ---- */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{
          fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', marginBottom: 'var(--space-lg)',
        }}>New Releases</h2>
        {loading ? (
          <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ width: 200, height: 200, borderRadius: 'var(--radius-md)' }} />)}
          </div>
        ) : (
          <HorizontalScroll gap={20}>{albums.map((a) => <AlbumCard key={a.id} album={a} />)}</HorizontalScroll>
        )}
      </section>

      {/* ---- Made For You (quick picks) ---- */}
      {!loading && trending.length > 10 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 style={{
            fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', marginBottom: 'var(--space-lg)',
          }}>Made For You</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-sm)' }}>
            {trending.slice(10, 16).map((t) => (
              <button key={t.id} onClick={() => quickPlay(t)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
                transition: 'background var(--t-fast)', textAlign: 'left',
                border: '1px solid transparent',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.04)'; ev.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'; ev.currentTarget.style.borderColor = 'transparent'; }}
              >
                <img src={t.artwork} alt="" style={{ width: 52, height: 52, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{t.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
