import { useState } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { ItemSlot } from './ItemSlot';
import { ItemEditorModal } from './ItemEditorModal';
import { ItemSlotContextMenu } from './ItemSlotContextMenu';
import type { MinecraftItem } from '../utils/nbtParser';

export function MinecraftInventoryLayout() {
  const { presets, selectedPreset, updateItemBySlot } = useInventoryStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    slotIndex: number;
    position: { x: number; y: number };
  } | null>(null);

  if (selectedPreset === null) {
    return (
      <></>
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

  // Create slot arrays (36 slots: 0-8 hotbar, 9-35 inventory)
  const slots: (MinecraftItem | null)[] = Array(36).fill(null);

  // Container mapping for MiniPracticeKit:
  // Container 0: Hotbar (slots 0-8 in container → slots 0-8 in UI)
  // Container 1: Main Inventory (slots 0-26 in container → slots 9-35 in UI)

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
      }
    });
  });

  const handleSlotClick = (slotIndex: number) => {
    // Open modal for both add and edit
    setTargetSlot(slotIndex);
    setIsModalOpen(true);
  };

  const handleContextMenu = (slotIndex: number, e: React.MouseEvent) => {
    setContextMenu({
      slotIndex,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleCountChange = (slotIndex: number, newCount: number) => {
    const item = slots[slotIndex];
    if (!item) return;

    // Determine container and slot mapping
    let containerIndex: number;
    let itemSlot: number;

    if (slotIndex >= 0 && slotIndex <= 8) {
      // Hotbar: container 0
      containerIndex = 0;
      itemSlot = slotIndex;
    } else {
      // Main inventory: container 1
      containerIndex = 1;
      itemSlot = slotIndex - 9;
    }

    updateItemBySlot(selectedPreset, containerIndex, itemSlot, {
      ...item,
      Count: newCount,
    });
  };

  const handleDelete = (slotIndex: number) => {
    // Determine container and slot mapping
    let containerIndex: number;
    let itemSlot: number;

    if (slotIndex >= 0 && slotIndex <= 8) {
      // Hotbar: container 0
      containerIndex = 0;
      itemSlot = slotIndex;
    } else {
      // Main inventory: container 1
      containerIndex = 1;
      itemSlot = slotIndex - 9;
    }

    updateItemBySlot(selectedPreset, containerIndex, itemSlot, null);
  };

  const handleMoveToSlot = (fromSlot: number, toSlot: number) => {
    const fromItem = slots[fromSlot];
    const toItem = slots[toSlot];

    // Determine container indices and slot mappings for both slots
    const getContainerAndSlot = (slotIndex: number) => {
      if (slotIndex >= 0 && slotIndex <= 8) {
        return { containerIndex: 0, itemSlot: slotIndex };
      } else {
        return { containerIndex: 1, itemSlot: slotIndex - 9 };
      }
    };

    const from = getContainerAndSlot(fromSlot);
    const to = getContainerAndSlot(toSlot);

    // Swap items
    if (fromItem) {
      updateItemBySlot(selectedPreset, to.containerIndex, to.itemSlot, {
        ...fromItem,
        Slot: to.itemSlot,
      });
    }

    if (toItem) {
      updateItemBySlot(selectedPreset, from.containerIndex, from.itemSlot, {
        ...toItem,
        Slot: from.itemSlot,
      });
    } else if (fromItem) {
      // Clear the from slot if there was no item at the to slot
      updateItemBySlot(selectedPreset, from.containerIndex, from.itemSlot, null);
    }
  };

  const renderSlot = (slotIndex: number) => {
    const item = slots[slotIndex];
    const isSelected = isModalOpen && targetSlot === slotIndex;

    return (
      <ItemSlot
        item={item}
        selected={isSelected}
        onClick={() => handleSlotClick(slotIndex)}
        onContextMenu={(e) => handleContextMenu(slotIndex, e)}
        slotType="normal"
      />
    );
  };

  return (
    <>
      {/* Minecraft Inventory Layout */}
      <div className="w-full">
        {/* Main inventory + Hotbar */}
        <div className="flex flex-col gap-6 w-auto overflow-x-auto">
          {/* Main Inventory (3 rows x 9 columns) */}
          <div className="flex flex-col gap-2 min-w-fit">
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
          <div className="flex gap-2 pt-6 border-t border-gray-300 dark:border-gray-600 min-w-fit">
            {Array.from({ length: 9 }).map((_, colIndex) => (
              <div key={colIndex}>
                {renderSlot(colIndex)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ItemEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTargetSlot(null);
        }}
        slotIndex={targetSlot}
      />

      {contextMenu && (
        <ItemSlotContextMenu
          item={slots[contextMenu.slotIndex]}
          slotIndex={contextMenu.slotIndex}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onEdit={() => {
            handleSlotClick(contextMenu.slotIndex);
            setContextMenu(null);
          }}
          onDelete={
            slots[contextMenu.slotIndex]
              ? () => {
                  handleDelete(contextMenu.slotIndex);
                  setContextMenu(null);
                }
              : undefined
          }
          onCountChange={(count) => handleCountChange(contextMenu.slotIndex, count)}
          onMoveToSlot={
            contextMenu.slotIndex >= 0 && contextMenu.slotIndex <= 8
              ? (targetSlot) => {
                  handleMoveToSlot(contextMenu.slotIndex, targetSlot);
                  setContextMenu(null);
                }
              : undefined
          }
          isHotbar={contextMenu.slotIndex >= 0 && contextMenu.slotIndex <= 8}
        />
      )}
    </>
  );
}
