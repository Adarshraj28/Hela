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
      <div style={{ padding: 'var(--space-xl) var(--space-lg) var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}>
            Your Library
          </h1>
          <button className="hover-lift" style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)', transition: 'all var(--t-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: 'var(--space-lg)',
        }}>
          please choose the album you like
        </p>

        {/* Search bar — matches reference */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-lg)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <div onClick={() => navigate('/search')} style={{
            width: '100%', padding: '12px 16px 12px 44px',
            background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-tertiary)', fontSize: '0.9375rem',
            cursor: 'pointer',
          }}>
            What do you want to listen today ?
          </div>
        </div>

        {/* Tabs — matching reference */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-sm)',
        }} className="hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="hover-lift"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                background: activeTab === tab.id ? 'var(--text-primary)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                transition: 'all var(--t-fast)',
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
              variant="library"
              title="Your library is empty"
              description="Start saving songs and they'll appear here."
              action={
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent)',
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
              variant="library"
              title="No saved albums"
              description="Albums you save will appear here."
              action={
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent)',
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
              variant="library"
              title="No followed artists"
              description="Artists you follow will appear here."
              action={
                <button
                  onClick={() => navigate('/search')}
                  style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent)',
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
