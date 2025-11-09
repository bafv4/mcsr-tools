import { useState, useEffect } from 'react';
import { Button } from '@mcsr-tools/ui';
import { useConfigStore } from '../store/useConfigStore';
import { gameActions, categoryLabels } from '../constants/gameActions';
import { toMinecraftKey, getAllAvailableKeys } from '../constants/keyboardLayouts';
import type { PhysicalKey, GameAction, AHKRemap } from '../types';

interface KeyRemapModalProps {
  physicalKey: PhysicalKey;
  onClose: () => void;
}

type RemapMode = 'none' | 'remap' | 'disable';

export function KeyRemapModal({ physicalKey, onClose }: KeyRemapModalProps) {
  const keyConfigs = useConfigStore((state) => state.keyConfigs);
  const setAHKRemap = useConfigStore((state) => state.setAHKRemap);
  const setKeyBinding = useConfigStore((state) => state.setKeyBinding);
  const removeKeyConfig = useConfigStore((state) => state.removeKeyConfig);

  const currentConfig = keyConfigs.get(physicalKey);

  // Initialize state
  const [remapMode, setRemapMode] = useState<RemapMode>(
    currentConfig?.ahkRemap?.disabled
      ? 'disable'
      : currentConfig?.ahkRemap
        ? 'remap'
        : 'none'
  );
  const [remapTarget, setRemapTarget] = useState<PhysicalKey>(
    currentConfig?.ahkRemap?.to || ''
  );
  const [selectedAction, setSelectedAction] = useState<GameAction | ''>(
    currentConfig?.binding?.action || ''
  );
  const [isListeningForKey, setIsListeningForKey] = useState(false);

  // Get all available keys grouped by category
  const availableKeys = getAllAvailableKeys();
  const keysByCategory = availableKeys.reduce(
    (acc, key) => {
      if (!acc[key.category]) {
        acc[key.category] = [];
      }
      acc[key.category].push(key);
      return acc;
    },
    {} as Record<string, typeof availableKeys>
  );

  // Listen for keyboard shortcuts
  useEffect(() => {
    if (!isListeningForKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Map keyboard event to physical key
      let key = e.key.toLowerCase();

      // Handle special keys
      if (e.code === 'Space') key = 'space';
      else if (e.code === 'Enter') key = 'enter';
      else if (e.code === 'Escape') {
        setIsListeningForKey(false);
        return;
      } else if (e.code.startsWith('Key')) key = e.code.substring(3).toLowerCase();
      else if (e.code.startsWith('Digit')) key = e.code.substring(5);
      else if (e.code.startsWith('Numpad')) {
        const numpadKey = e.code.substring(6).toLowerCase();
        if (numpadKey === 'add') key = 'numpad.add';
        else if (numpadKey === 'subtract') key = 'numpad.subtract';
        else if (numpadKey === 'multiply') key = 'numpad.multiply';
        else if (numpadKey === 'divide') key = 'numpad.divide';
        else if (numpadKey === 'decimal') key = 'numpad.decimal';
        else if (numpadKey === 'enter') key = 'numpad.enter';
        else key = `numpad.${numpadKey}`;
      } else if (e.code.startsWith('Arrow')) key = e.code.substring(5).toLowerCase();
      else if (e.code.startsWith('F')) key = e.code.toLowerCase();
      else if (e.code === 'ShiftLeft') key = 'left.shift';
      else if (e.code === 'ShiftRight') key = 'right.shift';
      else if (e.code === 'ControlLeft') key = 'left.control';
      else if (e.code === 'ControlRight') key = 'right.control';
      else if (e.code === 'AltLeft') key = 'left.alt';
      else if (e.code === 'AltRight') key = 'right.alt';
      else if (e.code === 'MetaLeft') key = 'left.win';
      else if (e.code === 'MetaRight') key = 'right.win';
      else if (e.code === 'Backspace') key = 'backspace';
      else if (e.code === 'Tab') key = 'tab';
      else if (e.code === 'CapsLock') key = 'caps.lock';
      else if (e.code === 'Insert') key = 'insert';
      else if (e.code === 'Delete') key = 'delete';
      else if (e.code === 'Home') key = 'home';
      else if (e.code === 'End') key = 'end';
      else if (e.code === 'PageUp') key = 'page.up';
      else if (e.code === 'PageDown') key = 'page.down';
      else if (e.code === 'NumLock') key = 'numlock';
      else if (e.code === 'ContextMenu') key = 'menu';
      else if (e.code === 'Backquote') key = 'grave.accent';
      else if (e.code === 'Minus') key = 'minus';
      else if (e.code === 'Equal') key = 'equal';
      else if (e.code === 'BracketLeft') key = 'left.bracket';
      else if (e.code === 'BracketRight') key = 'right.bracket';
      else if (e.code === 'Backslash') key = 'backslash';
      else if (e.code === 'Semicolon') key = 'semicolon';
      else if (e.code === 'Quote') key = 'apostrophe';
      else if (e.code === 'Comma') key = 'comma';
      else if (e.code === 'Period') key = 'period';
      else if (e.code === 'Slash') key = 'slash';

      setRemapTarget(key);
      setIsListeningForKey(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListeningForKey]);

  // Calculate the effective key (after AHK remap)
  const getEffectiveKey = (): PhysicalKey => {
    if (remapMode === 'disable') return '';
    if (remapMode === 'remap' && remapTarget) return remapTarget;
    return physicalKey;
  };

  const effectiveKey = getEffectiveKey();

  const handleSave = () => {
    // Save AHK remap
    if (remapMode === 'none') {
      setAHKRemap(physicalKey, undefined);
    } else if (remapMode === 'disable') {
      setAHKRemap(physicalKey, {
        from: physicalKey,
        to: null,
        disabled: true,
      });
    } else if (remapMode === 'remap' && remapTarget) {
      setAHKRemap(physicalKey, {
        from: physicalKey,
        to: remapTarget,
        disabled: false,
      });
    }

    // Save key binding
    if (selectedAction && effectiveKey) {
      setKeyBinding(physicalKey, {
        action: selectedAction,
        key: toMinecraftKey(effectiveKey),
      });
    } else {
      setKeyBinding(physicalKey, undefined);
    }

    onClose();
  };

  const handleRemoveAll = () => {
    removeKeyConfig(physicalKey);
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

  const hasAnyConfig = currentConfig?.ahkRemap || currentConfig?.binding;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[700px] h-[600px] mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-primary">キー設定</h3>
          <p className="text-sm text-secondary mt-1">
            物理キー: <span className="font-mono font-bold">{physicalKey.toUpperCase()}</span>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-6">
          {/* AHK Remap Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-primary">AutoHotKey リマップ設定</h4>

            <div className="space-y-2">
              {/* No remap */}
              <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="remapMode"
                  checked={remapMode === 'none'}
                  onChange={() => setRemapMode('none')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <span className="text-primary font-medium">リマップしない</span>
                  <p className="text-xs text-secondary">このキーはそのまま使用されます</p>
                </div>
              </label>

              {/* Remap to another key */}
              <label className="flex items-start gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="remapMode"
                  checked={remapMode === 'remap'}
                  onChange={() => setRemapMode('remap')}
                  className="w-4 h-4 mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <span className="text-primary font-medium">別のキーにリマップ</span>
                    <p className="text-xs text-secondary">
                      このキーを押すと、別のキーが入力されます
                    </p>
                  </div>
                  {remapMode === 'remap' && (
                    <div className="space-y-2">
                      <label className="text-xs text-secondary mb-1 block">リマップ先のキー:</label>
                      <div className="flex gap-2">
                        <select
                          value={remapTarget}
                          onChange={(e) => setRemapTarget(e.target.value)}
                          className="select-base text-sm flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">（選択してください）</option>
                          {Object.entries(keysByCategory).map(([category, keys]) => (
                            <optgroup key={category} label={category}>
                              {keys.map((keyInfo) => (
                                <option key={keyInfo.key} value={keyInfo.key}>
                                  {keyInfo.label} ({keyInfo.key})
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <Button
                          type="button"
                          size="sm"
                          variant={isListeningForKey ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsListeningForKey(!isListeningForKey);
                          }}
                        >
                          {isListeningForKey ? 'キー入力待機中...' : 'キー押下で設定'}
                        </Button>
                      </div>
                      {isListeningForKey && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          ℹ️ リマップ先にしたいキーを押してください（ESCでキャンセル）
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {/* Disable key */}
              <label className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="remapMode"
                  checked={remapMode === 'disable'}
                  onChange={() => setRemapMode('disable')}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <span className="text-primary font-medium">キーを無効化</span>
                  <p className="text-xs text-secondary">このキーを押しても何も入力されません</p>
                </div>
              </label>
            </div>
          </div>

          {/* Key Binding Section */}
          {remapMode !== 'disable' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">ゲーム内操作割り当て</h4>

              {remapMode === 'remap' && remapTarget && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    ℹ️ StandardSettingsには「
                    <span className="font-mono font-bold">{remapTarget.toUpperCase()}</span>
                    」として設定されます
                  </p>
                </div>
              )}

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
            </div>
          )}

          {/* Preview Section */}
          {(remapMode !== 'none' || selectedAction) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">出力プレビュー</h4>

              {/* AHK Preview */}
              {remapMode !== 'none' && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AutoHotKey:
                  </p>
                  <code className="text-xs text-gray-600 dark:text-gray-400 block font-mono">
                    {remapMode === 'disable'
                      ? `${physicalKey}:: Return`
                      : `${physicalKey}:: ${remapTarget}`}
                  </code>
                </div>
              )}

              {/* StandardSettings Preview */}
              {selectedAction && effectiveKey && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    StandardSettings:
                  </p>
                  <code className="text-xs text-gray-600 dark:text-gray-400 block font-mono">
                    "key_{selectedAction}": "{toMinecraftKey(effectiveKey)}"
                  </code>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between flex-shrink-0">
          <div>
            {hasAnyConfig && (
              <Button variant="outline" size="sm" onClick={handleRemoveAll}>
                すべて削除
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={remapMode === 'remap' && !remapTarget}
            >
              保存
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
