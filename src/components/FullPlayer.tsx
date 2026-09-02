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

  const [view, setView] = useState<'highlight' | 'lyrics' | 'embed'>('highlight');

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

  useEffect(() => {
    if (currentTrack && isPlaying) addToRecentlyPlayed(currentTrack);
  }, [currentTrack?.id]); // eslint-disable-line

  useEffect(() => {
    if (!currentTrack || view !== 'lyrics') return;
    setLyricsLoading(true);
    setLyrics([]);
    getTrackLyrics(currentTrack.id.replace('itunes-', ''))
      .then(setLyrics).catch(() => setLyrics([])).finally(() => setLyricsLoading(false));
  }, [currentTrack?.id, view]);

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

  const handleSeekTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    seek(Math.max(0, Math.min(duration, ((touch.clientX - r.left) / r.width) * duration)));
  };

  const ambientBg = dominant
    ? `radial-gradient(ellipse 80% 50% at 50% 30%, ${dominant}40 0%, transparent 70%), var(--bg-base)`
    : 'var(--bg-base)';

  return (
    <div
      className="full-player-overlay"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 'var(--z-overlay)',
        display: 'flex', flexDirection: 'column',
        background: ambientBg,
        transition: 'background 1.2s ease',
        animation: 'fadeIn 0.3s var(--ease-out)',
        overflow: 'auto',
      }}
    >
      {/* ---- Top bar ---- */}
      <div style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'var(--space-md) var(--space-lg)',
        paddingTop: 'max(var(--space-md), env(safe-area-inset-top))',
        position: 'sticky', top: 0, zIndex: 10,
        flexShrink: 0,
      }}>
        <button onClick={toggleFullPlayer} aria-label="Close" className="hover-lift"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', transition: 'all var(--t-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          <Icon.ChevronDown size={24} />
        </button>

        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', padding: 3 }}>
          {(['highlight', 'lyrics', 'embed'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '7px 18px', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 600,
              background: view === v ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: view === v ? 'var(--text-primary)' : 'var(--text-tertiary)',
              transition: 'all var(--t-fast)',
            }}>{v === 'highlight' ? 'Highlight' : v === 'lyrics' ? 'Lyrics' : 'Video'}</button>
          ))}
        </div>

        <button aria-label="More" className="hover-lift"
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', transition: 'all var(--t-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
        >
          <Icon.More size={20} />
        </button>
      </div>

      {/* ---- Content ---- */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%',
        padding: '0 var(--space-xl)',
        justifyContent: view === 'lyrics' ? 'flex-start' : 'center',
      }}>

        {/* ===== HIGHLIGHT VIEW ===== */}
        {view === 'highlight' && (
          <>
            {/* Large artwork */}
            <div style={{
              width: 'min(78vw, 340px)', aspectRatio: '1/1',
              borderRadius: 'var(--radius-xl)', overflow: 'hidden',
              boxShadow: dominant
                ? `0 32px 80px ${dominant}45, 0 0 120px ${dominant}12`
                : '0 32px 80px rgba(0,0,0,0.6)',
              transition: 'box-shadow 1.2s ease',
              marginBottom: 'var(--space-xl)',
              animation: isPlaying ? 'artworkBreath 6s ease-in-out infinite' : 'none',
            }}>
              <img src={currentTrack.artwork} alt={currentTrack.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Track info */}
            <div style={{ textAlign: 'center', width: '100%', marginBottom: 'var(--space-lg)', maxWidth: 400 }}>
              <h2 style={{
                fontSize: 'clamp(1.25rem, 5vw, 1.625rem)', fontWeight: 700, letterSpacing: '-0.02em',
                color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2,
              }}>{currentTrack.title}</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: 4 }}>
                {currentTrack.artist}
              </p>
            </div>

            {/* Seek bar */}
            <div style={{ width: '100%', maxWidth: 400, marginBottom: 'var(--space-xs)' }}>
              <div onClick={handleSeek} onTouchMove={handleSeekTouch}
                style={{
                  height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4,
                  cursor: 'pointer', position: 'relative', touchAction: 'none',
                }}
                role="slider" aria-label="Seek" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={Math.round(duration)}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: 'var(--gradient-accent)', borderRadius: 4,
                  position: 'relative', transition: 'width 0.1s linear',
                }}>
                  <div style={{
                    position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
                    width: 12, height: 12, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 0 8px rgba(139,92,246,0.5)',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{formatTime(progress)}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>-{formatTime(Math.max(0, duration - progress))}</span>
              </div>
            </div>

            {/* Transport controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-lg)' }}>
              <CtrlBtn onClick={toggleShuffle} active={shuffle} label="Shuffle">
                <Icon.Shuffle size={22} />
              </CtrlBtn>
              <CtrlBtn onClick={previous} label="Previous">
                <Icon.Previous size={28} />
              </CtrlBtn>

              <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}
                className="hover-lift"
                style={{
                  width: 68, height: 68, borderRadius: '50%',
                  background: 'linear-gradient(180deg, #fff 0%, #e0e0e8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000', flexShrink: 0,
                  boxShadow: '0 4px 24px rgba(255,255,255,0.15), 0 0 40px rgba(139,92,246,0.12)',
                  transition: 'transform 80ms var(--ease-spring)',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.88)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {isPlaying ? <Icon.Pause size={30} /> : <Icon.Play size={30} style={{ marginLeft: 3 }} />}
              </button>

              <CtrlBtn onClick={next} label="Next">
                <Icon.Next size={28} />
              </CtrlBtn>
              <CtrlBtn onClick={cycleRepeat} active={repeat !== 'off'} label="Repeat" badge={repeat === 'one' ? '1' : undefined}>
                <Icon.Repeat size={22} />
              </CtrlBtn>
            </div>

            {/* Secondary actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2xl)', marginBottom: 'var(--space-xl)' }}>
              <button onClick={() => { if (isLiked) removeFavorite(currentTrack.id); else addFavorite(currentTrack); }}
                aria-label={isLiked ? 'Unlike' : 'Like'} className="hover-lift"
                style={{
                  color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)',
                  padding: 'var(--space-sm)', transition: 'all 0.25s var(--ease-spring)',
                  transform: isLiked ? 'scale(1.1)' : 'scale(1)',
                }}>
                <Icon.Heart size={24} filled={isLiked} />
              </button>
              <button aria-label="Equalizer" className="hover-lift"
                style={{ color: 'var(--text-tertiary)', padding: 'var(--space-sm)', transition: 'all var(--t-fast)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                <Icon.Settings size={22} />
              </button>
              <button aria-label="Queue" className="hover-lift"
                style={{ color: 'var(--text-tertiary)', padding: 'var(--space-sm)', transition: 'all var(--t-fast)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                <Icon.Queue size={22} />
              </button>
            </div>

            {/* Bottom buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 400 }}>
              <button className="hover-lift" style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                padding: '10px 18px', borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500,
                transition: 'all var(--t-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <Icon.Settings size={16} />
                Equalizer Settings
              </button>
              <button className="hover-lift" style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                padding: '10px 18px', borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500,
                transition: 'all var(--t-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <Icon.Queue size={16} />
                Queue List
              </button>
            </div>
          </>
        )}

        {/* ===== EMBED VIEW ===== */}
        {view === 'embed' && (
          <div style={{ width: '100%', paddingTop: 'var(--space-lg)', maxWidth: 500 }}>
            <h2 style={{
              fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', fontWeight: 700, letterSpacing: '-0.02em',
              color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textAlign: 'center', marginBottom: 4,
            }}>{currentTrack.title}</h2>
            <p style={{
              fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500,
              textAlign: 'center', marginBottom: 'var(--space-xl)',
            }}>{currentTrack.artist}</p>

            {currentTrack.appleMusicEmbedUrl ? (
              <AppleMusicEmbed track={currentTrack} height={450} />
            ) : (
              <div style={{
                padding: 'var(--space-3xl)', textAlign: 'center',
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
              }}>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                  Full playback not available for this track
                </p>
              </div>
            )}
            <p style={{
              fontSize: '0.625rem', color: 'var(--text-muted)', textAlign: 'center',
              marginTop: 'var(--space-md)',
            }}>
              Powered by Apple Music · Full song playback
            </p>
          </div>
        )}

        {/* ===== LYRICS VIEW ===== */}
        {view === 'lyrics' && (
          <div style={{ width: '100%', paddingTop: 'var(--space-lg)', paddingBottom: '50vh', maxWidth: 500 }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, textAlign: 'center' }}>
              {currentTrack.title}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
              {currentTrack.artist}
            </p>
            {lyricsLoading ? (
              <div style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-md)' }}>Loading lyrics...</p>
              </div>
            ) : lyrics.length > 0 ? (
              <div ref={lyricsRef} style={{ maxHeight: '55vh', overflowY: 'auto', scrollBehavior: 'smooth', textAlign: 'center', padding: 'var(--space-md) 0' }} className="hide-scrollbar">
                {lyrics.map((line, i) => (
                  <p key={i} data-l={i} style={{
                    fontSize: i === activeLine ? '1.5rem' : '1.0625rem',
                    fontWeight: i === activeLine ? 700 : 400,
                    color: i === activeLine ? '#fff' : 'var(--text-tertiary)',
                    transition: 'all 0.35s var(--ease-out)',
                    marginBottom: 'var(--space-lg)',
                    opacity: i === activeLine ? 1 : 0.4,
                    transform: i === activeLine ? 'scale(1.04)' : 'scale(1)',
                    lineHeight: 1.7,
                  }}>{line.words}</p>
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
                <Icon.Lyrics size={36} style={{ color: 'var(--text-muted)', margin: '0 auto var(--space-md)' }} />
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>No lyrics available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CtrlBtn({ onClick, active, label, children, badge }: {
  onClick: () => void; active?: boolean; label: string; children: React.ReactNode; badge?: string;
}) {
  return (
    <button onClick={onClick} aria-label={label} className="hover-lift" style={{
      color: active ? 'var(--accent)' : 'var(--text-secondary)',
      padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', transition: 'all var(--t-fast)',
    }}
    onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
    onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      {children}
      {badge && <span style={{
        position: 'absolute', top: 2, right: 0, fontSize: '0.5rem', fontWeight: 700, lineHeight: 1,
        color: active ? 'var(--accent)' : 'var(--text-tertiary)',
      }}>{badge}</span>}
    </button>
  );
}
