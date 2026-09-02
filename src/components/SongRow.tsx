import { useState } from 'react';
import type { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatTime } from '../utils/formatTime';

interface SongRowProps {
  track: Track;
  tracks?: Track[];
  index?: number;
  showArtwork?: boolean;
  showAlbum?: boolean;
  showIndex?: boolean;
  showDuration?: boolean;
  compact?: boolean;
}

export function SongRow({
  track,
  tracks,
  index = 0,
  showArtwork = true,
  showAlbum = false,
  showIndex = false,
  showDuration = true,
  compact = false,
}: SongRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;
  const isLiked = isFavorite(track.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tracks) {
      playTrack(track, tracks, index);
    } else {
      playTrack(track);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      removeFavorite(track.id);
    } else {
      addFavorite(track);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 'var(--space-sm)' : 'var(--space-md)',
        padding: compact ? '6px var(--space-sm)' : '8px var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        background: isHovered ? 'var(--bg-glass-hover)' : 'transparent',
        transition: 'background var(--transition-fast)',
        cursor: 'pointer',
        minHeight: compact ? 44 : 56,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handlePlay(e as unknown as React.MouseEvent); }}
      aria-label={`Play ${track.title} by ${track.artist}`}
    >
      {/* Index / Play indicator */}
      {showIndex && (
        <div style={{
          width: 28,
          textAlign: 'center',
          fontSize: '0.875rem',
          color: isCurrentlyPlaying ? 'var(--accent-primary)' : 'var(--text-tertiary)',
          fontWeight: isCurrentlyPlaying ? 600 : 400,
        }}>
          {isHovered ? (
            <button onClick={handlePlay} style={{ color: 'var(--text-primary)', padding: 0 }} aria-label="Play">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : (
            <span>{isCurrentlyPlaying ? (
              <span style={{ display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
                <span style={{
                  width: 3, background: 'var(--accent-primary)', borderRadius: 2,
                  animation: 'eq-bar 0.6s infinite alternate', height: '60%',
                }} />
                <span style={{
                  width: 3, background: 'var(--accent-primary)', borderRadius: 2,
                  animation: 'eq-bar 0.6s 0.2s infinite alternate', height: '100%',
                }} />
                <span style={{
                  width: 3, background: 'var(--accent-primary)', borderRadius: 2,
                  animation: 'eq-bar 0.6s 0.4s infinite alternate', height: '40%',
                }} />
              </span>
            ) : (index + 1)}
            </span>
          )}
        </div>
      )}

      {/* Artwork */}
      {showArtwork && (
        <div style={{
          width: compact ? 40 : 44,
          height: compact ? 40 : 44,
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
        }}>
          {!imgLoaded && (
            <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-surface)' }} />
          )}
          <img
            src={track.artwork}
            alt={`${track.title} artwork`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          />
        </div>
      )}

      {/* Title and Artist */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <p style={{
          fontSize: compact ? '0.8125rem' : '0.9375rem',
          fontWeight: isCurrentTrack ? 600 : 500,
          color: isCurrentlyPlaying ? 'var(--accent-primary)' : 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'color var(--transition-fast)',
        }}>
          {track.title}
        </p>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          marginTop: 1,
        }}>
          {track.artist}
        </p>
      </div>

      {/* Album */}
      {showAlbum && track.album && (
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 160,
          display: 'none',
        }} className="album-col">
          {track.album}
        </p>
      )}

      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        aria-label={isLiked ? `Unlike ${track.title}` : `Like ${track.title}`}
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: isLiked ? 'var(--accent-secondary)' : 'var(--text-tertiary)',
          opacity: isHovered || isLiked ? 1 : 0,
          transition: 'all var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Duration */}
      {showDuration && track.duration && (
        <span style={{
          fontSize: '0.8125rem',
          color: 'var(--text-tertiary)',
          minWidth: 40,
          textAlign: 'right',
          flexShrink: 0,
        }}>
          {formatTime(track.duration)}
        </span>
      )}
    </div>
  );
}
