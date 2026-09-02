import { NavLink } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )},
  { path: '/search', label: 'Search', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )},
  { path: '/library', label: 'Library', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )},
  { path: '/playlists', label: 'Playlists', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )},
];

export function Sidebar() {
  return (
    <aside className="desktop-sidebar" style={{
      width: 'var(--sidebar-width)', height: '100vh',
      position: 'fixed', left: 0, top: 0,
      background: 'rgba(8, 8, 14, 0.6)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column',
      padding: 'var(--space-lg)',
      zIndex: 'var(--z-sticky)',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        padding: 'var(--space-sm) var(--space-sm)', marginBottom: 'var(--space-2xl)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.875rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.05em',
        }}>F</div>
        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
          Freebuff
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: '0.875rem',
              transition: 'all var(--t-fast)',
            })}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Keyboard shortcuts hint */}
      <div style={{
        padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 600 }}>Keyboard Shortcuts</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px', fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
          <kbd style={{ fontFamily: 'monospace' }}>Space</kbd><span>Play / Pause</span>
          <kbd style={{ fontFamily: 'monospace' }}>←→</kbd><span>Seek ±10s</span>
          <kbd style={{ fontFamily: 'monospace' }}>⇧←→</kbd><span>Prev / Next</span>
          <kbd style={{ fontFamily: 'monospace' }}>M</kbd><span>Mute</span>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const hasTrack = usePlayerStore((s) => !!s.currentTrack);

  return (
    <nav className="mobile-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'var(--mobile-nav-height)',
      background: 'rgba(8, 8, 14, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'none', alignItems: 'center', justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 'var(--z-player)',
    }}>
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.path} to={item.path} end={item.path === '/'}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '6px 14px', color: isActive ? '#fff' : 'var(--text-tertiary)',
            fontSize: '0.5625rem', fontWeight: isActive ? 600 : 400,
            transition: 'color var(--t-fast)',
          })}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
