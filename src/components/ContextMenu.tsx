import { useEffect, useRef } from 'react';
import type { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';

interface ContextMenuProps {
  track: Track;
  tracks?: Track[];
  position: { x: number; y: number };
  onClose: () => void;
  onAddToPlaylist?: () => void;
}

export function ContextMenu({ track, tracks, position, onClose, onAddToPlaylist }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { playTrack, queue } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();
  const { playlists, addTrackToPlaylist } = usePlaylistStore();

  const isLiked = isFavorite(track.id);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('mousedown', h); document.removeEventListener('keydown', k); };
  }, [onClose]);

  // Adjust position to stay on screen
  const adjustPos = () => {
    const w = 220;
    const h = playlists.length > 0 ? 320 : 240;
    let x = position.x;
    let y = position.y;
    if (x + w > window.innerWidth) x = window.innerWidth - w - 8;
    if (y + h > window.innerHeight) y = window.innerHeight - h - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    return { left: x, top: y };
  };

  const pos = adjustPos();

  const items: { icon: React.ReactNode; label: string; action: () => void; danger?: boolean }[] = [
    {
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
      label: 'Play',
      action: () => { if (tracks) playTrack(track, tracks, tracks.indexOf(track)); else playTrack(track); onClose(); },
    },
    {
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>,
      label: 'Play next',
      action: () => {
        const idx = usePlayerStore.getState().queueIndex;
        const q = [...usePlayerStore.getState().queue];
        q.splice(idx + 1, 0, track);
        usePlayerStore.setState({ queue: q });
        onClose();
      },
    },
    {
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
      label: 'Add to queue',
      action: () => { usePlayerStore.setState((s) => ({ queue: [...s.queue, track] })); onClose(); },
    },
    {
      icon: isLiked ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
      label: isLiked ? 'Unlike' : 'Like',
      action: () => { if (isLiked) removeFavorite(track.id); else addFavorite(track); onClose(); },
    },
  ];

  // Add to playlist submenu items
  if (playlists.length > 0) {
    items.push({
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
      label: 'Add to playlist',
      action: () => { if (onAddToPlaylist) { onAddToPlaylist(); onClose(); } },
    });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 'var(--z-dropdown)',
    }} onClick={onClose}>
      <div ref={menuRef} onClick={(e) => e.stopPropagation()} style={{
        position: 'fixed', ...pos,
        width: 220,
        background: 'var(--bg-glass-solid)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xs)',
        boxShadow: 'var(--shadow-xl)',
        animation: 'scaleIn 0.15s var(--ease-out)',
      }}>
        {/* Track header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          padding: 'var(--space-sm) var(--space-sm)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 'var(--space-xs)',
        }}>
          <img src={track.artwork} alt="" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</p>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.artist}</p>
          </div>
        </div>

        {/* Actions */}
        {items.map((item, i) => (
          <button key={i} onClick={item.action} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem', color: item.danger ? 'var(--accent-red)' : 'var(--text-primary)',
            transition: 'background var(--t-fast)', textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ color: 'var(--text-tertiary)', width: 16, display: 'flex', justifyContent: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
