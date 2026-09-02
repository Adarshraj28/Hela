import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Track, Artist, Album } from '../types';
import { musicApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getGreeting } from '../utils/formatTime';
import { AlbumCard } from '../components/AlbumCard';
import { SongRow } from '../components/SongRow';
import { HorizontalScroll } from '../components/HorizontalScroll';
import { SongRowSkeleton } from '../components/Skeleton';

export function HomePage() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'music' | 'podcast' | 'video' | 'radio'>('music');
  const { recentlyPlayed, favorites } = useLibraryStore();
  const { playTrack } = usePlayerStore();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Run artist + track in parallel, album separately
        const [t, a] = await Promise.all([
          musicApi.getChartTracks(),
          musicApi.getChartArtists(),
        ]);
        setTrending(t);
        setArtists(a);
        // Albums after (not critical)
        musicApi.getChartAlbums().then(setAlbums).catch(() => {});
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
      <div style={{
        padding: 'var(--space-xl) var(--space-lg) var(--space-md)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: -80, left: '20%', width: 400, height: 350,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: 'var(--space-sm)',
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 6vw, 2.75rem)', fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: '-0.035em', lineHeight: 1.1,
            }}>{getGreeting()}</h1>
            <p style={{
              fontSize: 'clamp(0.8125rem, 2.5vw, 1rem)',
              color: 'var(--text-secondary)', marginTop: 'var(--space-xs)',
              fontWeight: 400,
            }}>Wanna feel spirit today ?</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            {/* Notification bell */}
            <button
              className="hover-lift"
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', position: 'relative',
                transition: 'all var(--t-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div style={{
                position: 'absolute', top: 10, right: 11,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent-pink)',
                border: '2px solid var(--bg-base)',
              }} />
            </button>
            {/* Profile avatar */}
            <button
              onClick={() => navigate('/settings')}
              className="hover-lift"
              style={{
                width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                border: '2px solid rgba(139,92,246,0.3)',
                transition: 'all var(--t-fast)',
                boxShadow: '0 0 12px rgba(139,92,246,0.15)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(139,92,246,0.15)'; }}
            >
              <div style={{
                width: '100%', height: '100%',
                background: 'var(--gradient-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.125rem', fontWeight: 700, color: '#fff',
              }}>F</div>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-md)',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)',
          margin: '0 var(--space-lg) var(--space-xl)', textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>{error}</p>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 'var(--space-sm)', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.8125rem', fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {/* ---- Artist Recommendation ---- */}
      <section style={{ marginBottom: 'var(--space-xl)', padding: '0 var(--space-lg)' }}>
        <h2 style={{
          fontSize: 'clamp(1.0625rem, 3vw, 1.25rem)', fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.02em',
          marginBottom: 'var(--space-md)',
        }}>Artist Recommendation</h2>
        {loading ? (
          <div style={{ display: 'flex', gap: 'var(--space-lg)', overflow: 'hidden' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ textAlign: 'center', flexShrink: 0 }}>
                <div className="skeleton" style={{ width: 88, height: 88, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 56, height: 10, marginTop: 'var(--space-sm)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : artists.length > 0 ? (
          <HorizontalScroll gap={20}>
            {artists.map((artist) => (
              <button key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)}
                className="hover-lift"
                style={{ textAlign: 'center', flexShrink: 0, width: 88, cursor: 'pointer' }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
                  marginBottom: 'var(--space-sm)',
                  border: '3px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.3s var(--ease-out)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(139,92,246,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'; }}
                >
                  <img src={artist.artwork} alt={artist.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231a1a28" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%238b5cf6" font-size="36">♪</text></svg>'; }}
                  />
                </div>
                <p style={{
                  fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: 88,
                }}>{artist.name}</p>
              </button>
            ))}
          </HorizontalScroll>
        ) : null}
      </section>

      {/* ---- Recently Played (large cards) ---- */}
      {recentlyPlayed.length > 0 && (
        <section style={{ marginBottom: 'var(--space-xl)', padding: '0 var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 'clamp(1.0625rem, 3vw, 1.25rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Recently Played
            </h2>
            <button onClick={() => navigate('/library')} className="hover-lift"
              style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '4px 8px', borderRadius: 'var(--radius-sm)', transition: 'all var(--t-fast)' }}>
              See More
            </button>
          </div>
          <HorizontalScroll gap={14}>
            {recentlyPlayed.slice(0, 8).map((entry) => (
              <button key={entry.track.id} onClick={() => playTrack(entry.track)}
                className="hover-lift"
                style={{ flexShrink: 0, width: 170, textAlign: 'left', cursor: 'pointer' }}>
                <div style={{
                  width: 170, height: 170, borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden', marginBottom: 'var(--space-sm)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  transition: 'all 0.3s var(--ease-out)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'; }}
                >
                  <img src={entry.track.artwork} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* ---- Favorites ---- */}
      {favorites.length > 0 && (
        <section style={{ marginBottom: 'var(--space-xl)', padding: '0 var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 'clamp(1.0625rem, 3vw, 1.25rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Your Favorites
            </h2>
            <button onClick={() => navigate('/library')} className="hover-lift"
              style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '4px 8px', borderRadius: 'var(--radius-sm)', transition: 'all var(--t-fast)' }}>
              See More
            </button>
          </div>
          <HorizontalScroll gap={14}>
            {favorites.slice(0, 8).map((track) => (
              <button key={track.id} onClick={() => playTrack(track, favorites, favorites.indexOf(track))}
                className="hover-lift"
                style={{ flexShrink: 0, width: 170, textAlign: 'left', cursor: 'pointer' }}>
                <div style={{
                  width: 170, height: 170, borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden', marginBottom: 'var(--space-sm)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  transition: 'all 0.3s var(--ease-out)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <img src={track.artwork} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* ---- Trending Now ---- */}
      <section style={{ marginBottom: 'var(--space-xl)', padding: '0 var(--space-lg)' }}>
        <h2 style={{
          fontSize: 'clamp(1.0625rem, 3vw, 1.25rem)', fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', marginBottom: 'var(--space-md)',
        }}>Trending Now</h2>
        {loading ? (
          <>{Array.from({ length: 5 }).map((_, i) => <SongRowSkeleton key={i} />)}</>
        ) : (
          <div>{trending.slice(0, 10).map((t, i) => (
            <SongRow key={t.id} track={t} tracks={trending} index={i} showIndex showAlbum />
          ))}</div>
        )}
      </section>

      {/* ---- New Releases ---- */}
      {albums.length > 0 && (
        <section style={{ marginBottom: 'var(--space-xl)', padding: '0 var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 'clamp(1.0625rem, 3vw, 1.25rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              New Release
            </h2>
            <button className="hover-lift"
              style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, padding: '4px 8px', borderRadius: 'var(--radius-sm)', transition: 'all var(--t-fast)' }}>
              See More
            </button>
          </div>
          <HorizontalScroll gap={16}>{albums.map((a) => <AlbumCard key={a.id} album={a} />)}</HorizontalScroll>
        </section>
      )}

      {/* ---- Category Tabs (Music/Podcast/Video/Radio) ---- */}
      <section style={{ padding: '0 var(--space-lg)' }}>
        <div style={{
          display: 'flex', gap: 'var(--space-sm)',
          overflowX: 'auto', paddingBottom: 'var(--space-sm)',
        }} className="hide-scrollbar">
          {(['music', 'podcast', 'video', 'radio'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="hover-lift"
              style={{
                padding: '10px 24px', borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem', fontWeight: 600, textTransform: 'capitalize',
                flexShrink: 0, cursor: 'pointer',
                background: activeTab === tab ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.06)',
                transition: 'all var(--t-fast)',
                boxShadow: activeTab === tab ? '0 4px 20px rgba(139,92,246,0.3)' : 'none',
              }}>
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* ---- Made For You (quick picks) ---- */}
      {!loading && trending.length > 10 && (
        <section style={{ marginBottom: 'var(--space-xl)', padding: '0 var(--space-lg)', marginTop: 'var(--space-xl)' }}>
          <h2 style={{
            fontSize: 'clamp(1.0625rem, 3vw, 1.25rem)', fontWeight: 700, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', marginBottom: 'var(--space-md)',
          }}>Made For You</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-sm)' }}>
            {trending.slice(10, 16).map((t) => (
              <button key={t.id} onClick={() => quickPlay(t)} className="hover-lift"
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
                  transition: 'all var(--t-fast)', textAlign: 'left',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.05)'; ev.currentTarget.style.borderColor = 'var(--border-subtle)'; ev.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'; ev.currentTarget.style.borderColor = 'transparent'; ev.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <img src={t.artwork} alt="" style={{ width: 56, height: 56, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
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
