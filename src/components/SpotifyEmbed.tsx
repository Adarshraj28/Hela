import { useState } from 'react';

interface SpotifyEmbedProps {
  trackId: string;
  width?: number;
  height?: number;
}

/**
 * Spotify Embed Player
 * Uses the official Spotify iframe embed for full-track playback.
 * Track ID should be a valid Spotify track ID.
 *
 * Usage:
 *   <SpotifyEmbed trackId="4snRyiaLyvTMui0hzp8MF7" />
 */
export function SpotifyEmbed({ trackId, width = 300, height = 380 }: SpotifyEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;

  return (
    <div style={{
      width: '100%',
      maxWidth: width,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--bg-surface)',
      position: 'relative',
    }}>
      {!loaded && (
        <div style={{
          width: '100%',
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '3px solid var(--border-medium)',
            borderTopColor: '#1DB954',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}
      <iframe
        src={embedUrl}
        width={width}
        height={height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          border: 'none',
          width: '100%',
          display: loaded ? 'block' : 'none',
          borderRadius: 'var(--radius-lg)',
        }}
        title="Spotify Player"
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
