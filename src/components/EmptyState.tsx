import type { ReactNode } from 'react';
import { EmptyLibraryIllustration, EmptySearchIllustration, EmptyPlaylistIllustration, ErrorIllustration } from './MusicIllustrations';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'library' | 'search' | 'playlist' | 'error' | 'default';
}

export function EmptyState({ icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  const illustration = (() => {
    switch (variant) {
      case 'library': return <EmptyLibraryIllustration />;
      case 'search': return <EmptySearchIllustration />;
      case 'playlist': return <EmptyPlaylistIllustration />;
      case 'error': return <ErrorIllustration />;
      default: return icon ? null : <EmptySearchIllustration />;
    }
  })();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-3xl) var(--space-xl)',
      textAlign: 'center',
      minHeight: 300,
    }}>
      {illustration && (
        <div style={{
          marginBottom: 'var(--space-lg)',
          opacity: 0.8,
        }}>
          {illustration}
        </div>
      )}
      {icon && !illustration && (
        <div style={{
          fontSize: '3rem',
          marginBottom: 'var(--space-lg)',
          opacity: 0.3,
          lineHeight: 1,
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-sm)',
        letterSpacing: '-0.01em',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: 'var(--space-lg)',
        }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
