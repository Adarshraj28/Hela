import { useRef, useState, useEffect } from 'react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  gap?: number;
}

export function HorizontalScroll({ children, gap = 16 }: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Left fade & button */}
      {canScrollLeft && (
        <>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 60,
            background: 'linear-gradient(to right, var(--bg-primary), transparent)',
            zIndex: 2,
            pointerEvents: 'none',
          }} />
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            style={{
              position: 'absolute',
              left: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              zIndex: 3,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x proximity',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          padding: '4px 0',
        }}
        className="hide-scrollbar"
      >
        {children}
      </div>

      {/* Right fade & button */}
      {canScrollRight && (
        <>
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 60,
            background: 'linear-gradient(to left, var(--bg-primary), transparent)',
            zIndex: 2,
            pointerEvents: 'none',
          }} />
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              zIndex: 3,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
