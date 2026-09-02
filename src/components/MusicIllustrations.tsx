/**
 * Hela Music Illustrations
 * Beautiful SVG illustrations for empty states and visual accents
 */

// ---- Playlist Art Generator ----
// Generates unique gradient artwork based on playlist name

const PLAYLIST_GRADIENTS: [string, string, string][] = [
  ['#6366f1', '#a855f7', '#ec4899'],
  ['#06b6d4', '#3b82f6', '#8b5cf6'],
  ['#f97316', '#ef4444', '#ec4899'],
  ['#10b981', '#06b6d4', '#3b82f6'],
  ['#f59e0b', '#f97316', '#ef4444'],
  ['#8b5cf6', '#d946ef', '#f43f5e'],
  ['#14b8a6', '#22c55e', '#84cc16'],
  ['#6366f1', '#ec4899', '#f97316'],
  ['#0ea5e9', '#8b5cf6', '#d946ef'],
  ['#f43f5e', '#f97316', '#f59e0b'],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPlaylistGradient(name: string): [string, string, string] {
  const idx = hashString(name) % PLAYLIST_GRADIENTS.length;
  return PLAYLIST_GRADIENTS[idx];
}

export function PlaylistArt({ name, size = 200 }: { name: string; size?: number }) {
  const [c1, c2, c3] = getPlaylistGradient(name);
  const id = `pl-${hashString(name)}`;
  
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="30%" cy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" rx="12" fill={`url(#${id}-bg)`} />
      <rect width="200" height="200" rx="12" fill={`url(#${id}-glow)`} />
      {/* Music note icon */}
      <g transform="translate(60, 45)" fill="rgba(255,255,255,0.85)">
        <path d="M50 10V95c0 16-14 28-32 28S-14 111-14 95s14-28 32-28c8 0 15 3 20 7V0h12v10z" transform="scale(0.85)" />
        <circle cx="18" cy="105" r="22" fill="rgba(255,255,255,0.85)" />
        <circle cx="64" cy="88" r="18" fill="rgba(255,255,255,0.85)" />
      </g>
      {/* Decorative circles */}
      <circle cx="160" cy="40" r="25" fill="rgba(255,255,255,0.06)" />
      <circle cx="30" cy="170" r="35" fill="rgba(255,255,255,0.04)" />
      <circle cx="180" cy="170" r="20" fill="rgba(255,255,255,0.05)" />
    </svg>
  );
}

// ---- Empty State Illustrations ----

export function EmptyLibraryIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <linearGradient id="el-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent-pink)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="70" fill="url(#el-grad)" />
      {/* Book/Library icon */}
      <g transform="translate(48, 40)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none">
        <rect x="8" y="8" width="24" height="64" rx="2" strokeOpacity="0.6" />
        <rect x="40" y="12" width="20" height="56" rx="2" strokeOpacity="0.4" />
        <rect x="64" y="16" width="16" height="48" rx="2" strokeOpacity="0.25" />
        <line x1="12" y1="24" x2="28" y2="24" strokeOpacity="0.4" />
        <line x1="12" y1="32" x2="24" y2="32" strokeOpacity="0.3" />
        <line x1="44" y1="28" x2="56" y2="28" strokeOpacity="0.3" />
      </g>
    </svg>
  );
}

export function EmptySearchIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <linearGradient id="es-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--accent-pink)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="70" fill="url(#es-grad)" />
      {/* Search icon */}
      <g transform="translate(50, 42)" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <circle cx="24" cy="24" r="20" strokeOpacity="0.5" />
        <line x1="38" y1="38" x2="56" y2="56" strokeOpacity="0.4" strokeWidth="3" />
        {/* Musical notes */}
        <circle cx="52" cy="20" r="4" fill="var(--accent)" fillOpacity="0.2" />
        <path d="M56 20V36" strokeOpacity="0.3" />
        <circle cx="64" cy="16" r="3" fill="var(--accent)" fillOpacity="0.15" />
        <path d="M67 16V30" strokeOpacity="0.2" />
      </g>
    </svg>
  );
}

export function EmptyPlaylistIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <linearGradient id="ep-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--accent-pink)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="70" fill="url(#ep-grad)" />
      {/* Playlist icon */}
      <g transform="translate(46, 42)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" fill="none">
        <rect x="4" y="4" width="64" height="72" rx="4" strokeOpacity="0.4" />
        {/* Music note */}
        <circle cx="40" cy="38" r="8" strokeOpacity="0.5" />
        <path d="M44 30V56" strokeOpacity="0.4" />
        <path d="M44 30L56 26V44" strokeOpacity="0.3" />
        {/* Lines */}
        <line x1="12" y1="20" x2="28" y2="20" strokeOpacity="0.3" />
        <line x1="12" y1="28" x2="24" y2="28" strokeOpacity="0.2" />
        <line x1="12" y1="36" x2="26" y2="36" strokeOpacity="0.2" />
      </g>
    </svg>
  );
}

export function ErrorIllustration() {
  return (
    <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <linearGradient id="err-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="70" fill="url(#err-grad)" />
      {/* Broken link / disconnected icon */}
      <g transform="translate(44, 44)" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none">
        <circle cx="36" cy="36" r="30" strokeOpacity="0.3" />
        <path d="M52 20L44 28M24 44L16 52" strokeOpacity="0.4" strokeWidth="2.5" />
        <path d="M56 36H48" strokeOpacity="0.3" />
        <path d="M36 16V24" strokeOpacity="0.3" />
        {/* Exclamation */}
        <line x1="36" y1="30" x2="36" y2="42" strokeOpacity="0.6" strokeWidth="2.5" />
        <circle cx="36" cy="48" r="2" fill="#ef4444" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

export function NowPlayingIllustration() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="np-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--accent-pink)" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill="url(#np-grad)" />
      {/* Animated equalizer bars */}
      <g transform="translate(24, 28)">
        <rect x="0" y="16" width="6" height="16" rx="3" fill="var(--accent)" fillOpacity="0.6">
          <animate attributeName="height" values="16;24;12;16" dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="y" values="16;8;20;16" dur="0.8s" repeatCount="indefinite" />
        </rect>
        <rect x="10" y="10" width="6" height="22" rx="3" fill="var(--accent)" fillOpacity="0.7">
          <animate attributeName="height" values="22;12;28;22" dur="0.8s" begin="0.15s" repeatCount="indefinite" />
          <animate attributeName="y" values="10;20;4;10" dur="0.8s" begin="0.15s" repeatCount="indefinite" />
        </rect>
        <rect x="20" y="14" width="6" height="18" rx="3" fill="var(--accent)" fillOpacity="0.5">
          <animate attributeName="height" values="18;28;14;18" dur="0.8s" begin="0.3s" repeatCount="indefinite" />
          <animate attributeName="y" values="14;4;18;14" dur="0.8s" begin="0.3s" repeatCount="indefinite" />
        </rect>
        <rect x="30" y="8" width="6" height="24" rx="3" fill="var(--accent)" fillOpacity="0.4">
          <animate attributeName="height" values="24;16;20;24" dur="0.8s" begin="0.45s" repeatCount="indefinite" />
          <animate attributeName="y" values="8;16;12;8" dur="0.8s" begin="0.45s" repeatCount="indefinite" />
        </rect>
        <rect x="40" y="12" width="6" height="20" rx="3" fill="var(--accent)" fillOpacity="0.3">
          <animate attributeName="height" values="20;28;10;20" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
          <animate attributeName="y" values="12;4;22;12" dur="0.8s" begin="0.6s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}
