import { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useDominantColor } from '../hooks/useDominantColor';
import { formatTime } from '../utils/formatTime';
import { getTrackLyrics, type LyricLine } from '../services/api';

export function FullPlayer() {
  const {
    currentTrack, isPlaying, progress, duration, shuffle, repeat,
    showFullPlayer, toggleFullPlayer, togglePlay, next, previous, seek,
    toggleShuffle, cycleRepeat, toggleMute,
  } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();
  const dominant = useDominantColor(currentTrack?.artwork);
  const lyricsRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<'artwork' | 'lyrics'>('artwork');
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  // Fetch lyrics
  useEffect(() => {
    if (!currentTrack || view !== 'lyrics') return;
    setLyricsLoading(true);
    setLyrics([]);
    getTrackLyrics(currentTrack.id.replace('dz-', ''))
      .then(setLyrics)
      .catch(() => setLyrics([]))
      .finally(() => setLyricsLoading(false));
  }, [currentTrack?.id, view]);

  // Sync lyrics
  useEffect(() => {
    if (lyrics.length === 0) return;
    const ms = progress * 1000;
    let idx = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (ms >= lyrics[i].startTimeMs) { idx = i; break; }
    }
    setActiveLine(idx);
    if (idx >= 0 && lyricsRef.current) {
      const el = lyricsRef.current.querySelector(`[data-l="${idx}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [progress, lyrics]);

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && showFullPlayer) toggleFullPlayer(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [showFullPlayer, toggleFullPlayer]);

  if (!currentTrack || !showFullPlayer) return null;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * duration);
  };

  const ambientBg = dominant
    ? `radial-gradient(ellipse 80% 50% at 50% 0%, ${dominant}50 0%, transparent 70%), var(--bg-base)`
    : 'var(--bg-base)';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      background: ambientBg,
      transition: 'background 1s ease',
      animation: 'fadeIn 0.35s var(--ease-out)',
      overflow: 'auto',
    }}>
      {/* Close */}
      <button onClick={toggleFullPlayer} aria-label="Close"
        style={{
          position: 'absolute', top: 'var(--space-lg)', left: 'var(--space-lg)',
          color: 'var(--text-secondary)', padding: 'var(--space-sm)',
          borderRadius: 'var(--radius-full)', zIndex: 10,
          background: 'rgba(255,255,255,0.06)',
        }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {/* View toggle */}
      <div style={{
        position: 'absolute', top: 'var(--space-lg)', right: 'var(--space-lg)',
        display: 'flex', gap: 2, background: 'rgba(255,255,255,0.06)',
        borderRadius: 'var(--radius-full)', padding: 2, zIndex: 10,
      }}>
        {(['artwork', 'lyrics'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            style={{
              padding: '5px 14px', borderRadius: 'var(--radius-full)',
              fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              background: view === v ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: view === v ? 'var(--text-primary)' : 'var(--text-tertiary)',
              transition: 'all var(--t-fast)',
            }}>
            {v === 'artwork' ? 'Cover' : 'Lyrics'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: view === 'lyrics' ? 'flex-start' : 'center',
        width: '100%', maxWidth: 560, padding: '80px var(--space-xl) var(--space-2xl)',
      }}>

        {view === 'artwork' ? (
          <>
            <p style={{
              fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xl)',
            }}>Now Playing</p>

            {/* Artwork */}
            <div style={{
              width: 'min(72vw, 340px)', aspectRatio: '1/1',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              boxShadow: dominant
                ? `0 24px 80px ${dominant}50, 0 0 120px ${dominant}15`
                : '0 24px 80px rgba(0,0,0,0.6)',
              transition: 'box-shadow 1s ease',
              marginBottom: 'var(--space-2xl)',
              animation: isPlaying ? 'pulse 4s ease-in-out infinite' : 'none',
            }}>
              <img src={currentTrack.artwork} alt={currentTrack.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </>
        ) : (
          /* Lyrics view */
          <div style={{ width: '100%', paddingTop: 'var(--space-2xl)', paddingBottom: '40vh' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, textAlign: 'center' }}>
              {currentTrack.title}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
              {currentTrack.artist}
            </p>

            {lyricsLoading ? (
              <div style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-md)' }}>Loading lyrics...</p>
              </div>
            ) : lyrics.length > 0 ? (
              <div ref={lyricsRef} style={{ maxHeight: '50vh', overflowY: 'auto', scrollBehavior: 'smooth', textAlign: 'center' }}>
                {lyrics.map((line, i) => (
                  <p key={i} data-l={i} style={{
                    fontSize: i === activeLine ? '1.5rem' : '1rem',
                    fontWeight: i === activeLine ? 700 : 400,
                    color: i === activeLine ? '#fff' : 'var(--text-tertiary)',
                    transition: 'all 0.35s var(--ease-out)',
                    marginBottom: 'var(--space-md)',
                    opacity: i === activeLine ? 1 : 0.45,
                    transform: i === activeLine ? 'scale(1.06)' : 'scale(1)',
                    lineHeight: 1.6,
                  }}>{line.words}</p>
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
                <p style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>📝</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>No lyrics available</p>
              </div>
            )}
          </div>
        )}

        {/* Track info */}
        <div style={{ textAlign: 'center', width: '100%', marginBottom: 'var(--space-lg)' }}>
          <h2 style={{
            fontSize: 'clamp(1.25rem, 4vw, 1.6rem)', fontWeight: 700,
            color: '#fff', letterSpacing: '-0.02em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{currentTrack.title}</h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 2 }}>
            {currentTrack.artist}
          </p>
        </div>

        {/* Seek bar */}
        <div style={{ width: '100%', maxWidth: 480, marginBottom: 'var(--space-xs)' }}>
          <div onClick={handleSeek} style={{
            height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, cursor: 'pointer', position: 'relative',
          }} role="slider" aria-label="Seek" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={Math.round(duration)}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-primary)', borderRadius: 2, position: 'relative' }}>
              <div style={{
                position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                width: 12, height: 12, borderRadius: '50%', background: '#fff',
                boxShadow: '0 0 10px rgba(139,92,246,0.4)',
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{formatTime(progress)}</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
          <Btn onClick={toggleShuffle} active={shuffle} label="Shuffle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </Btn>
          <Btn onClick={previous} label="Previous">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </Btn>
          <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{
              width: 60, height: 60, borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000',
              transition: 'transform 80ms var(--ease-spring)',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isPlaying ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <Btn onClick={next} label="Next">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </Btn>
          <Btn onClick={cycleRepeat} active={repeat !== 'off'} label="Repeat" badge={repeat === 'one' ? '1' : undefined}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </Btn>
        </div>

        {/* Like */}
        <button onClick={() => { if (isLiked) removeFavorite(currentTrack.id); else addFavorite(currentTrack); }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          style={{
            color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)',
            padding: 'var(--space-sm)',
            transition: 'all 0.25s var(--ease-spring)',
            transform: isLiked ? 'scale(1.15)' : 'scale(1)',
          }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Btn({ onClick, active, label, children, badge }: {
  onClick: () => void; active?: boolean; label: string; children: React.ReactNode; badge?: string;
}) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', transition: 'color var(--t-fast)',
    }}>
      {children}
      {badge && <span style={{
        position: 'absolute', top: -1, right: -3, fontSize: '0.45rem', fontWeight: 700, lineHeight: 1,
        color: active ? 'var(--accent)' : 'var(--text-tertiary)',
      }}>{badge}</span>}
    </button>
  );
}
