import { NavLink } from 'react-router-dom';
import { Icon } from './HelaIcons';

const NAV = [
  { path: '/', label: 'Home', icon: Icon.Home },
  { path: '/search', label: 'Search', icon: Icon.Search },
  { path: '/library', label: 'Library', icon: Icon.Library },
  { path: '/settings', label: 'Setting', icon: Icon.Settings },
];

export function Sidebar() {
  return (
    <aside className="desktop-sidebar" style={{
      width: 'var(--sidebar-width)', height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'rgba(6, 6, 11, 0.45)',
      backdropFilter: 'blur(32px) saturate(1.4)', WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
      borderRight: '1px solid rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', padding: 'var(--space-lg) var(--space-md)',
      zIndex: 'var(--z-sticky)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        padding: 'var(--space-xs) var(--space-sm)', marginBottom: 'var(--space-2xl)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-sm)',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <img src="/logo.png" alt="Hela" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', textShadow: '0 0 20px rgba(139,92,246,0.2)' }}>
          Hela
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ path, label, icon: IconComp }) => (
          <NavLink key={path} to={path} end={path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(139, 92, 246, 0.1)' : 'none',
              fontWeight: isActive ? 600 : 400, fontSize: '0.9375rem',
              transition: 'all var(--t-fast)',
            })}>
            <IconComp size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

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
      background: 'rgba(8, 8, 16, 0.96)',
      backdropFilter: 'blur(32px) saturate(1.4)', WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      display: 'none', alignItems: 'center', justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 'var(--z-player)',
    }}>
      {NAV.map(({ path, label, icon: IconComp }) => (
        <NavLink key={path} to={path} end={path === '/'}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 0', minWidth: 64,
            color: isActive ? '#fff' : 'var(--text-tertiary)',
            transition: 'color var(--t-fast)',
            textDecoration: 'none',
          })}>
          {({ isActive }) => (
            <>
              <div style={{
                position: 'relative',
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
                transition: 'all var(--t-fast)',
                boxShadow: isActive ? '0 0 16px rgba(139,92,246,0.2)' : 'none',
              }}>
                <IconComp size={22} />
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)',
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: '0 0 10px rgba(139,92,246,0.7)',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: '0.625rem', fontWeight: isActive ? 600 : 400,
              }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
