import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      marginBottom: 'var(--space-md)',
    }}>
      <div>
        <h2 style={{
          fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)',
          letterSpacing: '-0.02em', lineHeight: 1.2, fontFamily: 'var(--font)',
        }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 2, fontFamily: 'var(--font)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
