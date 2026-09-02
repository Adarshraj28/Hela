import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, MobileNav } from './components/Navigation';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';
import { usePlayerStore } from './store/playerStore';
import { useThemeStore, applyTheme } from './store/themeStore';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { AlbumPage } from './pages/AlbumPage';
import { ArtistPage } from './pages/ArtistPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const hasTrack = usePlayerStore((s) => !!s.currentTrack);
  const theme = useThemeStore((s) => s.theme);

  // Apply theme on mount
  useEffect(() => { applyTheme(theme); }, [theme]);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>
        <Sidebar />

        <main className="app-main" style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          padding: '0 var(--space-xl) var(--space-xl)',
          paddingBottom: hasTrack
                ? 'calc(var(--player-height) + var(--space-xl))'
                : 'var(--space-xl)',
          minHeight: '100dvh',
          transition: 'padding-bottom var(--t-normal)',
        }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/playlists" element={<PlaylistsPage />} />
            <Route path="/playlists/:id" element={<PlaylistsPage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        <MiniPlayer />
        <FullPlayer />
        <MobileNav />

        <style>{`
          /* ---- Mobile ---- */
          @media (max-width: 768px) {
            .desktop-sidebar { display: none !important; }
            .mobile-nav { display: flex !important; }
            .app-main {
              margin-left: 0 !important;
              padding: 0 var(--space-md) var(--space-md) !important;
              padding-bottom: calc(var(--player-height) + var(--mobile-nav-height) + var(--space-md)) !important;
            }
            .album-col { display: none !important; }
          }
          @media (max-width: 480px) {
            .app-main {
              padding: 0 var(--space-sm) var(--space-sm) !important;
              padding-bottom: calc(var(--player-height) + var(--mobile-nav-height) + var(--space-sm)) !important;
            }
          }

          /* ---- Large screens ---- */
          @media (min-width: 1400px) {
            .app-main { max-width: 1200px; }
          }
        `}</style>
      </div>
    </BrowserRouter>
  );
}
