import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  size?: 'sm' | 'md' | 'lg';
}

export function ArtistCard({ artist, size = 'md' }: ArtistCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const dimensions = { sm: 140, md: 180, lg: 220 };

  return (
    <div
      style={{
        width: dimensions[size],
        cursor: 'pointer',
        textAlign: 'center',
        flexShrink: 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/artist/${artist.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/artist/${artist.id}`); }}
      aria-label={`Go to ${artist.name}'s page`}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        overflow: 'hidden',
        marginBottom: 'var(--space-sm)',
        boxShadow: isHovered
          ? '0 0 30px rgba(168, 85, 247, 0.2)'
          : '0 4px 20px rgba(0, 0, 0, 0.3)',
        transition: 'box-shadow 0.3s ease',
      }}>
        {!imgLoaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-surface)',
            borderRadius: '50%',
          }} />
        )}
        <img
          src={artist.artwork}
          alt={`${artist.name} photo`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            opacity: imgLoaded ? 1 : 0,
          }}
        />
      </div>
      <h3 style={{
        fontSize: size === 'sm' ? '0.875rem' : '0.9375rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {artist.name}
      </h3>
      <p style={{
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginTop: 2,
      }}>
        Artist
      </p>
    </div>
  );
}
