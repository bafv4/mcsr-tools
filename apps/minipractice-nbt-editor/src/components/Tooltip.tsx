import { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      {/* Minecraft-style tooltip: appears at bottom-right */}
      <div
        className="absolute top-full left-full ml-2 mt-1 px-2 py-1.5 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 min-w-max"
        style={{
          background: 'linear-gradient(to bottom, rgba(16, 0, 16, 0.94), rgba(80, 0, 80, 0.94))',
          border: '2px solid',
          borderImage: 'linear-gradient(to bottom, rgba(80, 0, 255, 0.5), rgba(40, 0, 127, 0.5)) 1',
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)',
        }}
      >
        {content}
      </div>
    </div>
  );
}
