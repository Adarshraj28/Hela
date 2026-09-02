import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
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
      {icon && (
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
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-sm)',
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: '0.875rem',
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
