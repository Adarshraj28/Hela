import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { SectionHeader } from '../components/SectionHeader';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { HorizontalScroll } from '../components/HorizontalScroll';
import { EmptyState } from '../components/EmptyState';

type LibraryTab = 'favorites' | 'recently' | 'albums' | 'artists';

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('favorites');
  const navigate = useNavigate();
  const { favorites, recentlyPlayed, favoriteAlbums, favoriteArtists, clearRecentlyPlayed } = useLibraryStore();
  const { playTrack, playQueue } = usePlayerStore();

  const tabs: { id: LibraryTab; label: string; count: number }[] = [
    { id: 'favorites', label: 'Favorites', count: favorites.length },
    { id: 'recently', label: 'Recently Played', count: recentlyPlayed.length },
    { id: 'albums', label: 'Albums', count: favoriteAlbums.length },
    { id: 'artists', label: 'Artists', count: favoriteArtists.length },
  ];

  return (
    <div style={{ paddingBottom: 'var(--space-2xl)' }}>
      <div style={{ padding: 'var(--space-xl) 0' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          marginBottom: 'var(--space-lg)',
        }}>
          Your Library
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-xs)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-sm)',
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                background: activeTab === tab.id ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: activeTab === tab.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                flexShrink: 0,
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  fontSize: '0.6875rem',
                  opacity: 0.7,
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Favorites */}
      {activeTab === 'favorites' && (
        <section>
          {favorites.length === 0 ? (
            <EmptyState
              icon="♡"
              title="Your library is empty"
              description="Start saving songs and they'll appear here."
              action={
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Explore Music
                </button>
              }
            />
          ) : (
            <div>
              {favorites.map((track, i) => (
                <SongRow
                  key={track.id}
                  track={track}
                  tracks={favorites}
                  index={i}
                  showAlbum
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Recently Played */}
      {activeTab === 'recently' && (
        <section>
          {recentlyPlayed.length === 0 ? (
            <EmptyState
              icon="🕐"
              title="No recently played tracks"
              description="Songs you play will appear here."
            />
          ) : (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 'var(--space-md)',
              }}>
                <button
                  onClick={clearRecentlyPlayed}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    padding: '4px 8px',
                  }}
                >
                  Clear History
                </button>
              </div>
              {recentlyPlayed.map((entry, i) => (
                <SongRow
                  key={`${entry.track.id}-${i}`}
                  track={entry.track}
                  tracks={recentlyPlayed.map((e) => e.track)}
                  index={i}
                  showAlbum
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Saved Albums */}
      {activeTab === 'albums' && (
        <section>
          {favoriteAlbums.length === 0 ? (
            <EmptyState
              icon="💿"
              title="No saved albums"
              description="Albums you save will appear here."
              action={
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Explore Albums
                </button>
              }
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 'var(--space-lg)',
            }}>
              {favoriteAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} size="sm" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Saved Artists */}
      {activeTab === 'artists' && (
        <section>
          {favoriteArtists.length === 0 ? (
            <EmptyState
              icon="🎤"
              title="No followed artists"
              description="Artists you follow will appear here."
              action={
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Find Artists
                </button>
              }
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 'var(--space-lg)',
            }}>
              {favoriteArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} size="sm" />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
