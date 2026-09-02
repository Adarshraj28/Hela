import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  size?: 'sm' | 'md' | 'lg';
}

export function ArtistCard({ artist, size = 'md' }: ArtistCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [imgOk, setImgOk] = useState(false);

  const dims = { sm: 150, md: 180, lg: 220 };

  return (
    <div
      style={{ width: dims[size], cursor: 'pointer', textAlign: 'center', flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/artist/${artist.id}`)}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/artist/${artist.id}`); }}
      aria-label={`Go to ${artist.name}'s page`}
    >
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1/1',
        borderRadius: '50%', overflow: 'hidden',
        marginBottom: 'var(--space-sm)',
        background: 'var(--bg-surface)',
        boxShadow: hovered
          ? '0 0 24px rgba(139,92,246,0.15)'
          : '0 4px 16px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.3s ease',
      }}>
        <img src={artist.artwork} alt="" loading="lazy"
          onLoad={() => setImgOk(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s var(--ease-smooth)',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            opacity: imgOk ? 1 : 0,
          }} />
      </div>
      <h3 style={{
        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: 'var(--font)',
      }}>{artist.name}</h3>
      <p style={{
        fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: 2,
        fontFamily: 'var(--font)',
      }}>Artist</p>
    </div>
  );
}
