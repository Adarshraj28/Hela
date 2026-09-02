import { useState } from 'react';
import type { Track } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { formatTime } from '../utils/formatTime';
import { ContextMenu } from './ContextMenu';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import { Icon } from './HelaIcons';

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

  return (
    <>
      <div
        onClick={play}
        onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') play(e as unknown as React.MouseEvent); }}
        aria-label={`Play ${track.title} by ${track.artist}`}
        style={{
          display: 'flex', alignItems: 'center',
          gap: showArtwork ? 'var(--space-sm)' : 'var(--space-sm)',
          padding: '8px 10px', borderRadius: 'var(--radius-sm)',
          background: isNowPlaying ? 'rgba(139,92,246,0.06)' : hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
          cursor: 'pointer', transition: 'background var(--t-fast)', minHeight: 50,
        }}
      >
        {/* Index / Eq */}
        {showIndex && (
          <div style={{
            width: 28, textAlign: 'center', fontSize: '0.75rem',
            color: isNowPlaying ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: isNowPlaying ? 600 : 400, fontVariantNumeric: 'tabular-nums',
            flexShrink: 0, fontFamily: 'var(--font)',
          }}>
            {hovered ? (
              <button onClick={play} style={{ color: 'var(--text-primary)', padding: 0, display: 'flex', justifyContent: 'center', width: '100%' }} aria-label="Play">
                <Icon.Play size={14} />
              </button>
            ) : isNowPlaying ? (
              <span style={{ display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
                <span style={{ width: 2.5, background: 'var(--accent)', borderRadius: 1, animation: 'eq-1 0.5s infinite alternate', height: '30%' }} />
                <span style={{ width: 2.5, background: 'var(--accent)', borderRadius: 1, animation: 'eq-2 0.5s 0.15s infinite alternate', height: '75%' }} />
                <span style={{ width: 2.5, background: 'var(--accent)', borderRadius: 1, animation: 'eq-3 0.5s 0.3s infinite alternate', height: '40%' }} />
              </span>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        )}

        {/* Artwork */}
        {showArtwork && (
          <div style={{
            width: 50, height: 50, borderRadius: 'var(--radius-sm)',
            overflow: 'hidden', flexShrink: 0, background: 'var(--bg-surface)',
            boxShadow: isNowPlaying ? '0 0 12px rgba(139,92,246,0.3)' : 'none',
            transition: 'box-shadow 0.3s',
          }}>
            <img src={track.artwork} alt="" loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Title + Artist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.9375rem', fontWeight: isCurrent ? 600 : 500,
            color: isNowPlaying ? 'var(--accent)' : 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3,
            fontFamily: 'var(--font)',
          }}>{track.title}</p>
          <p style={{
            fontSize: '0.8125rem', color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, marginTop: 2,
            fontFamily: 'var(--font)',
          }}>{track.artist}</p>
        </div>

        {/* Album */}
        {showAlbum && track.album && (
          <p className="album-col" style={{
            fontSize: '0.6875rem', color: 'var(--text-tertiary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130, flexShrink: 0,
            fontFamily: 'var(--font)',
          }}>{track.album}</p>
        )}

        {/* Like */}
        <button
          onClick={(e) => { e.stopPropagation(); if (isLiked) removeFavorite(track.id); else addFavorite(track); }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)',
            opacity: hovered || isLiked ? 1 : 0, transition: 'all var(--t-fast)', flexShrink: 0,
          }}>
          <Icon.Heart size={14} filled={isLiked} />
        </button>

        {/* Duration */}
        {showDuration && track.duration ? (
          <span style={{
            fontSize: '0.6875rem', color: 'var(--text-muted)', minWidth: 34, textAlign: 'right',
            fontVariantNumeric: 'tabular-nums', flexShrink: 0, fontFamily: 'var(--font)',
          }}>{formatTime(track.duration)}</span>
        ) : null}

        {/* More */}
        <button
          onClick={(e) => { e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
          aria-label="More options"
          style={{
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', opacity: hovered ? 1 : 0, transition: 'opacity var(--t-fast)', flexShrink: 0,
          }}>
          <Icon.More size={14} />
        </button>
      </div>

      {ctxMenu && <ContextMenu track={track} tracks={tracks} position={ctxMenu} onClose={() => setCtxMenu(null)} onAddToPlaylist={() => setShowPlaylistModal(true)} />}
      {showPlaylistModal && <AddToPlaylistModal track={track} onClose={() => setShowPlaylistModal(false)} />}
    </>
  );
}
