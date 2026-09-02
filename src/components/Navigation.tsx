import { NavLink } from 'react-router-dom';
import { Icon } from './HelaIcons';

const NAV = [
  { path: '/', label: 'Home', icon: Icon.Home },
  { path: '/search', label: 'Search', icon: Icon.Search },
  { path: '/library', label: 'Library', icon: Icon.Library },
  { path: '/playlists', label: 'Playlists', icon: Icon.List },
  { path: '/settings', label: 'Profile', icon: Icon.Settings },
];

export function Sidebar() {
  return (
    <aside className="desktop-sidebar" style={{
      width: 'var(--sidebar-width)', height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'rgba(6, 6, 11, 0.5)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(255,255,255,0.03)',
      display: 'flex', flexDirection: 'column', padding: 'var(--space-lg) var(--space-md)',
      zIndex: 'var(--z-sticky)',
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        padding: 'var(--space-xs) var(--space-sm)', marginBottom: 'var(--space-2xl)',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 'var(--radius-sm)',
          background: 'var(--gradient-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8125rem', fontWeight: 700, color: '#fff',
        }}>H</div>
        <span style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Hela
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ path, label, icon: IconComp }) => (
          <NavLink key={path} to={path} end={path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
              padding: '9px 12px', borderRadius: 'var(--radius-sm)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: '0.8125rem',
              transition: 'all var(--t-fast)',
            })}>
            <IconComp size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Shortcuts */}
      <div style={{
        padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-sm)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <p style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Shortcuts</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1px 8px', fontSize: '0.5rem', color: 'var(--text-muted)' }}>
          <kbd style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>Space</kbd><span>Play / Pause</span>
          <kbd style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>← →</kbd><span>Seek ±10s</span>
          <kbd style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>⇧ ← →</kbd><span>Prev / Next</span>
          <kbd style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>M</kbd><span>Mute</span>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="mobile-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 'var(--mobile-nav-height)',
      background: 'rgba(6, 6, 11, 0.94)',
      backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      display: 'none', alignItems: 'center', justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 'var(--z-player)',
    }}>
      {NAV.map(({ path, label, icon: IconComp }) => (
        <NavLink key={path} to={path} end={path === '/'}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 0', minWidth: 56,
            color: isActive ? '#fff' : 'var(--text-tertiary)',
            transition: 'color var(--t-fast)',
          })}>
          {({ isActive }) => (
            <>
              <div style={{ position: 'relative' }}>
                <IconComp size={20} />
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                    width: 3, height: 3, borderRadius: '50%',
                    background: 'var(--accent)',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: '0.5625rem', fontWeight: isActive ? 600 : 400,
                marginTop: isActive ? 2 : 0,
              }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
