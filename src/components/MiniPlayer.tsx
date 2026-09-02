import { useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatTime } from '../utils/formatTime';
import { Icon } from './HelaIcons';

export function MiniPlayer() {
  const {
    currentTrack, isPlaying, progress, duration, error, isLoading,
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
      position: 'fixed',
      bottom: 'var(--mobile-nav-height)',
      left: 0, right: 0,
      height: 'var(--player-height)',
      background: 'var(--bg-glass-solid)',
      backdropFilter: 'blur(48px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(48px) saturate(1.6)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      zIndex: 'var(--z-player)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
    }}>
      {/* Thin progress bar */}
      <div ref={seekRef} onClick={handleSeek}
        style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', cursor: 'pointer', flexShrink: 0 }}
        role="slider" aria-label="Seek" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={Math.round(duration)}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-accent)', transition: 'width 0.15s linear' }} />
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '4px var(--space-md)', background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(239,68,68,0.1)',
        }}>
          <span style={{ fontSize: '0.6875rem', color: '#ef4444' }}>{error}</span>
          <button onClick={togglePlay} style={{
            fontSize: '0.6875rem', color: 'var(--accent)', fontWeight: 600,
            padding: '2px 10px', borderRadius: 'var(--radius-full)',
            background: 'rgba(139,92,246,0.1)',
          }}>Retry</button>
        </div>
      )}

      {/* Content row */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 var(--space-md)', gap: 'var(--space-sm)', minHeight: 0 }}>
        {/* Track info — tap to expand */}
        <button onClick={toggleFullPlayer} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          flex: '1 1 0', minWidth: 0, cursor: 'pointer', padding: 0, textAlign: 'left',
        }} aria-label="Open full player">
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-md)',
            overflow: 'hidden', flexShrink: 0, background: 'var(--bg-surface)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            border: isPlaying ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'border-color 0.3s',
          }}>
            <img src={currentTrack.artwork} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: '0.9375rem', fontWeight: 600,
              color: isPlaying ? 'var(--accent)' : 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2,
              transition: 'color 0.3s',
            }}>{currentTrack.title}</p>
            <p style={{
              fontSize: '0.8125rem', color: 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2, marginTop: 2,
            }}>{currentTrack.artist}</p>
          </div>
        </button>

        {/* Loading spinner */}
        {isLoading && (
          <div className="spinner" style={{ flexShrink: 0, width: 20, height: 20 }} />
        )}

        {/* Favorite */}
        <button onClick={() => { if (isLiked) removeFavorite(currentTrack.id); else addFavorite(currentTrack); }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          className="hover-lift"
          style={{ color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)', padding: 6, display: 'flex', flexShrink: 0,
            animation: isLiked ? 'heartbeat 0.35s var(--ease-spring)' : 'none',
            transition: 'all 0.2s var(--ease-spring)' }}>
          <Icon.Heart size={18} filled={isLiked} />
        </button>

        {/* Play/Pause — large and prominent */}
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}
          className="hover-lift"
          style={{
            width: 48, height: 48, borderRadius: '50%', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', flexShrink: 0,
            boxShadow: isPlaying
              ? '0 2px 16px rgba(255,255,255,0.2), 0 0 30px rgba(139,92,246,0.2)'
              : '0 2px 12px rgba(255,255,255,0.15)',
            transition: 'box-shadow 0.3s, transform 80ms var(--ease-spring)',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.88)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isPlaying ? <Icon.Pause size={20} /> : <Icon.Play size={20} />}
        </button>

        {/* Next */}
        <button onClick={next} aria-label="Next"
          className="hover-lift"
          style={{ color: 'var(--text-secondary)', padding: 4, display: 'flex', flexShrink: 0 }}>
          <Icon.Next size={22} />
        </button>
      </div>
    </div>
  );
}
