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

const MOODS = [
  { emoji: '🌙', label: 'Late Night', query: 'lofi chill' },
  { emoji: '💻', label: 'Coding', query: 'instrumental focus' },
  { emoji: '🔥', label: 'Hype', query: 'hip hop' },
  { emoji: '💔', label: 'Sad Hours', query: 'sad emotional' },
  { emoji: '☀️', label: 'Good Morning', query: 'happy upbeat' },
  { emoji: '🚗', label: 'Drive', query: 'driving rock' },
  { emoji: '🏋️', label: 'Gym', query: 'workout motivation' },
  { emoji: '🌧', label: 'Rainy Day', query: 'rain ambient' },
  { emoji: '🎵', label: 'Pop Hits', query: 'pop' },
  { emoji: '🎤', label: 'R&B', query: 'r&b soul' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [moodTracks, setMoodTracks] = useState<Record<string, Track[]>>({});
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

        // Pre-fetch a couple mood playlists
        const moodResults: Record<string, Track[]> = {};
        for (const mood of MOODS.slice(0, 3)) {
          try {
            const tracks = await musicApi.searchTracks(mood.query);
            moodResults[mood.label] = tracks.slice(0, 10);
          } catch { /* skip */ }
        }
        setMoodTracks(moodResults);
      } catch (err) {
        setError('Could not load music. Check your connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickPlay = (track: Track) => playTrack(track, trending, trending.indexOf(track));

  return (
    <div style={{ paddingBottom: 'var(--space-3xl)' }}>

      {/* Hero */}
      <div style={{ padding: 'var(--space-3xl) 0 var(--space-xl)', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -120, left: '30%',
          width: 500, height: 400,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800,
          color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1.1,
        }}>{getGreeting()}</h1>
        <p style={{
          fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
          color: 'var(--text-secondary)', marginTop: 'var(--space-xs)',
        }}>What do you want to listen to?</p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.15)',
          marginBottom: 'var(--space-xl)', textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>{error}</p>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 'var(--space-sm)', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.8125rem', fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {/* Quick Picks (Recently Played) */}
      {recentlyPlayed.length > 0 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <SectionHeader title="Recently Played" icon="🕐" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-sm)' }}>
            {recentlyPlayed.slice(0, 6).map((e) => (
              <button key={e.track.id} onClick={() => playTrack(e.track)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: '6px', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
                transition: 'background var(--t-fast)', textAlign: 'left',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <img src={e.track.artwork} alt="" style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.track.title}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Favorites quick access */}
      {favorites.length > 0 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <SectionHeader title="Your Favorites" action={
            <button onClick={() => navigate('/library')} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              See all →
            </button>
          } icon="💜" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-sm)' }}>
            {favorites.slice(0, 6).map((track) => (
              <button key={track.id} onClick={() => playTrack(track, favorites, favorites.indexOf(track))} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: '6px', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
                transition: 'background var(--t-fast)', textAlign: 'left',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <img src={track.artwork} alt="" style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Mood Playlists */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader title="Mood" subtitle="Pick your vibe" icon="🎨" />
        <HorizontalScroll gap={12}>
          {MOODS.map((mood) => {
            const tracks = moodTracks[mood.label];
            return (
              <button key={mood.label} onClick={() => {
                if (tracks && tracks.length > 0) {
                  playTrack(tracks[0], tracks, 0);
                } else {
                  navigate(`/search?q=${encodeURIComponent(mood.query)}`);
                }
              }} style={{
                width: 140, flexShrink: 0, padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all var(--t-normal) var(--ease-out)',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.08)'; ev.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.04)'; ev.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 'var(--space-sm)' }}>{mood.emoji}</span>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{mood.label}</p>
                <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {tracks ? `${tracks.length} tracks` : 'Tap to search'}
                </p>
              </button>
            );
          })}
        </HorizontalScroll>
      </section>

      {/* Trending */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader title="Trending Now" subtitle="What's hot" icon="🔥" />
        {loading ? (
          <>{Array.from({ length: 5 }).map((_, i) => <SongRowSkeleton key={i} />)}</>
        ) : (
          <div>{trending.slice(0, 10).map((t, i) => (
            <SongRow key={t.id} track={t} tracks={trending} index={i} showIndex showAlbum />
          ))}</div>
        )}
      </section>

      {/* Popular Artists */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader title="Popular Artists" icon="⭐" />
        {loading ? <GridSkeleton count={8} variant="artist" /> : (
          <HorizontalScroll gap={20}>{artists.map((a) => <ArtistCard key={a.id} artist={a} />)}</HorizontalScroll>
        )}
      </section>

      {/* Albums */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader title="Albums" subtitle="Discover new music" icon="💿" />
        {loading ? <GridSkeleton count={6} /> : (
          <HorizontalScroll gap={20}>{albums.map((a) => <AlbumCard key={a.id} album={a} />)}</HorizontalScroll>
        )}
      </section>

      {/* Made For You (Quick Picks from trending tail) */}
      {!loading && trending.length > 10 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <SectionHeader title="Made For You" subtitle="Quick picks" icon="✨" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-sm)' }}>
            {trending.slice(10, 16).map((t) => (
              <button key={t.id} onClick={() => quickPlay(t)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: '6px', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
                transition: 'background var(--t-fast)', textAlign: 'left',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <img src={t.artwork} alt="" style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
