import { useState } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { ItemSlot } from './ItemSlot';
import { ItemEditorModal } from './ItemEditorModal';
import type { MinecraftItem } from '../utils/nbtParser';
import type { ArmorType } from '@mcsr-tools/utils';

export function MinecraftInventoryLayout() {
  const { presets, selectedPreset } = useInventoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);
  const [filterArmorType, setFilterArmorType] = useState<ArmorType | undefined>(undefined);

  if (selectedPreset === null) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-secondary text-center">プリセットを選択してください</p>
      </div>
    );
  }

  const preset = presets[selectedPreset];

  if (!preset || preset.containers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-secondary text-center">コンテナがありません</p>
      </div>
    );
  }

  // Create slot arrays (41 slots: 0-8 hotbar, 9-35 inventory, 36-39 armor, 40 offhand)
  const slots: (MinecraftItem | null)[] = Array(41).fill(null);

  // Container mapping for MiniPracticeKit:
  // Container 0: Hotbar (slots 0-8 in container → slots 0-8 in UI)
  // Container 1: Main Inventory (slots 0-26 in container → slots 9-35 in UI)
  // Container 2+: Other containers (armor, offhand, etc.)

  preset.containers.forEach((container, containerIndex) => {
    container.items.forEach((item) => {
      const itemSlot = item.Slot ?? 0;

      if (containerIndex === 0) {
        // Hotbar: slots 0-8 stay as 0-8
        if (itemSlot >= 0 && itemSlot <= 8) {
          slots[itemSlot] = item;
        }
      } else if (containerIndex === 1) {
        // Main Inventory: slots 0-26 map to 9-35
        if (itemSlot >= 0 && itemSlot <= 26) {
          slots[9 + itemSlot] = item;
        }
      } else {
        // Other containers: use slot as-is (for armor slots 36-39, offhand 40, etc.)
        if (itemSlot >= 0 && itemSlot <= 40) {
          slots[itemSlot] = item;
        }
      }
    });
  });

  const handleSlotClick = (slotIndex: number, armorType?: ArmorType) => {
    // Open modal for both add and edit
    setTargetSlot(slotIndex);
    setFilterArmorType(armorType);
    setIsModalOpen(true);
  };

  const renderSlot = (slotIndex: number, slotType: 'normal' | 'armor' | 'offhand' = 'normal', armorType?: 'helmet' | 'chestplate' | 'leggings' | 'boots') => {
    const item = slots[slotIndex];
    const isSelected = isModalOpen && targetSlot === slotIndex;

    return (
      <ItemSlot
        item={item}
        selected={isSelected}
        onClick={() => handleSlotClick(slotIndex, armorType)}
        slotType={slotType}
        armorType={armorType}
      />
    );
  };

  return (
    <>
      {/* Minecraft Inventory Layout */}
      <div className="flex gap-6 justify-center items-end">
        {/* Left side: Armor slots (vertical) */}
        <div className="flex flex-col gap-2">
          {[39, 38, 37, 36].map((slotIndex, idx) => (
            <div key={slotIndex}>
              {renderSlot(slotIndex, 'armor', ['helmet', 'chestplate', 'leggings', 'boots'][idx] as any)}
            </div>
          ))}
        </div>

        {/* Center: Main inventory + Hotbar */}
        <div className="flex flex-col gap-4">
          {/* Main Inventory (3 rows x 9 columns) */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {Array.from({ length: 9 }).map((_, colIndex) => {
                  const slotIndex = 9 + rowIndex * 9 + colIndex;
                  return (
                    <div key={colIndex}>
                      {renderSlot(slotIndex)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Hotbar (1 row x 9 columns) */}
          <div className="flex gap-2 pt-3 border-t border-gray-300 dark:border-gray-600">
            {Array.from({ length: 9 }).map((_, colIndex) => (
              <div key={colIndex}>
                {renderSlot(colIndex)}
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Offhand slot */}
        <div className="flex flex-col gap-1 items-center">
          <div className="text-xs text-secondary whitespace-nowrap">Offhand</div>
          {renderSlot(40, 'offhand')}
        </div>
      </div>

      <ItemEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetSlot(null);
          setFilterArmorType(undefined);
        }}
        slotIndex={targetSlot}
        filterByArmorSlot={filterArmorType}
      />
    </>
  );
}
