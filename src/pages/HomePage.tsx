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
  { emoji: '🌙', label: 'Late Night', query: 'lofi chill', color: '#6366f1' },
  { emoji: '💻', label: 'Coding', query: 'instrumental focus', color: '#06b6d4' },
  { emoji: '🔥', label: 'Hype', query: 'hip hop', color: '#ef4444' },
  { emoji: '💔', label: 'Sad', query: 'sad emotional', color: '#8b5cf6' },
  { emoji: '☀️', label: 'Morning', query: 'happy upbeat', color: '#f59e0b' },
  { emoji: '🚗', label: 'Drive', query: 'driving rock', color: '#10b981' },
  { emoji: '🏋️', label: 'Gym', query: 'workout motivation', color: '#f97316' },
  { emoji: '🌧', label: 'Rainy', query: 'rain ambient', color: '#64748b' },
  { emoji: '🎵', label: 'Pop', query: 'pop hits', color: '#ec4899' },
  { emoji: '🎤', label: 'R&B', query: 'r&b soul', color: '#a855f7' },
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

        const moodResults: Record<string, Track[]> = {};
        for (const mood of MOODS.slice(0, 3)) {
          try {
            const tracks = await musicApi.searchTracks(mood.query);
            moodResults[mood.label] = tracks.slice(0, 10);
          } catch {}
        }
        setMoodTracks(moodResults);
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
      {/* ---- Hero ---- */}
      <div style={{ padding: 'var(--space-2xl) 0 var(--space-xl)', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -80, left: '25%', width: 400, height: 300,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <h1 style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.8rem)', fontWeight: 700,
          color: 'var(--text-primary)', letterSpacing: '-0.035em', lineHeight: 1.1,
          fontFamily: 'var(--font)',
        }}>{getGreeting()}</h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 2vw, 1rem)',
          color: 'var(--text-secondary)', marginTop: 'var(--space-xs)',
          fontFamily: 'var(--font)',
        }}>What do you want to listen to?</p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.12)',
          marginBottom: 'var(--space-xl)', textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.8125rem', color: '#ef4444', fontFamily: 'var(--font)' }}>{error}</p>
          <button onClick={() => window.location.reload()}
            style={{ marginTop: 'var(--space-xs)', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font)' }}>
            Retry
          </button>
        </div>
      )}

      {/* ---- Recently Played ---- */}
      {recentlyPlayed.length > 0 && (
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <SectionHeader title="Recently Played" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-xs)' }}>
            {recentlyPlayed.slice(0, 6).map((e) => (
              <button key={e.track.id} onClick={() => playTrack(e.track)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                padding: '5px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
                transition: 'background var(--t-fast)', textAlign: 'left',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <img src={e.track.artwork} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--radius-xs)', objectFit: 'cover', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font)' }}>
                  {e.track.title}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ---- Favorites ---- */}
      {favorites.length > 0 && (
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <SectionHeader title="Your Favorites" action={
            <button onClick={() => navigate('/library')} style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font)' }}>See all →</button>
          } />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-xs)' }}>
            {favorites.slice(0, 6).map((track) => (
              <button key={track.id} onClick={() => playTrack(track, favorites, favorites.indexOf(track))} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                padding: '5px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
                transition: 'background var(--t-fast)', textAlign: 'left',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <img src={track.artwork} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--radius-xs)', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font)' }}>{track.title}</p>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font)' }}>{track.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ---- Mood ---- */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <SectionHeader title="Pick Your Vibe" />
        <HorizontalScroll gap={10}>
          {MOODS.map((mood) => {
            const tracks = moodTracks[mood.label];
            return (
              <button key={mood.label} onClick={() => {
                if (tracks?.length) playTrack(tracks[0], tracks, 0);
                else navigate(`/search?q=${encodeURIComponent(mood.query)}`);
              }} style={{
                width: 120, flexShrink: 0, padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: `linear-gradient(135deg, ${mood.color}15, ${mood.color}08)`,
                border: `1px solid ${mood.color}15`,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all var(--t-normal) var(--ease-out)',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.transform = 'translateY(-2px)'; ev.currentTarget.style.borderColor = `${mood.color}30`; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.borderColor = `${mood.color}15`; }}
              >
                <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: 'var(--space-sm)' }}>{mood.emoji}</span>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>{mood.label}</p>
                <p style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', marginTop: 2, fontFamily: 'var(--font)' }}>
                  {tracks ? `${tracks.length} tracks` : 'Search'}
                </p>
              </button>
            );
          })}
        </HorizontalScroll>
      </section>

      {/* ---- Trending ---- */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <SectionHeader title="Trending Now" subtitle="What's hot right now" />
        {loading ? (
          <>{Array.from({ length: 5 }).map((_, i) => <SongRowSkeleton key={i} />)}</>
        ) : (
          <div>{trending.slice(0, 10).map((t, i) => (
            <SongRow key={t.id} track={t} tracks={trending} index={i} showIndex showAlbum />
          ))}</div>
        )}
      </section>

      {/* ---- Artists ---- */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <SectionHeader title="Popular Artists" />
        {loading ? <GridSkeleton count={8} variant="artist" /> : (
          <HorizontalScroll gap={18}>{artists.map((a) => <ArtistCard key={a.id} artist={a} />)}</HorizontalScroll>
        )}
      </section>

      {/* ---- Albums ---- */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <SectionHeader title="New Releases" subtitle="Discover new music" />
        {loading ? <GridSkeleton count={6} /> : (
          <HorizontalScroll gap={16}>{albums.map((a) => <AlbumCard key={a.id} album={a} />)}</HorizontalScroll>
        )}
      </section>

      {/* ---- Made For You ---- */}
      {!loading && trending.length > 10 && (
        <section style={{ marginBottom: 'var(--space-xl)' }}>
          <SectionHeader title="Made For You" subtitle="Quick picks" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-xs)' }}>
            {trending.slice(10, 16).map((t) => (
              <button key={t.id} onClick={() => quickPlay(t)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                padding: '5px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.02)', cursor: 'pointer',
                transition: 'background var(--t-fast)', textAlign: 'left',
              }}
              onMouseEnter={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(ev) => { ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <img src={t.artwork} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--radius-xs)', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font)' }}>{t.title}</p>
                  <p style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font)' }}>{t.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
