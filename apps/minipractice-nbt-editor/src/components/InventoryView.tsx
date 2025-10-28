// import { useState } from 'react';
// import { Button } from '@mcsr-tools/ui';
import { useInventoryStore } from '../store/useInventoryStore';
import { ItemSlot } from './ItemSlot';
// import { ItemSelector } from './ItemSelector'; // Removed - using ItemEditorModal instead
import type { MinecraftItem } from '../utils/nbtParser';

export function InventoryView() {
  const { presets, selectedPreset, selectedContainer, selectedItem, selectItem } = useInventoryStore();
  // const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);
  // const [addingToSlot, setAddingToSlot] = useState<number | null>(null);

  if (selectedPreset === null || selectedContainer === null) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-secondary text-center">プリセットとコンテナを選択してください</p>
      </div>
    );
  }

  const preset = presets[selectedPreset];
  const container = preset?.containers[selectedContainer];

  if (!container) {
    return null;
  }

  // Create a 54-slot array (6 rows x 9 columns for double chest)
  // or 27-slot array (3 rows x 9 columns for single chest/shulker)
  const maxSlots = container.id.includes('shulker') ? 27 : 54;
  const slots: (MinecraftItem | null)[] = Array(maxSlots).fill(null);

  // Fill slots with items
  container.items.forEach((item) => {
    const slotIndex = item.Slot ?? 0;
    if (slotIndex < maxSlots) {
      slots[slotIndex] = item;
    }
  });

  const handleSlotClick = (slotIndex: number) => {
    const itemIndex = container.items.findIndex(item => (item.Slot ?? 0) === slotIndex);
    if (itemIndex !== -1) {
      selectItem(selectedContainer, itemIndex);
    }
    // Empty slot handling removed - use MinecraftInventoryLayout instead
  };

  // const handleAddItem = (itemId: string, count: number) => {
  //   // Removed - use ItemEditorModal instead
  // };

  const rows = maxSlots === 54 ? 6 : 3;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            {container.name || container.id.replace('minecraft:', '')}
          </h2>
          {/* Button removed - use MinecraftInventoryLayout for editing */}
        </div>

        {/* Inventory Grid - Minecraft style */}
        <div className="inline-block bg-[#C6C6C6] p-2 rounded border-2 border-gray-400 dark:border-gray-600">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 mb-1 last:mb-0">
              {Array.from({ length: 9 }).map((_, colIndex) => {
                const slotIndex = rowIndex * 9 + colIndex;
                const item = slots[slotIndex];
                const itemIndex = item ? container.items.findIndex(i => (i.Slot ?? 0) === slotIndex) : -1;
                const isSelected = selectedItem?.containerIndex === selectedContainer && selectedItem?.itemIndex === itemIndex;

                return (
                  <ItemSlot
                    key={slotIndex}
                    item={item}
                    selected={isSelected}
                    onClick={() => handleSlotClick(slotIndex)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Slot info */}
        <div className="mt-4 text-xs text-secondary">
          {container.items.length} / {maxSlots} スロット使用中
        </div>
      </div>

      {/* ItemSelector removed - using ItemEditorModal instead */}
    </>
  );
}
