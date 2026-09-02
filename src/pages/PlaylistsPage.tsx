import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylistStore } from '../store/playlistStore';
import { usePlayerStore } from '../store/playerStore';
import { SectionHeader } from '../components/SectionHeader';
import { SongRow } from '../components/SongRow';
import { EmptyState } from '../components/EmptyState';

export function PlaylistsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist, removeTrackFromPlaylist } = usePlaylistStore();
  const { playQueue } = usePlayerStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // If an ID is provided, show the playlist detail
  if (id) {
    const playlist = playlists.find((p) => p.id === id);
    if (!playlist) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'var(--space-3xl)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>🎵</p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
            Playlist not found
          </h2>
          <button
            onClick={() => navigate('/playlists')}
            style={{
              padding: 'var(--space-sm) var(--space-lg)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-primary)',
              color: 'white',
              fontWeight: 600,
            }}
          >
            View Playlists
          </button>
        </div>
      );
    }

    return (
      <div style={{ paddingBottom: 'var(--space-2xl)' }}>
        {/* Playlist header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-xl)',
          padding: 'var(--space-2xl) 0',
        }}>
          <div style={{
            width: 200,
            height: 200,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            flexShrink: 0,
            boxShadow: '0 8px 40px rgba(168, 85, 247, 0.3)',
          }}>
            🎵
          </div>
          <div>
            <p style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: 4,
            }}>
              Playlist
            </p>
            {renaming === playlist.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && renameValue.trim()) {
                    renamePlaylist(playlist.id, renameValue.trim());
                    setRenaming(null);
                  }
                  if (e.key === 'Escape') setRenaming(null);
                }}
                onBlur={() => {
                  if (renameValue.trim()) renamePlaylist(playlist.id, renameValue.trim());
                  setRenaming(null);
                }}
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 8px',
                  width: '100%',
                }}
              />
            ) : (
              <h1
                onDoubleClick={() => {
                  setRenaming(playlist.id);
                  setRenameValue(playlist.name);
                }}
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  cursor: 'pointer',
                }}
                title="Double-click to rename"
              >
                {playlist.name}
              </h1>
            )}
            {playlist.description && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {playlist.description}
              </p>
            )}
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}>
          {playlist.tracks.length > 0 && (
            <button
              onClick={() => playQueue(playlist.tracks, 0)}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)',
              }}
              aria-label="Play playlist"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => {
              if (confirm('Delete this playlist?')) {
                deletePlaylist(playlist.id);
                navigate('/playlists');
              }
            }}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-medium)',
              color: '#ef4444',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            Delete
          </button>
        </div>

        {/* Tracks */}
        {playlist.tracks.length === 0 ? (
          <EmptyState
            icon="🎵"
            title="This playlist is empty"
            description="Search for songs and add them to this playlist."
            action={
              <button
                onClick={() => navigate('/search')}
                style={{
                  padding: 'var(--space-sm) var(--space-lg)',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                Find Songs
              </button>
            }
          />
        ) : (
          <div>
            {playlist.tracks.map((track, i) => (
              <div key={`${track.id}-${i}`} style={{ position: 'relative' }}>
                <SongRow
                  track={track}
                  tracks={playlist.tracks}
                  index={i}
                  showIndex
                  showAlbum
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrackFromPlaylist(playlist.id, track.id);
                  }}
                  aria-label={`Remove ${track.title} from playlist`}
                  style={{
                    position: 'absolute',
                    right: 50,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-tertiary)',
                    opacity: 0.5,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Playlist list view
  return (
    <div style={{ paddingBottom: 'var(--space-2xl)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-xl) 0',
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
        }}>
          Your Playlists
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Playlist
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-xl)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
        }}>
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newName.trim()) {
                const playlist = createPlaylist(newName.trim());
                setNewName('');
                setShowCreate(false);
                navigate(`/playlists/${playlist.id}`);
              }
              if (e.key === 'Escape') setShowCreate(false);
            }}
            placeholder="Playlist name..."
            style={{
              flex: 1,
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
            }}
          />
          <button
            onClick={() => {
              if (newName.trim()) {
                const playlist = createPlaylist(newName.trim());
                setNewName('');
                setShowCreate(false);
                navigate(`/playlists/${playlist.id}`);
              }
            }}
            disabled={!newName.trim()}
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              borderRadius: 'var(--radius-md)',
              background: newName.trim() ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              opacity: newName.trim() ? 1 : 0.5,
            }}
          >
            Create
          </button>
        </div>
      )}

      {/* Playlist grid */}
      {playlists.length === 0 ? (
        <EmptyState
          icon="🎵"
          title="No playlists yet"
          description="Create your first playlist to organize your music."
          action={
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Create Playlist
            </button>
          }
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'var(--space-lg)',
        }}>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => navigate(`/playlists/${playlist.id}`)}
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: 'var(--space-md)',
                boxShadow: '0 4px 16px rgba(168, 85, 247, 0.2)',
              }}>
                🎵
              </div>
              <h3 style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: 2,
              }}>
                {playlist.name}
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}>
                {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
