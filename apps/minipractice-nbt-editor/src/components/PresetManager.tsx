import { useState } from 'react';
import { MinecraftItemIcon } from '@mcsr-tools/ui';
import { useInventoryStore } from '../store/useInventoryStore';
import { Tooltip } from './Tooltip';

interface PresetManagerProps {
  onSelectPreset: (slotIndex: number) => void;
  onPresetNameChange: (name: string) => void;
}

interface PresetSlotItem {
  slotIndex: number;
  itemId: string;
  count: number;
  displayName?: string;
  rawItem: any;
}

interface ContextMenuState {
  slotIndex: number;
  position: { x: number; y: number };
}

export function PresetManager({ onSelectPreset, onPresetNameChange }: PresetManagerProps) {
  const { rawNBTData, selectedPreset, updateRawNBTData } = useInventoryStore();
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  /**
   * Extract all 9 preset items from slot 0 in raw NBT data
   */
  const getPresetSlotItems = (): (PresetSlotItem | null)[] => {
    const slots: (PresetSlotItem | null)[] = Array(9).fill(null);

    if (!rawNBTData?.['0']) {
      return slots;
    }

    const slot0Items = rawNBTData['0'];
    if (!Array.isArray(slot0Items)) {
      return slots;
    }

    slot0Items.forEach((item: any, index: number) => {
      if (index >= 9) return;

      const itemId = item?.id || 'minecraft:air';
      const count = item?.Count || 1;
      const displayName = item?.tag?.display?.Name;

      if (itemId !== 'minecraft:air') {
        slots[index] = {
          slotIndex: index,
          itemId,
          count,
          displayName,
          rawItem: item,
        };
      }
    });

    return slots;
  };

  const presetSlotItems = getPresetSlotItems();

  /**
   * Extract preset name from barrel display name
   */
  const getPresetName = (item: PresetSlotItem | null): string => {
    if (!item?.displayName) return '';

    try {
      const parsed = JSON.parse(item.displayName);
      return parsed.text || item.displayName;
    } catch {
      return item.displayName;
    }
  };

  /**
   * Check if item is protected (shulker box or command block)
   */
  const isProtectedItem = (item: PresetSlotItem | null): boolean => {
    if (!item) return false;
    return item.itemId === 'minecraft:shulker_box' || item.itemId === 'minecraft:command_block';
  };

  /**
   * Check if item is a barrel
   */
  const isBarrel = (item: PresetSlotItem | null): boolean => {
    return item?.itemId === 'minecraft:barrel';
  };

  /**
   * Handle preset selection or adding barrel on empty slot
   */
  const handleSelect = (index: number) => {
    const item = presetSlotItems[index];

    // If slot is empty, add a barrel directly at that position
    if (!item) {
      addBarrelAtPosition(index);
      return;
    }

    // Don't allow selection of protected items (shulker box, command block)
    if (isProtectedItem(item)) {
      return;
    }

    // Otherwise, select the preset
    onSelectPreset(index);
    const name = getPresetName(item);
    onPresetNameChange(name);
  };

  /**
   * Handle context menu opening
   */
  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({
      slotIndex: index,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  /**
   * Close context menu
   */
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  /**
   * Create a new barrel with proper container structure
   */
  const createNewBarrel = () => {
    return {
      id: 'minecraft:barrel',
      Count: 1,
      tag: {
        display: {
          Name: JSON.stringify({ text: 'New Preset' })
        },
        BlockEntityTag: {
          Items: [
            // Container 0: Hotbar (9 slots)
            {
              id: 'minecraft:chest',
              Count: 1,
              Slot: 0,
              tag: {
                BlockEntityTag: {
                  Items: []
                }
              }
            },
            // Container 1: Main Inventory (27 slots)
            {
              id: 'minecraft:chest',
              Count: 1,
              Slot: 1,
              tag: {
                BlockEntityTag: {
                  Items: []
                }
              }
            }
          ]
        }
      }
    };
  };

  /**
   * Add barrel directly at the specified position (for empty slot clicks)
   */
  const addBarrelAtPosition = (position: number) => {
    if (!rawNBTData?.['0']) return;

    // Double-check that we're not overwriting a protected item
    const existingItem = presetSlotItems[position];
    if (isProtectedItem(existingItem)) {
      console.warn('Attempted to add barrel over protected item');
      return;
    }

    const newBarrel = createNewBarrel();
    const slot0Items = [...rawNBTData['0']];
    slot0Items[position] = newBarrel;

    const newRawData = JSON.parse(JSON.stringify(rawNBTData));
    newRawData['0'] = slot0Items;
    updateRawNBTData(newRawData);

    onSelectPreset(position);
    onPresetNameChange('New Preset');
  };

  /**
   * Add new barrel preset (for context menu - inserts after specified index)
   */
  const handleAddBarrel = (afterIndex: number) => {
    if (!rawNBTData?.['0']) return;

    const newBarrel = createNewBarrel();
    const slot0Items = [...rawNBTData['0']];
    slot0Items.splice(afterIndex + 1, 0, newBarrel);

    while (slot0Items.length < 9) {
      slot0Items.push({
        id: 'minecraft:air',
        Count: 1
      });
    }

    const newRawData = JSON.parse(JSON.stringify(rawNBTData));
    newRawData['0'] = slot0Items.slice(0, 9);
    updateRawNBTData(newRawData);

    onSelectPreset(afterIndex + 1);
    onPresetNameChange('New Preset');
    setContextMenu(null);
  };

  /**
   * Delete preset (replace with air)
   */
  const handleDeletePreset = (index: number) => {
    const item = presetSlotItems[index];

    if (isProtectedItem(item)) {
      alert('シュルカーボックスとコマンドブロックは削除できません。');
      setContextMenu(null);
      return;
    }

    if (!confirm('このプリセットを削除してもよろしいですか？')) {
      setContextMenu(null);
      return;
    }

    if (!rawNBTData?.['0']) return;

    const slot0Items = [...rawNBTData['0']];
    slot0Items[index] = {
      id: 'minecraft:air',
      Count: 1
    };

    const newRawData = JSON.parse(JSON.stringify(rawNBTData));
    newRawData['0'] = slot0Items;
    updateRawNBTData(newRawData);

    setContextMenu(null);
  };

  /**
   * Move preset to target slot (swap)
   */
  const handleMoveToSlot = (fromIndex: number, toIndex: number) => {
    if (!rawNBTData?.['0']) return;

    const slot0Items = [...rawNBTData['0']];
    const temp = slot0Items[fromIndex];
    slot0Items[fromIndex] = slot0Items[toIndex];
    slot0Items[toIndex] = temp;

    const newRawData = JSON.parse(JSON.stringify(rawNBTData));
    newRawData['0'] = slot0Items;
    updateRawNBTData(newRawData);

    if (selectedPreset === fromIndex) {
      onSelectPreset(toIndex);
    } else if (selectedPreset === toIndex) {
      onSelectPreset(fromIndex);
    }

    setContextMenu(null);
  };

  return (
    <div>
      {/* Preset Slots (9 slots) */}
      <div className="flex gap-2 mb-6">
        {presetSlotItems.map((item, index) => {
          const isSelected = selectedPreset === index;
          const isEmpty = !item;
          const isProtected = isProtectedItem(item);
          const presetName = getPresetName(item);

          // Get item display name
          const itemName = item?.itemId?.replace('minecraft:', '');
          const tooltipContent = isProtected ? itemName : presetName || itemName;

          return (
            <div key={index} className="relative">
              <Tooltip content={tooltipContent}>
                <button
                  onClick={() => handleSelect(index)}
                  onContextMenu={(e) => handleContextMenu(e, index)}
                  className={`
                    relative w-20 h-20 rounded-lg border-2 transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    }
                    ${!isEmpty && !isProtected ? 'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md' : ''}
                    ${isProtected ? 'cursor-context-menu' : 'cursor-pointer'}
                  `}
                >
                {/* Empty slot placeholder */}
                {isEmpty && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 text-gray-400 dark:text-gray-500">
                    <span className="text-3xl">+</span>
                  </div>
                )}

                {/* Item content */}
                {!isEmpty && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <MinecraftItemIcon itemId={item.itemId} size={64} />

                    {/* Item count */}
                    {item.count > 1 && (
                      <div
                        className="absolute bottom-0.5 right-0.5 text-xl font-bold text-white"
                        style={{
                          textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000'
                        }}
                      >
                        {item.count}
                      </div>
                    )}
                  </div>
                )}
                </button>
              </Tooltip>

              {/* Preset name display */}
              {presetName && (
                <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 w-24">
                  <div className="text-xs text-gray-700 dark:text-gray-200 font-semibold text-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded truncate">
                    {presetName}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (() => {
        const MENU_HEIGHT = 420;
        const MENU_WIDTH = 270;
        const MARGIN = 10;

        // Calculate if menu should open upwards
        const spaceBelow = window.innerHeight - contextMenu.position.y;
        const shouldOpenUpwards = spaceBelow < MENU_HEIGHT && contextMenu.position.y > MENU_HEIGHT;

        let top = contextMenu.position.y;
        if (shouldOpenUpwards) {
          top = Math.max(MARGIN, contextMenu.position.y - MENU_HEIGHT);
        } else {
          top = Math.min(Math.max(MARGIN, contextMenu.position.y), window.innerHeight - MENU_HEIGHT);
        }

        const left = Math.min(Math.max(MARGIN, contextMenu.position.x), window.innerWidth - MENU_WIDTH);

        return (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={handleCloseContextMenu}
            />
            <div
              className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 min-w-[240px] max-w-[260px]"
              style={{
                left: `${left}px`,
                top: `${top}px`,
              }}
            >
            {/* Add Barrel Button - only for empty slots and barrels */}
            {!isProtectedItem(presetSlotItems[contextMenu.slotIndex]) &&
             !isBarrel(presetSlotItems[contextMenu.slotIndex]) && (
              <div className="mb-4">
                <button
                  onClick={() => handleAddBarrel(contextMenu.slotIndex)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  + 樽を追加
                </button>
              </div>
            )}

            {/* Delete Button - only for barrels */}
            {isBarrel(presetSlotItems[contextMenu.slotIndex]) && (
              <div className="mb-4">
                <button
                  onClick={() => handleDeletePreset(contextMenu.slotIndex)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  削除
                </button>
              </div>
            )}

            {/* Reorder Tool - show for all items (including protected ones) */}
            {presetSlotItems[contextMenu.slotIndex] && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  移動先 (ホットバー)
                </label>
                <div className="grid grid-cols-9 gap-1">
                  {Array.from({ length: 9 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i !== contextMenu.slotIndex) {
                          handleMoveToSlot(contextMenu.slotIndex, i);
                        }
                      }}
                      disabled={i === contextMenu.slotIndex}
                      className={`
                        w-full aspect-square rounded border text-sm font-medium transition-colors
                        ${i === contextMenu.slotIndex
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
          </>
        );
      })()}
    </div>
  );
}
