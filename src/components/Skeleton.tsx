import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  aspectRatio?: string;
  style?: CSSProperties;
  className?: string;
}

export function Skeleton({ width, height = '1em', borderRadius = 'var(--radius-sm)', aspectRatio, style, className }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        aspectRatio,
        borderRadius,
        background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-surface-hover) 50%, var(--bg-surface) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SongRowSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-sm) 0' }}>
      <Skeleton width={40} height={40} borderRadius="var(--radius-sm)" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </div>
      <Skeleton width={32} height={12} />
    </div>
  );
}

export function CardSkeleton({ variant = 'album' }: { variant?: 'album' | 'artist' | 'playlist' }) {
  const size = variant === 'artist' ? 180 : 200;
  const aspectRatio = variant === 'artist' ? '1 / 1' : '1 / 1';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <Skeleton width={size} height={size} aspectRatio={aspectRatio} borderRadius={variant === 'artist' ? '50%' : 'var(--radius-md)'} />
      <Skeleton width="80%" height={14} />
      <Skeleton width="60%" height={12} />
    </div>
  );
}

export function GridSkeleton({ count = 6, variant = 'album' }: { count?: number; variant?: 'album' | 'artist' | 'playlist' }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: variant === 'artist'
        ? 'repeat(auto-fill, minmax(180px, 1fr))'
        : 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 'var(--space-lg)',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
