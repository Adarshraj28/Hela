import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useThemeStore } from '../store/themeStore';
import { Icon } from '../components/HelaIcons';

export function SettingsPage() {
  const navigate = useNavigate();
  const { volume, setVolume, shuffle, toggleShuffle, repeat, cycleRepeat } = usePlayerStore();
  const { favorites, favoriteAlbums, favoriteArtists, recentlyPlayed, clearRecentlyPlayed } = useLibraryStore();
  const { playlists } = usePlaylistStore();
  const { theme, setTheme } = useThemeStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const totalTracks = favorites.length;
  const totalAlbums = favoriteAlbums.length;
  const totalArtists = favoriteArtists.length;
  const totalPlaylists = playlists.length;
  const totalRecent = recentlyPlayed.length;

  return (
    <div style={{ paddingBottom: 'var(--space-3xl)', maxWidth: 560, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-2xl) 0 var(--space-xl)', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto var(--space-md)',
          background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(139,92,246,0.3)',
        }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>H</span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
        }}>Hela</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'var(--space-xs)' }}>
          Your personal music experience
        </p>
      </div>

      {/* Stats */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)',
        marginBottom: 'var(--space-xl)',
      }}>
        {[
          { label: 'Liked', value: totalTracks, icon: Icon.Heart },
          { label: 'Albums', value: totalAlbums, icon: Icon.Library },
          { label: 'Artists', value: totalArtists, icon: Icon.Search },
        ].map(({ label, value, icon: Ic }) => (
          <div key={label} style={{
            padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <Ic size={16} style={{ color: 'var(--accent)', margin: '0 auto var(--space-xs)' }} />
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </section>

      {/* Appearance */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)',
        }}>Appearance</h2>
        <div style={{
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              {theme === 'dark' ? <Icon.Settings size={16} style={{ color: 'var(--accent)' }} /> : <span style={{ fontSize: '0.875rem' }}>☀️</span>}
              <div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Theme</p>
                <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', marginTop: 1 }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
              </div>
            </div>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: theme === 'light' ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                position: 'relative', transition: 'background var(--t-normal)', flexShrink: 0,
              }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: theme === 'light' ? 22 : 2,
                transition: 'left var(--t-normal) var(--ease-spring)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </button>
          </div>
        </div>
      </section>

      {/* Playback Settings */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)',
        }}>Playback</h2>
        <div style={{
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}>
          {/* Volume */}
          <div style={{
            padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Volume</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range" min={0} max={1} step={0.01} value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: '100%', height: 4, appearance: 'none', WebkitAppearance: 'none',
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${volume * 100}%, rgba(255,255,255,0.06) ${volume * 100}%, rgba(255,255,255,0.06) 100%)`,
                borderRadius: 4, cursor: 'pointer', outline: 'none',
              }}
              aria-label="Volume"
            />
          </div>

          {/* Shuffle */}
          <button onClick={toggleShuffle} style={{
            width: '100%', padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Shuffle</span>
            <div style={{
              width: 44, height: 24, borderRadius: 12,
              background: shuffle ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
              position: 'relative', transition: 'background var(--t-normal)',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2, left: shuffle ? 22 : 2,
                transition: 'left var(--t-normal) var(--ease-spring)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }} />
            </div>
          </button>

          {/* Repeat */}
          <button onClick={cycleRepeat} style={{
            width: '100%', padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Repeat</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-tertiary)',
              }}>
                {repeat === 'off' ? 'Off' : repeat === 'all' ? 'All' : 'One'}
              </span>
              <Icon.Repeat size={16} style={{ color: repeat !== 'off' ? 'var(--accent)' : 'var(--text-tertiary)' }} />
            </div>
          </button>
        </div>
      </section>

      {/* Library Stats */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)',
        }}>Library</h2>
        <div style={{
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}>
          <StatRow label="Liked Songs" value={totalTracks} onClick={() => navigate('/library')} />
          <StatRow label="Saved Albums" value={totalAlbums} onClick={() => navigate('/library')} />
          <StatRow label="Followed Artists" value={totalArtists} onClick={() => navigate('/library')} />
          <StatRow label="Playlists" value={totalPlaylists} onClick={() => navigate('/playlists')} />
          <StatRow label="Recently Played" value={totalRecent} last onClick={() => navigate('/library')} />
        </div>
      </section>

      {/* Data Management */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)',
        }}>Data</h2>
        <div style={{
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All your data is stored locally in this browser. Nothing is sent to any server.
            </p>
          </div>
          {!showClearConfirm ? (
            <button onClick={() => setShowClearConfirm(true)} style={{
              width: '100%', padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            }}>
              <Icon.Settings size={16} style={{ color: 'var(--accent-red)' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--accent-red)' }}>Clear Listening History</span>
            </button>
          ) : (
            <div style={{ padding: 'var(--space-md)', background: 'rgba(239,68,68,0.04)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginBottom: 'var(--space-sm)' }}>
                Clear your recently played history? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button onClick={() => { clearRecentlyPlayed(); setShowClearConfirm(false); }}
                  style={{
                    padding: '6px 16px', borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-red)', color: '#fff', fontSize: '0.75rem', fontWeight: 600,
                  }}>Clear</button>
                <button onClick={() => setShowClearConfirm(false)}
                  style={{
                    padding: '6px 16px', borderRadius: 'var(--radius-full)',
                    background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600,
                  }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-tertiary)', marginBottom: 'var(--space-md)',
        }}>About</h2>
        <div style={{
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          border: '1px solid var(--border-subtle)', padding: 'var(--space-lg)',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)', margin: '0 auto var(--space-md)',
            background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>H</span>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Hela</p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-xs)' }}>
            Version 1.0 · Personal Music App
          </p>
          <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: 'var(--space-sm)', lineHeight: 1.5 }}>
            Built with React · TypeScript · Vite · Zustand<br />
            Music data powered by iTunes API<br />
            Full playback via Apple Music embeds<br />
            Lyrics powered by Spotify23
          </p>
        </div>
      </section>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
          background: #fff; cursor: pointer; box-shadow: 0 0 6px rgba(0,0,0,0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%; border: none;
          background: #fff; cursor: pointer; box-shadow: 0 0 6px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}

function StatRow({ label, value, onClick, last }: { label: string; value: number; onClick: () => void; last?: boolean }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: 'var(--space-md)', background: 'rgba(255,255,255,0.01)',
      borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </span>
        <Icon.ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: 'rotate(-90deg)' }} />
      </div>
    </button>
  );
}
