import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Artist, Track, Album } from '../types';
import { musicApi } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useDominantColor } from '../hooks/useDominantColor';
import { formatNumber } from '../utils/formatTime';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { SectionHeader } from '../components/SectionHeader';
import { SongRowSkeleton, GridSkeleton } from '../components/Skeleton';

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playQueue } = usePlayerStore();
  const { isFavoriteArtist, addFavoriteArtist, removeFavoriteArtist } = useLibraryStore();
  const dominantColor = useDominantColor(artist?.artwork);

  useEffect(() => {
    if (!id) return;
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const [artistData, tracksData, albumsData] = await Promise.all([
          musicApi.getArtist(id),
          musicApi.getArtistTopTracks(id),
          musicApi.getArtistAlbums(id),
        ]);
        setArtist(artistData);
        setTopTracks(tracksData);
        setAlbums(albumsData);
      } catch (err) {
        setError('Failed to load artist. Please try again.');
        console.error('Artist page error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [id]);

  const handlePlayAll = () => {
    if (topTracks.length > 0) {
      playQueue(topTracks, 0);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingBottom: 'var(--space-2xl)' }}>
        <div style={{
          height: 320,
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          marginBottom: 'var(--space-2xl)',
          animation: 'skeleton-shimmer 1.5s infinite',
          backgroundSize: '200% 100%',
        }} />
        <SongRowSkeleton />
        <SongRowSkeleton />
        <SongRowSkeleton />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <GridSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3xl)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>🎤</p>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-sm)' }}>
          {error || 'Artist not found'}
        </h2>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-primary)',
            color: 'white',
            fontWeight: 600,
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isLiked = isFavoriteArtist(artist.id);

  return (
    <div style={{ paddingBottom: 'var(--space-2xl)' }}>
      {/* Hero banner */}
      <div style={{
        position: 'relative',
        height: 320,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        marginBottom: 'var(--space-xl)',
      }}>
        <img
          src={artist.artwork}
          alt={`${artist.name} banner`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(2px) brightness(0.6)',
            transform: 'scale(1.1)',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(transparent 30%, var(--bg-primary) 100%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 'var(--space-xl)',
          left: 'var(--space-xl)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-xl)',
        }}>
          <div style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid rgba(255,255,255,0.2)',
            boxShadow: dominantColor
              ? `0 8px 40px ${dominantColor}60`
              : '0 8px 40px rgba(0,0,0,0.5)',
          }}>
            <img
              src={artist.artwork}
              alt={artist.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
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
              Artist
            </p>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {artist.name}
            </h1>
            {artist.followers && (
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginTop: 'var(--space-xs)',
              }}>
                {formatNumber(artist.followers)} followers
              </p>
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
      }}>
        <button
          onClick={handlePlayAll}
          aria-label="Play top tracks"
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <button
          onClick={() => {
            if (isLiked) removeFavoriteArtist(artist.id);
            else addFavoriteArtist(artist);
          }}
          aria-label={isLiked ? 'Unfollow' : 'Follow'}
          style={{
            padding: '8px 24px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${isLiked ? 'var(--accent-secondary)' : 'var(--border-medium)'}`,
            color: isLiked ? 'var(--accent-secondary)' : 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all var(--transition-fast)',
          }}
        >
          {isLiked ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Popular tracks */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <SectionHeader title="Popular" icon="🔥" />
        {topTracks.map((track, i) => (
          <SongRow
            key={track.id}
            track={track}
            tracks={topTracks}
            index={i}
            showIndex
            showAlbum
          />
        ))}
      </section>

      {/* Discography */}
      {albums.length > 0 && (
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <SectionHeader title="Discography" icon="💿" subtitle={`${albums.length} releases`} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 'var(--space-lg)',
          }}>
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} size="sm" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
