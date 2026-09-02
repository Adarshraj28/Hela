import { useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatTime } from '../utils/formatTime';

export function MiniPlayer() {
  const {
    currentTrack, isPlaying, progress, duration, volume, isMuted,
    togglePlay, next, previous, seek, setVolume, toggleMute,
    toggleFullPlayer, shuffle, repeat, toggleShuffle, cycleRepeat,
  } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();
  const seekRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const isLiked = isFavorite(currentTrack.id);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - rect.left) / rect.width) * duration);
  }, [seek, duration]);

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  }, [setVolume]);

  return (
    <div className="mini-player" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--player-height)',
      background: 'rgba(8, 8, 14, 0.92)',
      backdropFilter: 'blur(40px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 'var(--z-player)',
    }}>
      {/* Progress bar (very top) */}
      <div
        ref={seekRef}
        onClick={handleSeek}
        style={{
          width: '100%',
          height: 3,
          background: 'rgba(255,255,255,0.06)',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
        }}
        role="slider"
        aria-label="Seek"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
      >
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--gradient-primary)',
          transition: 'width 0.15s linear',
          position: 'relative',
        }}>
          {/* Thumb */}
          <div style={{
            position: 'absolute',
            right: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 0 8px rgba(139,92,246,0.5)',
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
          className="seek-thumb"
          />
        </div>
      </div>

      {/* Controls row */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-lg)',
        gap: 'var(--space-lg)',
        minHeight: 0,
      }}>
        {/* Track info */}
        <button
          onClick={toggleFullPlayer}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            flex: '1 1 280px',
            minWidth: 0,
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
          }}
          aria-label="Open full player"
        >
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            position: 'relative',
          }}>
            <img
              src={currentTrack.artwork}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {isPlaying && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
                  <span style={{ width: 2.5, background: '#fff', borderRadius: 1.5, animation: 'eq-1 0.5s infinite alternate', height: '40%' }} />
                  <span style={{ width: 2.5, background: '#fff', borderRadius: 1.5, animation: 'eq-2 0.5s 0.15s infinite alternate', height: '80%' }} />
                  <span style={{ width: 2.5, background: '#fff', borderRadius: 1.5, animation: 'eq-3 0.5s 0.3s infinite alternate', height: '50%' }} />
                </div>
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}>
              {currentTrack.title}
            </p>
            <p style={{
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
              marginTop: 1,
            }}>
              {currentTrack.artist}
            </p>
          </div>
        </button>

        {/* Center: transport controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          flex: '0 0 auto',
        }}>
          <TransportBtn onClick={toggleShuffle} active={shuffle} label="Shuffle" size={16}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </TransportBtn>
          <TransportBtn onClick={previous} label="Previous" size={18}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </TransportBtn>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              flexShrink: 0,
              transition: 'transform 80ms var(--ease-spring)',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <TransportBtn onClick={next} label="Next" size={18}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </TransportBtn>
          <TransportBtn onClick={cycleRepeat} active={repeat !== 'off'} label="Repeat" size={16} badge={repeat === 'one' ? '1' : undefined}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </TransportBtn>
        </div>

        {/* Right: time + volume */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          flex: '1 1 200px',
          justifyContent: 'flex-end',
        }}>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(progress)}
          </span>
          <div style={{
            flex: '0 1 120px',
            height: 3,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 2,
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={handleSeek}
          >
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: 'var(--gradient-primary)',
              borderRadius: 2,
            }} />
          </div>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', minWidth: 30, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(duration)}
          </span>

          {/* Volume */}
          <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}
            style={{ color: 'var(--text-tertiary)', padding: 4, display: 'flex' }}>
            {isMuted || volume === 0 ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
            )}
          </button>
          <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
            onChange={handleVolume} aria-label="Volume"
            style={{
              width: 64, height: 3, cursor: 'pointer',
              background: `linear-gradient(to right, var(--accent) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.06) ${(isMuted ? 0 : volume) * 100}%)`,
              borderRadius: 2, outline: 'none', appearance: 'none', WebkitAppearance: 'none',
            }}
          />

          {/* Favorite */}
          <button
            onClick={() => { if (isLiked) removeFavorite(currentTrack.id); else addFavorite(currentTrack); }}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            style={{
              color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)',
              padding: 4,
              display: 'flex',
              transition: 'transform 0.2s var(--ease-spring)',
              animation: isLiked ? 'heartbeat 0.4s var(--ease-spring)' : 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .mini-player .seek-thumb { display: none; }
        .mini-player > div:first-child:hover .seek-thumb { display: block; }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 10px; height: 10px; border-radius: 50%;
          background: #fff; cursor: pointer; box-shadow: 0 0 4px rgba(0,0,0,0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 10px; height: 10px; border-radius: 50%; background: #fff; cursor: pointer; border: none;
        }
        @media (max-width: 768px) {
          .mini-player {
            height: var(--player-height-mobile) !important;
          }
        }
      `}</style>
    </div>
  );
}

function TransportBtn({ onClick, active, label, size = 16, children, badge }: {
  onClick: () => void;
  active?: boolean;
  label: string;
  size?: number;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'color var(--t-fast)',
      }}
    >
      {children}
      {badge && (
        <span style={{
          position: 'absolute', top: 0, right: -1,
          fontSize: '0.45rem', fontWeight: 700, lineHeight: 1,
          color: active ? 'var(--accent)' : 'var(--text-tertiary)',
        }}>{badge}</span>
      )}
    </button>
  );
}
