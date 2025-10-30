import { useState, useEffect } from 'react';
import { Button, Input, Modal, MinecraftItemIcon } from '@mcsr-tools/ui';
import { useInventoryStore } from '../store/useInventoryStore';
import {
  getItemsForArmorSlot,
  getMaxStackSize,
  isStackable,
  getApplicableEnchantments,
  getEnchantmentInfo,
  type ArmorType
} from '@mcsr-tools/utils';
import {
  ITEM_CATEGORIES,
  getItemsByCategory,
  searchItems,
  formatItemName,
} from '../data/minecraftItems';
import type { ItemCategory, Enchantment } from '@mcsr-tools/types';

interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotIndex: number | null;
  filterByArmorSlot?: ArmorType;
}

export function ItemEditorModal({ isOpen, onClose, slotIndex, filterByArmorSlot }: ItemEditorModalProps) {
  const { presets, selectedPreset, updateItemBySlot, deleteItemBySlot } = useInventoryStore();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState(1);
  const [initialItemState, setInitialItemState] = useState<{ id: string; count: number } | null>(null);
  const [enchantments, setEnchantments] = useState<Enchantment[]>([]);

  // Helper function to find which category an item belongs to
  const findItemCategory = (itemId: string): ItemCategory => {
    for (const category of ITEM_CATEGORIES) {
      const items = getItemsByCategory(category.id);
      if (items.includes(itemId)) {
        return category.id;
      }
    }
    return 'all'; // Default fallback
  };

  // Get current item in the slot
  const getCurrentItem = () => {
    if (selectedPreset === null || slotIndex === null) return null;

    const preset = presets[selectedPreset];

    // Determine which container and slot based on UI slot number
    let targetContainer = 0;
    let targetSlot = slotIndex;

    if (slotIndex >= 0 && slotIndex <= 8) {
      // Hotbar: UI slots 0-8 → Container 0, slots 0-8
      targetContainer = 0;
      targetSlot = slotIndex;
    } else if (slotIndex >= 9 && slotIndex <= 35) {
      // Main Inventory: UI slots 9-35 → Container 1, slots 0-26
      targetContainer = 1;
      targetSlot = slotIndex - 9;
    } else if (slotIndex >= 36 && slotIndex <= 40) {
      // Armor & Offhand: UI slots 36-40 → Container 2, slots 36-40
      targetContainer = 2;
      targetSlot = slotIndex;
    }

    if (targetContainer >= preset.containers.length) return null;

    const container = preset.containers[targetContainer];
    return container.items.find(item => (item.Slot ?? 0) === targetSlot) || null;
  };

  const currentItem = getCurrentItem();
  const isEditMode = currentItem !== null;

  // Get items to display
  const items = filterByArmorSlot
    ? getItemsForArmorSlot(filterByArmorSlot)
    : (searchQuery
      ? searchItems(searchQuery)
      : getItemsByCategory(selectedCategory));

  // Get metadata for selected item
  const maxStackSize = selectedItemId ? getMaxStackSize(selectedItemId) : 64;
  const stackable = selectedItemId ? isStackable(selectedItemId) : true;

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentItem) {
        // Edit mode - load current item and switch to its category
        setSelectedItemId(currentItem.id);
        setItemCount(currentItem.Count);
        setInitialItemState({ id: currentItem.id, count: currentItem.Count });
        setEnchantments(currentItem.tag?.Enchantments || []);

        // Find and set the category of the current item
        if (!filterByArmorSlot) {
          const itemCategory = findItemCategory(currentItem.id);
          setSelectedCategory(itemCategory);
        }
      } else {
        // Add mode - reset
        setSelectedItemId(null);
        setItemCount(1);
        setInitialItemState(null);
        setSelectedCategory('all');
        setEnchantments([]);
      }
      setSearchQuery('');
    }
  }, [isOpen, currentItem]);

  // Reset item count when selected item changes
  useEffect(() => {
    if (selectedItemId && selectedItemId !== initialItemState?.id) {
      const newMaxStackSize = getMaxStackSize(selectedItemId);
      if (itemCount > newMaxStackSize) {
        setItemCount(newMaxStackSize);
      } else if (!isStackable(selectedItemId)) {
        setItemCount(1);
      }
    }
  }, [selectedItemId]);

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleSave = () => {
    if (!selectedItemId || selectedPreset === null || slotIndex === null) return;

    // Determine which container and slot based on UI slot number
    let targetContainer = 0;
    let targetSlot = slotIndex;

    if (slotIndex >= 0 && slotIndex <= 8) {
      // Hotbar: UI slots 0-8 → Container 0, slots 0-8
      targetContainer = 0;
      targetSlot = slotIndex;
    } else if (slotIndex >= 9 && slotIndex <= 35) {
      // Main Inventory: UI slots 9-35 → Container 1, slots 0-26
      targetContainer = 1;
      targetSlot = slotIndex - 9;
    } else if (slotIndex >= 36 && slotIndex <= 40) {
      // Armor & Offhand: UI slots 36-40 → Container 2, slots 36-40
      targetContainer = 2;
      targetSlot = slotIndex;
    }

    // Save the item (updateItemBySlot handles both add and update, and creates containers if needed)
    const existingItem = currentItem;
    updateItemBySlot(selectedPreset, targetContainer, targetSlot, {
      id: selectedItemId,
      Count: itemCount,
      Slot: targetSlot,
      tag: enchantments.length > 0
        ? {
            ...existingItem?.tag,
            Enchantments: enchantments,
          }
        : existingItem?.tag,
    });

    handleClose();
  };

  const handleDelete = () => {
    if (!isEditMode || selectedPreset === null || slotIndex === null) return;

    if (confirm('このアイテムを削除しますか？')) {
      // Determine which container and slot based on UI slot number
      let targetContainer = 0;
      let targetSlot = slotIndex;

      if (slotIndex >= 0 && slotIndex <= 8) {
        // Hotbar: UI slots 0-8 → Container 0, slots 0-8
        targetContainer = 0;
        targetSlot = slotIndex;
      } else if (slotIndex >= 9 && slotIndex <= 35) {
        // Main Inventory: UI slots 9-35 → Container 1, slots 0-26
        targetContainer = 1;
        targetSlot = slotIndex - 9;
      } else if (slotIndex >= 36 && slotIndex <= 40) {
        // Armor & Offhand: UI slots 36-40 → Container 2, slots 36-40
        targetContainer = 2;
        targetSlot = slotIndex;
      }

      const preset = presets[selectedPreset];
      if (targetContainer < preset.containers.length) {
        deleteItemBySlot(selectedPreset, targetContainer, targetSlot);
      }

      handleClose();
    }
  };

  const handleClose = () => {
    // Rollback to initial state (modal just closes, no changes persisted)
    setSearchQuery('');
    setItemCount(1);
    setSelectedItemId(null);
    setInitialItemState(null);
    onClose();
  };

  const modalTitle = filterByArmorSlot
    ? `装備選択 (${filterByArmorSlot === 'helmet' ? 'ヘルメット' : filterByArmorSlot === 'chestplate' ? 'チェストプレート' : filterByArmorSlot === 'leggings' ? 'レギンス' : 'ブーツ'})`
    : (isEditMode ? 'アイテム編集' : 'アイテム追加');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="xl">
      <div className="space-y-4">
        {/* Search - hide when filtering by armor slot */}
        {!filterByArmorSlot && (
          <div>
            <Input
              type="text"
              placeholder="アイテムを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className={`grid ${filterByArmorSlot ? 'grid-cols-1' : 'grid-cols-12'} gap-4`}>
          {/* Category Tabs - hide when filtering by armor slot */}
          {!filterByArmorSlot && (
            <div className="col-span-3">
              <div className="text-sm font-medium text-secondary mb-2">カテゴリ</div>
              <div className="space-y-1 max-h-[280px] overflow-y-auto">
                {ITEM_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-secondary'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Item Grid */}
          <div className={filterByArmorSlot ? 'col-span-1' : 'col-span-9'}>
            {!filterByArmorSlot && (
              <div className="text-sm font-medium text-secondary mb-2">
                {searchQuery ? `検索結果: "${searchQuery}"` : ITEM_CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </div>
            )}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-[280px] overflow-y-auto">
              <div className="grid grid-cols-6 gap-2">
                {items.map((itemId) => (
                  <button
                    key={itemId}
                    onClick={() => handleItemClick(itemId)}
                    className={`aspect-square p-2 rounded-lg border-2 transition-colors flex flex-col items-center justify-center gap-1 ${
                      selectedItemId === itemId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-800'
                    }`}
                    title={formatItemName(itemId)}
                  >
                    <MinecraftItemIcon
                      itemId={itemId}
                      size={48}
                    />
                    <div className="text-xs text-center text-secondary break-all line-clamp-1">
                      {formatItemName(itemId)}
                    </div>
                  </button>
                ))}
              </div>
              {items.length === 0 && (
                <div className="text-center text-secondary py-8">
                  アイテムが見つかりません
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Item count - always show */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              数量 {selectedItemId && !stackable && <span className="text-xs text-secondary">(スタック不可)</span>}
            </label>

            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max={maxStackSize}
                value={itemCount}
                onChange={(e) => setItemCount(parseInt(e.target.value))}
                disabled={!selectedItemId || !stackable}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max={maxStackSize}
                  value={itemCount}
                  onChange={(e) => setItemCount(Math.max(1, Math.min(maxStackSize, parseInt(e.target.value) || 1)))}
                  disabled={!selectedItemId || !stackable}
                  className="w-20"
                />
                <span className="text-sm text-secondary">/ {maxStackSize}</span>
              </div>
            </div>
          </div>

          {/* Enchantments Section - show only for enchantable items */}
          {selectedItemId && getApplicableEnchantments(selectedItemId).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-primary">
                  エンチャント
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEnchantments([
                      ...enchantments,
                      { id: getApplicableEnchantments(selectedItemId)[0], lvl: 1 },
                    ]);
                  }}
                >
                  + 追加
                </Button>
              </div>

              {enchantments.length === 0 ? (
                <div className="text-sm text-secondary text-center py-3 bg-gray-50 dark:bg-gray-800 rounded">
                  エンチャントなし
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {enchantments.map((ench, index) => {
                    const applicableEnchs = getApplicableEnchantments(selectedItemId);
                    const enchInfo = getEnchantmentInfo(ench.id);
                    const maxLevel = enchInfo?.maxLevel || 5;

                    return (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <select
                          value={ench.id}
                          onChange={(e) => {
                            const newEnchs = [...enchantments];
                            newEnchs[index].id = e.target.value;
                            setEnchantments(newEnchs);
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-primary"
                        >
                          {applicableEnchs.map((enchId) => (
                            <option key={enchId} value={enchId}>
                              {getEnchantmentInfo(enchId)?.name || enchId}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          max={maxLevel}
                          value={ench.lvl}
                          onChange={(e) => {
                            const newEnchs = [...enchantments];
                            newEnchs[index].lvl = Math.max(1, Math.min(maxLevel, parseInt(e.target.value) || 1));
                            setEnchantments(newEnchs);
                          }}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-primary"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEnchantments(enchantments.filter((_, i) => i !== index));
                          }}
                          className="hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600"
                        >
                          削除
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-6">
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>

            {isEditMode && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleDelete}
                  className="flex-1 hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600"
                >
                  削除
                </Button>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
              </>
            )}

            <Button onClick={handleSave} disabled={!selectedItemId} className="flex-1">
              {isEditMode ? '保存' : '追加'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
