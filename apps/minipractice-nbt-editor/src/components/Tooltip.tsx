import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    // Don't update position while scrolling
    if (isScrolling) return;

    const tooltip = tooltipRef.current;
    if (!tooltip) {
      setPosition({ x: e.clientX, y: e.clientY });
      return;
    }

    const offset = 16;
    const tooltipRect = tooltip.getBoundingClientRect();

    let x = e.clientX + offset;
    let y = e.clientY + offset;

    // Check if tooltip would go off the right edge
    if (x + tooltipRect.width > window.innerWidth) {
      x = e.clientX - tooltipRect.width - offset;
    }

    // Check if tooltip would go off the bottom edge
    if (y + tooltipRect.height > window.innerHeight) {
      y = e.clientY - tooltipRect.height - offset;
    }

    // Ensure tooltip doesn't go off the left edge
    if (x < 0) {
      x = offset;
    }

    // Ensure tooltip doesn't go off the top edge
    if (y < 0) {
      y = offset;
    }

    setPosition({ x, y });
  };

  const handleScroll = () => {
    setIsScrolling(true);
    setIsVisible(false); // Hide tooltip while scrolling

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set a timeout to re-enable position updates after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    setIsScrolling(false);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find the scrollable parent
    let scrollableParent = container.parentElement;
    while (scrollableParent) {
      const overflow = window.getComputedStyle(scrollableParent).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        break;
      }
      scrollableParent = scrollableParent.parentElement;
    }

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);

    if (scrollableParent) {
      scrollableParent.addEventListener('scroll', handleScroll);
    }

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);

      if (scrollableParent) {
        scrollableParent.removeEventListener('scroll', handleScroll);
      }

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrolling]);

  // Don't render tooltip if content is null/undefined
  if (!content) {
    return <div ref={containerRef}>{children}</div>;
  }

  return (
    <>
      <div ref={containerRef}>{children}</div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed px-3 py-2.5 pointer-events-none z-[9999] bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600 rounded-lg shadow-xl text-white"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
