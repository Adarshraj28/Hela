import { useState } from 'react';
import type { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatTime } from '../utils/formatTime';
import { ContextMenu } from './ContextMenu';
import { AddToPlaylistModal } from './AddToPlaylistModal';

interface SongRowProps {
  track: Track;
  tracks?: Track[];
  index?: number;
  showArtwork?: boolean;
  showAlbum?: boolean;
  showIndex?: boolean;
  showDuration?: boolean;
}

export function SongRow({
  track, tracks, index = 0,
  showArtwork = true, showAlbum = false, showIndex = false, showDuration = true,
}: SongRowProps) {
  const [hovered, setHovered] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [imgOk, setImgOk] = useState(false);
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();
  const { isFavorite, addFavorite, removeFavorite } = useLibraryStore();

  const isCurrent = currentTrack?.id === track.id;
  const isNowPlaying = isCurrent && isPlaying;
  const isLiked = isFavorite(track.id);

  const play = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tracks) playTrack(track, tracks, index);
    else playTrack(track);
  };

  const handleCtx = (e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        onClick={play}
        onContextMenu={handleCtx}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') play(e as unknown as React.MouseEvent); }}
        aria-label={`Play ${track.title} by ${track.artist}`}
        style={{
          display: 'flex', alignItems: 'center',
          gap: showArtwork ? 'var(--space-md)' : 'var(--space-sm)',
          padding: '7px var(--space-sm)',
          borderRadius: 'var(--radius-sm)',
          background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
          cursor: 'pointer',
          transition: 'background var(--t-fast)',
          minHeight: 48,
        }}
      >
        {/* Index / Eq */}
        {showIndex && (
          <div style={{
            width: 26, textAlign: 'center', fontSize: '0.8125rem',
            color: isNowPlaying ? 'var(--accent)' : 'var(--text-tertiary)',
            fontWeight: isNowPlaying ? 600 : 400, fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}>
            {hovered ? (
              <button onClick={play} style={{ color: 'var(--text-primary)', padding: 0, display: 'flex', justifyContent: 'center', width: '100%' }} aria-label="Play">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </button>
            ) : isNowPlaying ? (
              <span style={{ display: 'inline-flex', gap: 1.5, alignItems: 'flex-end', height: 14 }}>
                <span style={{ width: 2.5, background: 'var(--accent)', borderRadius: 1, animation: 'eq-1 0.5s infinite alternate', height: '35%' }} />
                <span style={{ width: 2.5, background: 'var(--accent)', borderRadius: 1, animation: 'eq-2 0.5s 0.15s infinite alternate', height: '80%' }} />
                <span style={{ width: 2.5, background: 'var(--accent)', borderRadius: 1, animation: 'eq-3 0.5s 0.3s infinite alternate', height: '45%' }} />
              </span>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        )}

        {/* Artwork */}
        {showArtwork && (
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            overflow: 'hidden', flexShrink: 0, background: 'var(--bg-surface)',
          }}>
            <img src={track.artwork} alt="" loading="lazy"
              onLoad={() => setImgOk(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: imgOk ? 1 : 0, transition: 'opacity 0.2s' }} />
          </div>
        )}

        {/* Title + Artist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.875rem', fontWeight: isCurrent ? 600 : 500,
            color: isNowPlaying ? 'var(--accent)' : 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3,
          }}>{track.title}</p>
          <p style={{
            fontSize: '0.75rem', color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, marginTop: 1,
          }}>{track.artist}</p>
        </div>

        {/* Album */}
        {showAlbum && track.album && (
          <p className="album-col" style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140, flexShrink: 0,
          }}>{track.album}</p>
        )}

        {/* Like */}
        <button
          onClick={(e) => { e.stopPropagation(); if (isLiked) removeFavorite(track.id); else addFavorite(track); }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
            color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)',
            opacity: hovered || isLiked ? 1 : 0,
            transition: 'all var(--t-fast)',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Duration */}
        {showDuration && track.duration ? (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', minWidth: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
            {formatTime(track.duration)}
          </span>
        ) : null}

        {/* More button */}
        <button
          onClick={(e) => { e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
          aria-label="More options"
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', color: 'var(--text-tertiary)',
            opacity: hovered ? 1 : 0, transition: 'opacity var(--t-fast)', flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Context Menu */}
      {ctxMenu && (
        <ContextMenu
          track={track}
          tracks={tracks}
          position={ctxMenu}
          onClose={() => setCtxMenu(null)}
          onAddToPlaylist={() => setShowPlaylistModal(true)}
        />
      )}

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <AddToPlaylistModal track={track} onClose={() => setShowPlaylistModal(false)} />
      )}
    </>
  );
}
