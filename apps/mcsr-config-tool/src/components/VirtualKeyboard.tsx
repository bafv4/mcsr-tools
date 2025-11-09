import { useState } from 'react';
import { useConfigStore } from '../store/useConfigStore';
import {
  usKeyboardLayout,
  jisKeyboardLayout,
  numpadLayout,
  navigationKeys,
  arrowKeys,
  type KeyLayoutInfo,
  type KeyboardLayoutType,
} from '../constants/keyboardLayouts';
import type { PhysicalKey } from '../types';
import { getActionLabel } from '../constants/gameActions';

interface VirtualKeyboardProps {
  onKeyClick: (key: PhysicalKey) => void;
  onKeyRightClick: (key: PhysicalKey) => void;
}

export function VirtualKeyboard({ onKeyClick, onKeyRightClick }: VirtualKeyboardProps) {
  const keyConfigs = useConfigStore((state) => state.keyConfigs);
  const duplicateWarnings = useConfigStore((state) => state.duplicateWarnings);

  const [layoutType, setLayoutType] = useState<KeyboardLayoutType>('us');
  const [showNumpad, setShowNumpad] = useState(true);

  // Get list of keys that are involved in duplicates
  const duplicateKeys = new Set<PhysicalKey>();
  duplicateWarnings.forEach((warning) => {
    warning.sourceKeys.forEach((key) => duplicateKeys.add(key));
  });

  const layout = layoutType === 'us' ? usKeyboardLayout : jisKeyboardLayout;

  const renderKey = (keyInfo: KeyLayoutInfo, gridStyles?: React.CSSProperties) => {
    const config = keyConfigs.get(keyInfo.key);
    const baseWidth = 70;
    const gap = 4; // gap-1 = 4px
    const width = (keyInfo.width || 1) * baseWidth + Math.max(0, (keyInfo.width || 1) - 1) * gap;

    // Determine what to display on the key
    const hasRemap = config?.ahkRemap && !config.ahkRemap.disabled;
    const isDisabled = config?.ahkRemap?.disabled;
    const hasBinding = config?.binding;
    const isDuplicate = duplicateKeys.has(keyInfo.key);

    // Calculate final input key (after remap)
    const finalKey = hasRemap ? config.ahkRemap.to : keyInfo.key;
    const displayRemap = hasRemap ? `→ ${config.ahkRemap.to?.toUpperCase()}` : '';

    // Action label
    const actionLabel = hasBinding ? getActionLabel(config.binding.action) : '';

    return (
      <button
        key={keyInfo.key}
        onClick={() => onKeyClick(keyInfo.key)}
        onContextMenu={(e) => {
          e.preventDefault();
          onKeyRightClick(keyInfo.key);
        }}
        className={`
          relative inline-flex flex-col items-center justify-center
          h-16 px-1 rounded border-2 transition-all text-xs
          ${
            isDuplicate
              ? 'bg-red-100 dark:bg-red-900/40 border-red-600 dark:border-red-400 ring-2 ring-red-500'
              : isDisabled
                ? 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-500 cursor-not-allowed opacity-60'
                : hasRemap || hasBinding
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }
        `}
        style={{ width: `${width}px`, minWidth: `${width}px`, ...gridStyles }}
        title={`${keyInfo.label}${hasRemap ? ` → ${config.ahkRemap.to}` : ''}${hasBinding ? `: ${actionLabel}` : ''}${isDuplicate ? ' [重複警告]' : ''}`}
      >
        {/* Physical key label */}
        <span className={`font-bold leading-tight ${isDisabled ? 'line-through' : ''} text-primary`}>
          {keyInfo.label}
        </span>

        {/* Remap indicator */}
        {hasRemap && (
          <span className="text-[10px] text-blue-600 dark:text-blue-300 font-medium leading-tight">
            {displayRemap}
          </span>
        )}

        {/* Disabled indicator */}
        {isDisabled && (
          <span className="absolute top-0.5 right-0.5 text-xs text-red-600 dark:text-red-400 font-bold">
            ×
          </span>
        )}

        {/* Action binding */}
        {hasBinding && (
          <span className="text-[10px] text-gray-700 dark:text-gray-300 truncate w-full text-center px-0.5 leading-tight">
            {actionLabel}
          </span>
        )}

        {/* Duplicate warning indicator */}
        {isDuplicate && (
          <span className="absolute bottom-0.5 right-0.5 text-xs">⚠️</span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Layout selector */}
      <div className="flex gap-4 items-center">
        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          <button
            onClick={() => setLayoutType('us')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-l-lg ${
              layoutType === 'us'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            US配列
          </button>
          <button
            onClick={() => setLayoutType('jis')}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-r-lg border-l border-gray-300 dark:border-gray-600 ${
              layoutType === 'jis'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            JIS配列
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input
            type="checkbox"
            checked={showNumpad}
            onChange={(e) => setShowNumpad(e.target.checked)}
            className="w-4 h-4"
          />
          テンキー表示
        </label>
      </div>

      <div className="flex gap-4">
        {/* Main keyboard */}
        <div className="space-y-1">
          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-start">
              {row.map((keyInfo) => renderKey(keyInfo))}
            </div>
          ))}
        </div>

        {/* Navigation keys and arrows */}
        <div className="flex flex-col gap-2">
          {/* Navigation cluster */}
          <div className="space-y-1">
            {navigationKeys.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map((keyInfo) => renderKey(keyInfo))}
              </div>
            ))}
          </div>

          {/* Arrow keys */}
          <div className="space-y-1">
            {arrowKeys.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1" style={{ marginLeft: rowIndex === 0 ? '74px' : '0' }}>
                {row.map((keyInfo) => renderKey(keyInfo))}
              </div>
            ))}
          </div>
        </div>

        {/* Numpad */}
        {showNumpad && (
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: 'repeat(4, 70px)',
              gridTemplateRows: 'repeat(5, 64px)',
            }}
          >
            {/* Row 1: Num, /, *, - */}
            {numpadLayout[0].map((keyInfo) => renderKey(keyInfo))}

            {/* Row 2: 7, 8, 9 */}
            {numpadLayout[1].slice(0, 3).map((keyInfo) => renderKey(keyInfo))}
            {/* + key (spans rows 2-3) */}
            {renderKey(numpadLayout[1][3], { gridRow: 'span 2', height: '132px' })}

            {/* Row 3: 4, 5, 6 */}
            {numpadLayout[2].map((keyInfo) => renderKey(keyInfo))}

            {/* Row 4: 1, 2, 3 */}
            {numpadLayout[3].slice(0, 3).map((keyInfo) => renderKey(keyInfo))}
            {/* Enter key (spans rows 4-5) */}
            {renderKey(numpadLayout[3][3], { gridRow: 'span 2', height: '132px' })}

            {/* Row 5: 0 (spans 2 cols), . */}
            {renderKey(numpadLayout[4][0], { gridColumn: 'span 2', width: '144px' })}
            {renderKey(numpadLayout[4][1])}
          </div>
        )}
      </div>
    </div>
  );
}
