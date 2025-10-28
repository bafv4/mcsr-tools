// import { useState } from 'react';
// import { Button } from '@mcsr-tools/ui';
import { useInventoryStore } from '../store/useInventoryStore';
// import { ItemSelector } from './ItemSelector'; // Removed - using ItemEditorModal instead

export function ItemList() {
  const { presets, selectedPreset, selectedContainer, selectedItem, selectItem } = useInventoryStore();
  // const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);

  if (selectedPreset === null || selectedContainer === null) {
    return null;
  }

  const preset = presets[selectedPreset];
  const container = preset?.containers[selectedContainer];

  if (!container) {
    return null;
  }

  // const handleAddItem = (itemId: string, count: number) => {
  //   // Removed - use ItemEditorModal instead
  // };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">
            {container.name || container.id.replace('minecraft:', '')} - アイテム一覧
          </h2>
          {/* Button removed - use MinecraftInventoryLayout for editing */}
        </div>

        {container.items.length === 0 ? (
          <div className="text-secondary text-center py-8">
            このコンテナにはアイテムがありません
            {/* Button removed - use MinecraftInventoryLayout for editing */}
          </div>
        ) : (
          <div className="grid grid-cols-9 gap-2">
        {container.items.map((item, index) => {
          const isSelected = selectedItem?.containerIndex === selectedContainer && selectedItem?.itemIndex === index;
          const itemName = item.id.replace('minecraft:', '');

          return (
            <button
              key={index}
              onClick={() => selectItem(selectedContainer, index)}
              className={`aspect-square p-2 rounded border-2 transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
              title={`${itemName} x${item.Count}${item.Slot !== undefined ? ` (Slot ${item.Slot})` : ''}`}
            >
              <div className="text-xs font-medium text-primary text-center break-all">
                {itemName}
              </div>
              <div className="text-xs text-secondary mt-1">
                x{item.Count}
              </div>
              {item.Slot !== undefined && (
                <div className="text-xs text-tertiary">
                  #{item.Slot}
                </div>
              )}
            </button>
          );
        })}
          </div>
        )}
      </div>

      {/* ItemSelector removed - using ItemEditorModal instead */}
    </>
  );
}
