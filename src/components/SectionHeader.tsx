import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  href?: string;
  icon?: ReactNode;
}

export function SectionHeader({ title, subtitle, action, icon }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        {icon && <span style={{ fontSize: '1.2em' }}>{icon}</span>}
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
