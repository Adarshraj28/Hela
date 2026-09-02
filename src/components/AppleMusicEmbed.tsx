import { useState } from 'react';
import type { Track } from '../types';

/**
 * Apple Music Embed Player
 * Uses the official Apple Music embed — plays FULL songs.
 * iTunes and Apple Music share the same ID system.
 * This is the music equivalent of vidking/2embed for movies.
 *
 * Usage:
 *   <AppleMusicEmbed track={currentTrack} />
 */
interface AppleMusicEmbedProps {
  track: Track;
  height?: number;
}

export function AppleMusicEmbed({ track, height = 450 }: AppleMusicEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  const embedUrl = track.appleMusicEmbedUrl;
  if (!embedUrl) return null;

  return (
    <div style={{
      width: '100%',
      maxWidth: 460,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--bg-surface)',
      position: 'relative',
    }}>
      {!loaded && (
        <div style={{
          width: '100%',
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
          background: 'var(--bg-surface)',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid var(--border-medium)',
            borderTopColor: '#fc3c44',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font)' }}>
            Loading player...
          </p>
        </div>
      )}
      <iframe
        src={embedUrl}
        height={height}
        frameBorder="0"
        allow="autoplay *; fullscreen *; clipboard-write"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          border: 'none',
          width: '100%',
          display: loaded ? 'block' : 'none',
          borderRadius: 'var(--radius-lg)',
        }}
        title={`Play ${track.title} on Apple Music`}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
