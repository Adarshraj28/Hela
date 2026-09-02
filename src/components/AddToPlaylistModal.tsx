import { useState } from 'react';
import type { Track } from '../types';
import { usePlaylistStore } from '../store/playlistStore';
import { PlaylistArt } from './MusicIllustrations';

interface AddToPlaylistModalProps {
  track: Track;
  onClose: () => void;
}

export function AddToPlaylistModal({ track, onClose }: AddToPlaylistModalProps) {
  const { playlists, addTrackToPlaylist, createPlaylist } = usePlaylistStore();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const handleAddToExisting = (playlistId: string) => {
    addTrackToPlaylist(playlistId, track);
    onClose();
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    const playlist = createPlaylist(newPlaylistName.trim());
    addTrackToPlaylist(playlist.id, track);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
        animation: 'modalFadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          padding: 'var(--space-xl)',
          width: '90%',
          maxWidth: 400,
          maxHeight: '70vh',
          overflow: 'auto',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-sm)',
        }}>
          Add to Playlist
        </h3>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-lg)',
        }}>
          Adding "{track.title}" by {track.artist}
        </p>

        {/* Existing playlists */}
        {playlists.length > 0 && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            {playlists.map((playlist) => {
              const alreadyAdded = playlist.tracks.some((t) => t.id === track.id);
              return (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToExisting(playlist.id)}
                  disabled={alreadyAdded}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    width: '100%',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    background: alreadyAdded ? 'transparent' : 'var(--bg-surface)',
                    marginBottom: 'var(--space-xs)',
                    opacity: alreadyAdded ? 0.5 : 1,
                    cursor: alreadyAdded ? 'default' : 'pointer',
                    transition: 'background var(--t-fast)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <PlaylistArt name={playlist.name} size={40} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {playlist.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                      {alreadyAdded && ' · Already added'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Create new playlist */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              width: '100%',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-medium)',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              justifyContent: 'center',
              transition: 'all var(--t-fast)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New Playlist
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              autoFocus
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAndAdd(); }}
              placeholder="Playlist name..."
              style={{
                flex: 1,
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={!newPlaylistName.trim()}
              style={{
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: newPlaylistName.trim() ? 'var(--accent)' : 'var(--bg-surface)',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                opacity: newPlaylistName.trim() ? 1 : 0.5,
              }}
            >
              Create
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            marginTop: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            transition: 'color var(--t-fast)',
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
