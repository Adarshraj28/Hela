import { useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatTime } from '../utils/formatTime';
import { Icon } from './HelaIcons';

export function MiniPlayer() {
  const {
    currentTrack, isPlaying, progress, duration,
    togglePlay, next, toggleFullPlayer,
  } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();
  const seekRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const isLiked = isFavorite(currentTrack.id);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    usePlayerStore.getState().seek(pct * duration);
  }, [duration]);

  return (
    <div className="mini-player" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'var(--player-height)',
      background: 'var(--bg-glass-solid)',
      backdropFilter: 'blur(48px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(48px) saturate(1.6)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column',
      zIndex: 'var(--z-player)',
    }}>
      {/* Thin progress bar */}
      <div ref={seekRef} onClick={handleSeek}
        style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.04)', cursor: 'pointer', flexShrink: 0 }}
        role="slider" aria-label="Seek" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={Math.round(duration)}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-accent)', transition: 'width 0.15s linear' }} />
      </div>

      {/* Content row */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 var(--space-md)', gap: 'var(--space-sm)', minHeight: 0 }}>
        {/* Track info — tap to expand */}
        <button onClick={toggleFullPlayer} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          flex: '1 1 0', minWidth: 0, cursor: 'pointer', padding: 0, textAlign: 'left',
        }} aria-label="Open full player">
          {/* Artwork */}
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-sm)',
            overflow: 'hidden', flexShrink: 0, background: 'var(--bg-surface)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            <img src={currentTrack.artwork} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font)',
              color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2,
            }}>{currentTrack.title}</p>
            <p style={{
              fontSize: '0.6875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2, marginTop: 2,
            }}>{currentTrack.artist}</p>
          </div>
        </button>

        {/* Favorite */}
        <button onClick={() => { if (isLiked) removeFavorite(currentTrack.id); else addFavorite(currentTrack); }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          style={{ color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)', padding: 6, display: 'flex', flexShrink: 0,
            animation: isLiked ? 'heartbeat 0.35s var(--ease-spring)' : 'none' }}>
          <Icon.Heart size={17} filled={isLiked} />
        </button>

        {/* Play/Pause */}
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}
          style={{
            width: 36, height: 36, borderRadius: '50%', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', flexShrink: 0,
            boxShadow: '0 2px 12px rgba(255,255,255,0.15), 0 0 20px rgba(139,92,246,0.1)',
            transition: 'transform 80ms var(--ease-spring)',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.88)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isPlaying ? <Icon.Pause size={16} /> : <Icon.Play size={16} />}
        </button>

        {/* Next */}
        <button onClick={next} aria-label="Next"
          style={{ color: 'var(--text-secondary)', padding: 4, display: 'flex', flexShrink: 0 }}>
          <Icon.Next size={18} />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mini-player { height: var(--player-height-mobile) !important; }
        }
      `}</style>
    </div>
  );
}
