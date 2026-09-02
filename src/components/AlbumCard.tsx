import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Album } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { getAlbumTracks } from '../services/api';
import { Icon } from './HelaIcons';

interface AlbumCardProps {
  album: Album;
  size?: 'sm' | 'md' | 'lg';
}

export function AlbumCard({ album, size = 'md' }: AlbumCardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [imgOk, setImgOk] = useState(false);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const dims = { sm: 170, md: 200, lg: 240 };

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const tracks = await getAlbumTracks(album.id);
      if (tracks.length > 0) playTrack(tracks[0], tracks, 0);
    } catch {}
  };

  return (
    <div
      style={{ width: dims[size], cursor: 'pointer', flexShrink: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/album/${album.id}`)}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/album/${album.id}`); }}
      aria-label={`${album.title} by ${album.artist}`}
    >
      {/* Artwork */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1/1',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        marginBottom: 'var(--space-sm)',
        background: 'var(--bg-surface)',
      }}>
        <img src={album.artwork} alt="" loading="lazy"
          onLoad={() => setImgOk(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s var(--ease-smooth)',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            opacity: imgOk ? 1 : 0,
          }} />
        {/* Play overlay */}
        <button onClick={handlePlay} aria-label={`Play ${album.title}`}
          style={{
            position: 'absolute', bottom: 8, right: 8,
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'all 0.25s var(--ease-out)',
          }}>
          <Icon.Play size={16} style={{ color: '#fff', marginLeft: 1 }} />
        </button>
      </div>
      {/* Info */}
      <h3 style={{
        fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3,
        fontFamily: 'var(--font)',
      }}>{album.title}</h3>
      <p style={{
        fontSize: '0.6875rem', color: 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: 'var(--font)',
      }}>{album.artist}</p>
    </div>
  );
}
