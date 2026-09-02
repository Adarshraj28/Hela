import { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types';
import { formatTime } from '../utils/formatTime';

interface QueuePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QueuePanel({ isOpen, onClose }: QueuePanelProps) {
  const {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    removeFromQueue,
    clearQueue,
    playTrack,
  } = usePlayerStore();

  if (!isOpen) return null;

  const upcomingTracks = queue.slice(queueIndex + 1);
  const playedTracks = queue.slice(0, queueIndex);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 'var(--z-modal)',
        }}
      />

      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(400px, 90vw)',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
        zIndex: 'var(--z-modal)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'queue-slide-in 0.3s ease',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-lg)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            Queue
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button
              onClick={clearQueue}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
              }}
            >
              Clear
            </button>
            <button
              onClick={onClose}
              aria-label="Close queue"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-md)' }}>
          {currentTrack && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <p style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-sm)',
                padding: '0 var(--space-sm)',
              }}>
                Now Playing
              </p>
              <QueueItem track={currentTrack} isPlaying={isPlaying} isCurrent />
            </div>
          )}

          {upcomingTracks.length > 0 && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <p style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-sm)',
                padding: '0 var(--space-sm)',
              }}>
                Up Next · {upcomingTracks.length} {upcomingTracks.length === 1 ? 'track' : 'tracks'}
              </p>
              {upcomingTracks.map((track, i) => (
                <QueueItem
                  key={`${track.id}-${i}`}
                  track={track}
                  index={queueIndex + 1 + i}
                  onRemove={() => removeFromQueue(queueIndex + 1 + i)}
                  onPlay={() => playTrack(track, queue, queueIndex + 1 + i)}
                />
              ))}
            </div>
          )}

          {playedTracks.length > 0 && (
            <div>
              <p style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-sm)',
                padding: '0 var(--space-sm)',
              }}>
                Previously Played
              </p>
              {playedTracks.map((track, i) => (
                <QueueItem
                  key={`prev-${track.id}-${i}`}
                  track={track}
                  index={i}
                  onPlay={() => playTrack(track, queue, i)}
                  dimmed
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes queue-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

function QueueItem({
  track,
  isCurrent,
  onRemove,
  onPlay,
  dimmed,
}: {
  track: Track;
  isPlaying?: boolean;
  isCurrent?: boolean;
  index?: number;
  onRemove?: () => void;
  onPlay?: () => void;
  dimmed?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onPlay}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: '6px var(--space-sm)',
        borderRadius: 'var(--radius-sm)',
        background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        opacity: dimmed ? 0.5 : 1,
        cursor: 'pointer',
        transition: 'background var(--t-fast)',
      }}
    >
      <img
        src={track.artwork}
        alt=""
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-sm)',
          objectFit: 'cover',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.8125rem',
          fontWeight: isCurrent ? 600 : 500,
          color: isCurrent ? 'var(--accent)' : 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {track.title}
        </p>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {track.artist}
        </p>
      </div>
      {track.duration && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {formatTime(track.duration)}
        </span>
      )}
      {onRemove && hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove from queue"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-tertiary)',
            flexShrink: 0,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
