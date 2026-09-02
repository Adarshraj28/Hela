import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatTime } from '../utils/formatTime';

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFullPlayer,
  } = usePlayerStore();

  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();

  if (!currentTrack) return null;

  const isLiked = isFavorite(currentTrack.id);
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    seek(percent * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--player-height)',
        background: 'linear-gradient(to top, rgba(10, 10, 15, 0.98), rgba(18, 18, 26, 0.95))',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-lg)',
        gap: 'var(--space-lg)',
        zIndex: 'var(--z-player)',
      }}
    >
      {/* Progress bar - top of mini player */}
      <div
        onClick={handleSeek}
        style={{
          position: 'absolute',
          top: -2,
          left: 0,
          right: 0,
          height: 4,
          background: 'var(--bg-surface)',
          cursor: 'pointer',
          zIndex: 1,
        }}
        role="slider"
        aria-label="Seek"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
      >
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: 'var(--gradient-primary)',
          borderRadius: '0 2px 2px 0',
          transition: 'width 0.1s linear',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            right: -5,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 6px rgba(168, 85, 247, 0.5)',
            opacity: 0,
            transition: 'opacity var(--transition-fast)',
          }} className="seek-dot" />
        </div>
      </div>

      {/* Track info */}
      <div
        onClick={toggleFullPlayer}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          cursor: 'pointer',
          minWidth: 0,
          flex: '0 1 300px',
        }}
      >
        <img
          src={currentTrack.artwork}
          alt={`${currentTrack.title} artwork`}
          style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {currentTrack.title}
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: 1,
          }}>
            {currentTrack.artist}
          </p>
        </div>

        {/* Favorite in mini player */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isLiked) removeFavorite(currentTrack.id);
            else addFavorite(currentTrack);
          }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          style={{
            color: isLiked ? 'var(--accent-secondary)' : 'var(--text-tertiary)',
            flexShrink: 0,
            padding: 4,
            transition: 'color var(--transition-fast)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Center controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        flex: '1 1 auto',
        maxWidth: 600,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
            aria-label="Shuffle"
            style={{
              color: shuffle ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              padding: 4,
              transition: 'color var(--transition-fast)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); previous(); }}
            aria-label="Previous"
            style={{ color: 'var(--text-primary)', padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bg-primary)',
              transition: 'transform var(--transition-fast)',
            }}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
            style={{ color: 'var(--text-primary)', padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); cycleRepeat(); }}
            aria-label="Repeat"
            style={{
              color: repeat !== 'off' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
              padding: 4,
              transition: 'color var(--transition-fast)',
              position: 'relative',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            {repeat === 'one' && (
              <span style={{
                position: 'absolute',
                top: -2,
                right: -2,
                fontSize: '0.5rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
              }}>
                1
              </span>
            )}
          </button>
        </div>

        {/* Time and seek */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          width: '100%',
        }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', minWidth: 35, textAlign: 'right' }}>
            {formatTime(progress)}
          </span>
          <div
            onClick={handleSeek}
            style={{
              flex: 1,
              height: 4,
              background: 'var(--bg-surface)',
              borderRadius: 2,
              cursor: 'pointer',
              position: 'relative',
            }}
            role="slider"
            aria-label="Seek"
          >
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'var(--gradient-primary)',
              borderRadius: 2,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                right: -4,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'white',
                opacity: 0,
                transition: 'opacity var(--transition-fast)',
              }} />
            </div>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', minWidth: 35 }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right controls - Volume */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        flex: '0 1 200px',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          style={{ color: 'var(--text-tertiary)', padding: 4 }}
        >
          {isMuted || volume === 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
          style={{
            width: 80,
            height: 4,
            appearance: 'none',
            WebkitAppearance: 'none',
            background: `linear-gradient(to right, var(--accent-primary) ${(isMuted ? 0 : volume) * 100}%, var(--bg-surface) ${(isMuted ? 0 : volume) * 100}%)`,
            borderRadius: 2,
            cursor: 'pointer',
            outline: 'none',
          }}
        />
      </div>

      <style>{`
        @keyframes eq-bar {
          0% { height: 20%; }
          100% { height: 100%; }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
        .seek-dot { display: none; }
        @media (hover: hover) {
          div:hover > .seek-dot { display: block; }
        }
      `}</style>
    </div>
  );
}
