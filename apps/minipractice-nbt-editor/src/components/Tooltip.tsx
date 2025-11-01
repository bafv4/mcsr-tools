import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Don't render tooltip if content is null/undefined
  if (!content) {
    return <div ref={containerRef}>{children}</div>;
  }

  return (
    <>
      <div ref={containerRef}>{children}</div>
      {isVisible && (
        <div
          className="fixed px-3 py-2 text-white text-sm pointer-events-none z-[9999]"
          style={{
            left: `${position.x + 16}px`,
            top: `${position.y + 16}px`,
            background: 'linear-gradient(to bottom, rgba(16, 0, 16, 0.94), rgba(80, 0, 80, 0.94))',
            border: '2px solid',
            borderImage: 'linear-gradient(to bottom, rgba(80, 0, 255, 0.5), rgba(40, 0, 127, 0.5)) 1',
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
