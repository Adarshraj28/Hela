import { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useDominantColor } from '../hooks/useDominantColor';
import { formatTime } from '../utils/formatTime';
import { getTrackLyrics, type LyricLine } from '../services/api';

export function FullPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    shuffle,
    repeat,
    showFullPlayer,
    toggleFullPlayer,
    togglePlay,
    next,
    previous,
    seek,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();
  const dominantColor = useDominantColor(currentTrack?.artwork);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Lyrics state
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack || !showLyrics) return;
    setLyricsLoading(true);
    setLyrics([]);
    setActiveLyricIndex(-1);

    // Try to fetch lyrics (Spotify ID extraction is best-effort)
    const fetchLyrics = async () => {
      try {
        // Use track title + artist to search for lyrics
        const lines = await getTrackLyrics(currentTrack.id.replace('dz-', ''));
        setLyrics(lines);
      } catch {
        setLyrics([]);
      } finally {
        setLyricsLoading(false);
      }
    };
    fetchLyrics();
  }, [currentTrack?.id, showLyrics]);

  // Auto-scroll to active lyric
  useEffect(() => {
    if (lyrics.length === 0 || !lyricsContainerRef.current) return;

    // Find the active lyric line based on progress
    const currentTimeMs = progress * 1000;
    let idx = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTimeMs >= lyrics[i].startTimeMs) {
        idx = i;
        break;
      }
    }
    setActiveLyricIndex(idx);

    // Auto-scroll
    if (idx >= 0) {
      const activeEl = lyricsContainerRef.current.querySelector(`[data-lyric-idx="${idx}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [progress, lyrics]);

  // Handle escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullPlayer) toggleFullPlayer();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showFullPlayer, toggleFullPlayer]);

  if (!currentTrack || !showFullPlayer) return null;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    seek(percent * duration);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-fullscreen)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: showLyrics ? 'flex-start' : 'center',
        background: dominantColor
          ? `linear-gradient(180deg, ${dominantColor}40 0%, var(--bg-primary) 60%)`
          : 'var(--bg-primary)',
        transition: 'background 0.8s ease',
        animation: 'fadeIn 0.3s ease',
        overflow: 'auto',
        padding: showLyrics ? 'var(--space-xl)' : 'var(--space-xl)',
      }}
    >
      {/* Close button */}
      <button
        onClick={toggleFullPlayer}
        aria-label="Close full player"
        style={{
          position: 'absolute',
          top: 'var(--space-lg)',
          left: 'var(--space-lg)',
          color: 'var(--text-secondary)',
          padding: 'var(--space-sm)',
          borderRadius: 'var(--radius-full)',
          transition: 'color var(--transition-fast)',
          zIndex: 10,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Toggle lyrics button */}
      <button
        onClick={() => setShowLyrics(!showLyrics)}
        aria-label={showLyrics ? 'Show artwork' : 'Show lyrics'}
        style={{
          position: 'absolute',
          top: 'var(--space-lg)',
          right: 'var(--space-lg)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: showLyrics ? 'var(--accent-primary)' : 'var(--bg-surface)',
          color: showLyrics ? 'white' : 'var(--text-secondary)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          border: '1px solid var(--border-subtle)',
          zIndex: 10,
          transition: 'all var(--transition-fast)',
        }}
      >
        {showLyrics ? 'Artwork' : 'Lyrics'}
      </button>

      {showLyrics ? (
        /* ---- LYRICS VIEW ---- */
        <div style={{
          width: '100%',
          maxWidth: 600,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 'var(--space-3xl)',
          paddingBottom: 'var(--space-3xl)',
        }}>
          <p style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-md)',
          }}>
            Lyrics
          </p>

          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 4,
            textAlign: 'center',
          }}>
            {currentTrack.title}
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2xl)',
            textAlign: 'center',
          }}>
            {currentTrack.artist}
          </p>

          {lyricsLoading ? (
            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '3px solid var(--border-medium)',
                borderTopColor: 'var(--accent-primary)',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto',
              }} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-md)' }}>
                Loading lyrics...
              </p>
            </div>
          ) : lyrics.length > 0 ? (
            <div
              ref={lyricsContainerRef}
              style={{
                width: '100%',
                maxHeight: '50vh',
                overflowY: 'auto',
                scrollBehavior: 'smooth',
                textAlign: 'center',
                padding: 'var(--space-lg) 0',
              }}
            >
              {lyrics.map((line, i) => (
                <p
                  key={i}
                  data-lyric-idx={i}
                  style={{
                    fontSize: i === activeLyricIndex ? '1.5rem' : '1rem',
                    fontWeight: i === activeLyricIndex ? 700 : 400,
                    color: i === activeLyricIndex ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    transition: 'all 0.3s ease',
                    marginBottom: 'var(--space-md)',
                    lineHeight: 1.5,
                    opacity: i === activeLyricIndex ? 1 : 0.5,
                    transform: i === activeLyricIndex ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {line.words}
                </p>
              ))}
            </div>
          ) : (
            <div style={{
              padding: 'var(--space-2xl)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>📝</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                No lyrics available for this track
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)' }}>
                Try listening to the track in Spotify for synced lyrics
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ---- ARTWORK VIEW ---- */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 600,
        }}>
          {/* NOW PLAYING label */}
          <p style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-xl)',
          }}>
            Now Playing
          </p>

          {/* Artwork */}
          <div style={{
            width: 'min(75vw, 360px)',
            height: 'min(75vw, 360px)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: dominantColor
              ? `0 20px 60px ${dominantColor}60, 0 0 100px ${dominantColor}20`
              : '0 20px 60px rgba(0,0,0,0.5)',
            transition: 'box-shadow 0.8s ease',
            marginBottom: 'var(--space-2xl)',
            animation: isPlaying ? 'artwork-pulse 3s ease-in-out infinite' : 'none',
          }}>
            <img
              src={currentTrack.artwork}
              alt={`${currentTrack.title} artwork`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Track info */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)', width: '100%' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {currentTrack.title}
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}>
              {currentTrack.artist}
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', maxWidth: 500, marginBottom: 'var(--space-sm)' }}>
            <div
              onClick={handleSeek}
              style={{
                height: 4,
                background: 'var(--bg-surface)',
                borderRadius: 2,
                cursor: 'pointer',
                position: 'relative',
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
                borderRadius: 2,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  right: -6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 0 8px rgba(168, 85, 247, 0.4)',
                }} />
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 'var(--space-xs)',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {formatTime(progress)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Main controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2xl)',
            marginBottom: 'var(--space-2xl)',
          }}>
            <button
              onClick={toggleShuffle}
              aria-label="Shuffle"
              style={{
                color: shuffle ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                padding: 'var(--space-sm)',
                transition: 'color var(--transition-fast)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            <button
              onClick={previous}
              aria-label="Previous"
              style={{ color: 'var(--text-primary)', padding: 'var(--space-sm)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                width: 64,
                height: 64,
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
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={next}
              aria-label="Next"
              style={{ color: 'var(--text-primary)', padding: 'var(--space-sm)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            <button
              onClick={cycleRepeat}
              aria-label="Repeat"
              style={{
                color: repeat !== 'off' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                padding: 'var(--space-sm)',
                transition: 'color var(--transition-fast)',
                position: 'relative',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              {repeat === 'one' && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 0,
                  fontSize: '0.5rem',
                  fontWeight: 700,
                }}>
                  1
                </span>
              )}
            </button>
          </div>

          {/* Like button */}
          <button
            onClick={() => {
              if (isLiked) removeFavorite(currentTrack.id);
              else addFavorite(currentTrack);
            }}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            style={{
              color: isLiked ? 'var(--accent-secondary)' : 'var(--text-tertiary)',
              padding: 'var(--space-sm)',
              transition: 'all var(--transition-fast)',
              transform: isLiked ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes artwork-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
