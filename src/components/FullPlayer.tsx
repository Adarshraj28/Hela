import { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useDominantColor } from '../hooks/useDominantColor';
import { formatTime } from '../utils/formatTime';
import { getTrackLyrics, type LyricLine } from '../services/api';
import { Icon } from './HelaIcons';
import { AppleMusicEmbed } from './AppleMusicEmbed';

export function FullPlayer() {
  const {
    currentTrack, isPlaying, progress, duration, shuffle, repeat,
    showFullPlayer, toggleFullPlayer, togglePlay, next, previous, seek,
    toggleShuffle, cycleRepeat,
  } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite, addToRecentlyPlayed } = useLibraryStore();
  const dominant = useDominantColor(currentTrack?.artwork);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const [view, setView] = useState<'cover' | 'lyrics' | 'player'>('cover');

  // Swipe down to close (mobile gesture)
  const handleTouchStart = (e: React.TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 100) toggleFullPlayer();
  };
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  // Record to recently played
  useEffect(() => {
    if (currentTrack && isPlaying) {
      addToRecentlyPlayed(currentTrack);
    }
  }, [currentTrack?.id]); // eslint-disable-line

  // Fetch lyrics
  useEffect(() => {
    if (!currentTrack || view !== 'lyrics') return;
    setLyricsLoading(true);
    setLyrics([]);
    getTrackLyrics(currentTrack.id.replace('itunes-', ''))
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

  // Ambient background from dominant color
  const ambientBg = dominant
    ? `radial-gradient(ellipse 70% 50% at 50% 20%, ${dominant}40 0%, transparent 70%), var(--bg-base)`
    : 'var(--bg-base)';

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: ambientBg,
        transition: 'background 1.2s ease',
        animation: 'fadeIn 0.3s var(--ease-out)',
        overflow: 'auto',
      }}
    >

      {/* ---- Top bar ---- */}
      <div style={{
        width: '100%', maxWidth: 560,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-md) var(--space-lg)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div className="mobile-drag-hint" style={{
          display: 'none',
          width: 32, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)',
          position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)',
        }} />
        <button onClick={toggleFullPlayer} aria-label="Close" style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)',
        }}>
          <Icon.ChevronDown size={22} />
        </button>
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', padding: 2 }}>
          {(['cover', 'player', 'lyrics'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: view === v ? 'var(--text-primary)' : 'var(--text-tertiary)',
              transition: 'all var(--t-fast)',
            }}>{v === 'cover' ? 'Cover' : v === 'player' ? 'Full Play' : 'Lyrics'}</button>
          ))}
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* ---- Content ---- */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 560,
        padding: '0 var(--space-xl)',
        justifyContent: view === 'lyrics' ? 'flex-start' : 'center',
      }}>

        {/* ===== COVER VIEW ===== */}
        {view === 'cover' && (
          <>
            <p style={{
              fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-xl)',
            }}>Now Playing</p>

            {/* Artwork — the visual anchor */}
            <div style={{
              width: 'min(72vw, 320px)', aspectRatio: '1/1',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              boxShadow: dominant
                ? `0 24px 80px ${dominant}40, 0 0 100px ${dominant}10`
                : '0 24px 80px rgba(0,0,0,0.55)',
              transition: 'box-shadow 1.2s ease',
              marginBottom: 'var(--space-2xl)',
              animation: isPlaying ? 'artworkBreath 6s ease-in-out infinite' : 'none',
            }}>
              <img src={currentTrack.artwork} alt={currentTrack.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.4s' }} />
            </div>

            {/* Track info */}
            <div style={{ textAlign: 'center', width: '100%', marginBottom: 'var(--space-lg)' }}>
              <h2 style={{
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', fontWeight: 700, letterSpacing: '-0.02em',
                color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2,
              }}>{currentTrack.title}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4, fontFamily: 'var(--font)' }}>
                {currentTrack.artist}
              </p>
            </div>

            {/* Seek bar */}
            <div style={{ width: '100%', maxWidth: 440, marginBottom: 'var(--space-xs)' }}>
              <div onClick={handleSeek} style={{
                height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, cursor: 'pointer', position: 'relative',
              }} role="slider" aria-label="Seek" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={Math.round(duration)}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-accent)', borderRadius: 4, position: 'relative', transition: 'width 0.1s linear' }}>
                  <div style={{
                    position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                    width: 12, height: 12, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 0 8px rgba(139,92,246,0.35)',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font)' }}>{formatTime(progress)}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font)' }}>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
              <CtrlBtn onClick={toggleShuffle} active={shuffle} label="Shuffle">
                <Icon.Shuffle size={18} />
              </CtrlBtn>
              <CtrlBtn onClick={previous} label="Previous">
                <Icon.Previous size={26} />
              </CtrlBtn>

              {/* Large play button */}
              <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(180deg, #fff 0%, #e0e0e8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', flexShrink: 0,
                  boxShadow: '0 4px 24px rgba(255,255,255,0.15), 0 0 60px rgba(139,92,246,0.15), 0 0 80px rgba(139,92,246,0.08)',
                  transition: 'transform 80ms var(--ease-spring), box-shadow 0.3s',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.88)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {isPlaying ? <Icon.Pause size={28} /> : <Icon.Play size={28} style={{ marginLeft: 2 }} />}
              </button>

              <CtrlBtn onClick={next} label="Next">
                <Icon.Next size={26} />
              </CtrlBtn>
              <CtrlBtn onClick={cycleRepeat} active={repeat !== 'off'} label="Repeat" badge={repeat === 'one' ? '1' : undefined}>
                <Icon.Repeat size={18} />
              </CtrlBtn>
            </div>

            {/* Secondary actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
              <button onClick={() => { if (isLiked) removeFavorite(currentTrack.id); else addFavorite(currentTrack); }}
                aria-label={isLiked ? 'Unlike' : 'Like'}
                style={{
                  color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)',
                  padding: 'var(--space-xs)', transition: 'all 0.25s var(--ease-spring)',
                  transform: isLiked ? 'scale(1.1)' : 'scale(1)',
                }}>
                <Icon.Heart size={22} filled={isLiked} />
              </button>
              <button aria-label="Lyrics" onClick={() => setView('lyrics')}
                style={{ color: 'var(--text-tertiary)', padding: 'var(--space-xs)' }}>
                <Icon.Lyrics size={20} />
              </button>
              <button aria-label="Full Play" onClick={() => setView('player')}
                style={{ color: 'var(--text-tertiary)', padding: 'var(--space-xs)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                </svg>
              </button>
              <button aria-label="Share"
                onClick={() => {
                  if (navigator.share) navigator.share({ title: currentTrack.title, text: `${currentTrack.title} by ${currentTrack.artist}` });
                }}
                style={{ color: 'var(--text-tertiary)', padding: 'var(--space-xs)' }}>
                <Icon.Share size={20} />
              </button>
            </div>
          </>
        )}

        {/* ===== FULL PLAY (EMBED) VIEW ===== */}
        {view === 'player' && (
          <div style={{ width: '100%', paddingTop: 'var(--space-lg)' }}>
            <p style={{
              fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)',
              textAlign: 'center',
            }}>Full Player</p>
            <h2 style={{
              fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', fontWeight: 700, letterSpacing: '-0.02em',
              color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textAlign: 'center', marginBottom: 4,
            }}>{currentTrack.title}</h2>
            <p style={{
              fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500,
              textAlign: 'center', marginBottom: 'var(--space-xl)',
            }}>{currentTrack.artist}</p>
            
            {currentTrack.appleMusicEmbedUrl ? (
              <AppleMusicEmbed track={currentTrack} height={450} />
            ) : (
              <div style={{
                padding: 'var(--space-3xl)', textAlign: 'center',
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
              }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Full playback not available for this track
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)' }}>
                  Try playing the preview instead
                </p>
              </div>
            )}
            <p style={{
              fontSize: '0.5625rem', color: 'var(--text-muted)', textAlign: 'center',
              marginTop: 'var(--space-md)', fontFamily: 'var(--font)',
            }}>
              Powered by Apple Music · Full song playback
            </p>
          </div>
        )}

        {/* ===== LYRICS VIEW ===== */}
        {view === 'lyrics' && (
          <div style={{ width: '100%', paddingTop: 'var(--space-lg)', paddingBottom: '50vh' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2, textAlign: 'center' }}>
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
              <div ref={lyricsRef} style={{ maxHeight: '55vh', overflowY: 'auto', scrollBehavior: 'smooth', textAlign: 'center', padding: 'var(--space-md) 0' }}>
                {lyrics.map((line, i) => (
                  <p key={i} data-l={i} style={{
                    fontSize: i === activeLine ? '1.35rem' : '0.9375rem',
                    fontWeight: i === activeLine ? 700 : 400,
                    color: i === activeLine ? '#fff' : 'var(--text-tertiary)',
                    transition: 'all 0.35s var(--ease-out)',
                    marginBottom: 'var(--space-md)',
                    opacity: i === activeLine ? 1 : 0.4,
                    transform: i === activeLine ? 'scale(1.04)' : 'scale(1)',
                    lineHeight: 1.7,
                  }}>{line.words}</p>
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
                <Icon.Lyrics size={32} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-md)' }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>No lyrics available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile-specific styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-drag-hint { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function CtrlBtn({ onClick, active, label, children, badge }: {
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
        position: 'absolute', top: -2, right: -4, fontSize: '0.4rem', fontWeight: 700, lineHeight: 1,
        color: active ? 'var(--accent)' : 'var(--text-tertiary)',
      }}>{badge}</span>}
    </button>
  );
}
