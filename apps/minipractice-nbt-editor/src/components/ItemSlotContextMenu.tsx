import { useEffect, useRef } from 'react';
import { Button } from '@mcsr-tools/ui';
import { getMaxStackSize } from '@mcsr-tools/utils';
import type { MinecraftItem } from '../utils/nbtParser';

interface ItemSlotContextMenuProps {
  item: MinecraftItem | null;
  slotIndex: number;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onCountChange: (count: number) => void;
  onMoveToSlot?: (targetSlot: number) => void;
  isHotbar?: boolean;
}

export function ItemSlotContextMenu({
  item,
  slotIndex,
  position,
  onClose,
  onEdit,
  onDelete,
  onCountChange,
  onMoveToSlot,
  isHotbar = false,
}: ItemSlotContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to keep menu on screen
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 250),
    y: Math.min(position.y, window.innerHeight - 300),
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4 min-w-[240px]"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      {/* Edit/Add Button */}
      <div className="mb-4">
        <Button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full"
          variant="outline"
        >
          {item ? 'アイテムを編集' : 'アイテムを追加'}
        </Button>
      </div>

      {/* Delete Button - only show when item exists */}
      {item && onDelete && (
        <div className="mb-4">
          <Button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600"
            variant="secondary"
          >
            アイテムを削除
          </Button>
        </div>
      )}

      {/* Item Count Slider */}
      {item && (() => {
        const maxStack = getMaxStackSize(item.id);
        return (
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              個数: {item.Count}
            </label>
            <input
              type="range"
              min="1"
              max={maxStack}
              value={item.Count}
              onChange={(e) => onCountChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled={maxStack === 1}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>1</span>
              <span>{maxStack}</span>
            </div>
            {maxStack === 1 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                このアイテムはスタックできません
              </p>
            )}
          </div>
        );
      })()}

      {/* Hotbar Reordering Tool */}
      {isHotbar && item && onMoveToSlot && (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            移動先 (ホットバー)
          </label>
          <div className="grid grid-cols-9 gap-1">
            {Array.from({ length: 9 }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i !== slotIndex) {
                    onMoveToSlot(i);
                    onClose();
                  }
                }}
                disabled={i === slotIndex}
                className={`
                  w-full aspect-square rounded border text-sm font-medium
                  ${
                    i === slotIndex
                      ? 'bg-blue-500 text-white border-blue-600 cursor-default'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'
                  }
                `}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
