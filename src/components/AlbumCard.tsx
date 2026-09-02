import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Album } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { getAlbumTracks } from '../services/api';

interface AlbumCardProps {
  album: Album;
  size?: 'sm' | 'md' | 'lg';
}

export function AlbumCard({ album, size = 'md' }: AlbumCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const dimensions = { sm: 160, md: 200, lg: 240 };

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const tracks = await getAlbumTracks(album.id);
      if (tracks.length > 0) {
        playTrack(tracks[0], tracks, 0);
      }
    } catch {
      // Album might not have tracks available
    }
  };

  return (
    <div
      style={{
        width: dimensions[size],
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/album/${album.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/album/${album.id}`); }}
      aria-label={`${album.title} by ${album.artist}`}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: 'var(--space-sm)',
      }}>
        {!imgLoaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
          }} />
        )}
        <img
          src={album.artwork}
          alt={`${album.title} cover`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            opacity: imgLoaded ? 1 : 0,
          }}
        />

        {/* Play button */}
        <button
          onClick={handlePlay}
          aria-label={`Play ${album.title}`}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      <h3 style={{
        fontSize: size === 'sm' ? '0.875rem' : '0.9375rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: 2,
      }}>
        {album.title}
      </h3>
      <p style={{
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {album.artist}
      </p>
    </div>
  );
}
