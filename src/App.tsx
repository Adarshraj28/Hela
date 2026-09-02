import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, MobileNav } from './components/Navigation';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { usePlayerStore } from './store/playerStore';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { AlbumPage } from './pages/AlbumPage';
import { ArtistPage } from './pages/ArtistPage';
import { PlaylistsPage } from './pages/PlaylistsPage';

function AppLayout() {
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100dvh',
    }}>
      {/* Sidebar (desktop only) */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        padding: 'var(--space-lg) var(--space-2xl)',
        paddingBottom: currentTrack ? 'calc(var(--player-height) + var(--space-2xl))' : 'var(--space-2xl)',
        minHeight: '100dvh',
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/playlists/:id" element={<PlaylistsPage />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/artist/:id" element={<ArtistPage />} />
        </Routes>
      </main>

      {/* Mini Player */}
      <MiniPlayer />

      {/* Full Player */}
      <FullPlayer />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Global responsive styles */}
      <style>{`
        /* Skeleton animation */
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Responsive: Mobile */
        @media (max-width: 768px) {
          .sidebar-wrapper {
            display: none !important;
          }

          main {
            margin-left: 0 !important;
            padding: var(--space-md) !important;
            padding-bottom: calc(var(--mobile-nav-height) + var(--space-md)) !important;
          }

          /* Show mobile nav */
          nav {
            display: flex !important;
          }

          /* Adjust main padding for mobile player */
          main.has-player {
            padding-bottom: calc(var(--player-height-mobile) + var(--mobile-nav-height) + var(--space-md)) !important;
          }

          /* Album col hide on mobile */
          .album-col {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: var(--space-sm) !important;
            padding-bottom: calc(var(--mobile-nav-height) + var(--space-sm)) !important;
          }
        }

        /* Hover effects for non-touch devices */
        @media (hover: hover) {
          button:hover {
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
