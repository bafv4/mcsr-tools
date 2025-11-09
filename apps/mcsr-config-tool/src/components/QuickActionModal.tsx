import { useState } from 'react';
import { Button, Select } from '@mcsr-tools/ui';
import { useConfigStore } from '../store/useConfigStore';
import { gameActions, categoryLabels } from '../constants/gameActions';
import { toMinecraftKey } from '../constants/keyboardLayouts';
import type { PhysicalKey, GameAction } from '../types';

interface QuickActionModalProps {
  physicalKey: PhysicalKey;
  onClose: () => void;
}

export function QuickActionModal({ physicalKey, onClose }: QuickActionModalProps) {
  const keyConfigs = useConfigStore((state) => state.keyConfigs);
  const setKeyBinding = useConfigStore((state) => state.setKeyBinding);

  const currentConfig = keyConfigs.get(physicalKey);
  const [selectedAction, setSelectedAction] = useState<GameAction | ''>(
    currentConfig?.binding?.action || ''
  );

  // Calculate the effective key (after AHK remap)
  const effectiveKey = currentConfig?.ahkRemap?.to || physicalKey;
  const hasRemap = currentConfig?.ahkRemap && !currentConfig.ahkRemap.disabled;

  const handleSave = () => {
    if (selectedAction) {
      setKeyBinding(physicalKey, {
        action: selectedAction,
        key: toMinecraftKey(effectiveKey),
      });
    } else {
      // Remove binding
      setKeyBinding(physicalKey, undefined);
    }
    onClose();
  };

  const handleRemove = () => {
    setKeyBinding(physicalKey, undefined);
    onClose();
  };

  // Group actions by category
  const actionsByCategory = gameActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, typeof gameActions>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[500px] h-[400px] mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-primary">操作割り当て</h3>
          <p className="text-sm text-secondary mt-1">
            物理キー: <span className="font-mono font-bold">{physicalKey.toUpperCase()}</span>
            {hasRemap && (
              <>
                {' → '}
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {effectiveKey.toUpperCase()}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
          {/* Warning if remapped */}
          {hasRemap && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                ℹ️ このキーはリマップされています。StandardSettingsには「{effectiveKey.toUpperCase()}」として設定されます。
              </p>
            </div>
          )}

          {/* Action selection */}
          <div>
            <label className="label-base">割り当てる操作</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value as GameAction)}
              className="select-base"
            >
              <option value="">（なし）</option>
              {Object.entries(actionsByCategory).map(([category, actions]) => (
                <optgroup key={category} label={categoryLabels[category]}>
                  {actions.map((action) => (
                    <option key={action.action} value={action.action}>
                      {action.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Preview */}
          {selectedAction && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                StandardSettings出力プレビュー:
              </p>
              <code className="text-xs text-gray-600 dark:text-gray-400 block font-mono">
                "key_{selectedAction}": "{toMinecraftKey(effectiveKey)}"
              </code>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between flex-shrink-0">
          <div>
            {currentConfig?.binding && (
              <Button variant="outline" size="sm" onClick={handleRemove}>
                割り当て解除
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              キャンセル
            </Button>
            <Button size="sm" onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
