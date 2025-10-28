import { useState, useEffect } from 'react';
import { Button, Input } from '@mcsr-tools/ui';
import { useInventoryStore } from '../store/useInventoryStore';
import { formatItemName } from '../data/minecraftItems';

export function ItemEditor() {
  const { presets, selectedPreset, selectedContainer, selectedItem, updateItem, deleteItem } = useInventoryStore();

  const [itemId, setItemId] = useState('');
  const [itemCount, setItemCount] = useState(1);

  const item = selectedPreset !== null && selectedContainer !== null && selectedItem !== null
    ? presets[selectedPreset]?.containers[selectedContainer]?.items[selectedItem.itemIndex]
    : null;

  useEffect(() => {
    if (item) {
      setItemId(item.id);
      setItemCount(item.Count);
    }
  }, [item]);

  if (!item || selectedPreset === null || selectedContainer === null || selectedItem === null) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-secondary text-center">
          アイテムを選択して編集してください
        </p>
      </div>
    );
  }

  const handleSave = () => {
    updateItem(selectedPreset, selectedContainer, selectedItem.itemIndex, {
      id: itemId,
      Count: itemCount,
      Slot: item.Slot,
      tag: item.tag,
    });
    alert('アイテムを更新しました');
  };

  const handleDelete = () => {
    if (confirm('このアイテムを削除しますか？')) {
      deleteItem(selectedPreset, selectedContainer, selectedItem.itemIndex);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-primary mb-4">アイテム編集</h2>

      <div className="space-y-4">
        {/* Item ID */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            アイテムID
          </label>
          <Input
            type="text"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            placeholder="minecraft:iron_pickaxe"
            className="w-full font-mono text-sm"
          />
          <p className="text-xs text-secondary mt-1">
            {formatItemName(itemId)}
          </p>
        </div>

        {/* Item Count */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            数量
          </label>
          <Input
            type="number"
            min="1"
            max="64"
            value={itemCount}
            onChange={(e) => setItemCount(Math.max(1, Math.min(64, parseInt(e.target.value) || 1)))}
            className="w-full"
          />
        </div>

        {/* Slot Number (read-only) */}
        {item.Slot !== undefined && (
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              スロット番号
            </label>
            <Input
              type="number"
              value={item.Slot}
              disabled
              className="w-full bg-gray-100 dark:bg-gray-700"
            />
          </div>
        )}

        {/* NBT Tag Info */}
        {item.tag && (
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              NBTタグ
            </label>
            <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 text-xs font-mono overflow-auto max-h-32">
              <pre className="text-secondary">
                {JSON.stringify(item.tag, null, 2)}
              </pre>
            </div>
            <p className="text-xs text-secondary mt-1">
              NBTタグの編集は今後実装予定です
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={handleSave} className="flex-1">
            保存
          </Button>
          <Button variant="secondary" onClick={handleDelete} className="flex-1">
            削除
          </Button>
        </div>
      </div>
    </div>
  );
}
