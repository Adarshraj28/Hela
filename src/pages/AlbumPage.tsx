import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Album, Track } from '../types';
import { musicApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useDominantColor } from '../hooks/useDominantColor';
import { formatDuration } from '../utils/formatTime';
import { SongRow } from '../components/SongRow';
import { SongRowSkeleton } from '../components/Skeleton';

export function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack, playQueue } = usePlayerStore();
  const { isFavoriteAlbum, addFavoriteAlbum, removeFavoriteAlbum } = useLibraryStore();
  const dominantColor = useDominantColor(album?.artwork);

  useEffect(() => {
    if (!id) return;
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const [albumData, tracksData] = await Promise.all([
          musicApi.getAlbum(id),
          musicApi.getAlbumTracks(id),
        ]);
        setAlbum(albumData);
        setTracks(tracksData);
      } catch (err) {
        setError('Failed to load album. Please try again.');
        console.error('Album page error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (tracks.length > 0) {
      playQueue(tracks, 0);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playQueue(shuffled, 0);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-xl) 0' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)' }}>
          <div style={{
            width: 232,
            height: 232,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface)',
            animation: 'shimmer 1.5s infinite',
            backgroundSize: '200% 100%',
          }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
            <div style={{ width: 60, height: 14, background: 'var(--bg-surface)', borderRadius: 4, animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
            <div style={{ width: '70%', height: 32, background: 'var(--bg-surface)', borderRadius: 4, animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
            <div style={{ width: '50%', height: 16, background: 'var(--bg-surface)', borderRadius: 4, animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%' }} />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => <SongRowSkeleton key={i} />)}
      </div>
    );
  }

  if (error || !album) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3xl)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>💿</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>
          {error || 'Album not found'}
        </h2>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent)',
            color: 'white',
            fontWeight: 600,
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isLiked = isFavoriteAlbum(album.id);

  return (
    <div style={{ paddingBottom: 'var(--space-2xl)' }}>
      {/* Header gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 400,
        background: dominantColor
          ? `linear-gradient(180deg, ${dominantColor}60 0%, transparent 100%)`
          : 'none',
        pointerEvents: 'none',
        transition: 'background 0.8s ease',
      }} />

      {/* Album header */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2xl)',
        alignItems: 'flex-end',
        padding: 'var(--space-2xl) 0',
        position: 'relative',
      }}>
        <div style={{
          width: 232,
          height: 232,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          flexShrink: 0,
        }}>
          <img
            src={album.artwork}
            alt={`${album.title} cover`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-sm)',
          }}>
            Album
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 'var(--space-md)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {album.title}
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => album.artistId && navigate(`/artist/${album.artistId}`)}
              style={{ fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {album.artist}
            </button>
            <span>·</span>
            {album.releaseDate && <span>{new Date(album.releaseDate).getFullYear()}</span>}
            <span>·</span>
            <span>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</span>
            {album.releaseDate && (
              <>
                <span>·</span>
                <span>{formatDuration(tracks.reduce((sum, t) => sum + (t.duration || 0), 0))}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handlePlayAlbum}
          aria-label="Play album"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)',
            transition: 'transform var(--t-fast)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <button
          onClick={handleShufflePlay}
          aria-label="Shuffle play"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'all var(--t-fast)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        </button>

        <button
          onClick={() => {
            if (isLiked) removeFavoriteAlbum(album.id);
            else addFavoriteAlbum(album);
          }}
          aria-label={isLiked ? 'Remove from library' : 'Add to library'}
          style={{
            color: isLiked ? 'var(--accent-pink)' : 'var(--text-tertiary)',
            padding: 'var(--space-sm)',
            transition: 'color var(--t-fast)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Tracklist */}
      <div>
        {/* Tracklist header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          padding: '0 var(--space-sm) var(--space-sm)',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 'var(--space-sm)',
        }}>
          <span style={{ width: 28, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>#</span>
          <span style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</span>
        </div>

        {tracks.map((track, i) => (
          <SongRow
            key={track.id}
            track={track}
            tracks={tracks}
            index={i}
            showIndex
            showArtwork={false}
            showAlbum={false}
          />
        ))}
      </div>
    </div>
  );
}
