import { Button } from '@mcsr-tools/ui';
import { useConfigStore } from '../store/useConfigStore';
import { getActionLabel } from '../constants/gameActions';
import type { PhysicalKey } from '../types';

interface RemapSettingsTableProps {
  onEditKey: (key: PhysicalKey) => void;
}

export function RemapSettingsTable({ onEditKey }: RemapSettingsTableProps) {
  const keyConfigs = useConfigStore((state) => state.keyConfigs);
  const removeKeyConfig = useConfigStore((state) => state.removeKeyConfig);

  // Convert Map to array for rendering
  const configs = Array.from(keyConfigs.entries()).map(([key, config]) => ({
    physicalKey: key,
    ...config,
  }));

  // Filter to only show keys with configurations
  const configuredKeys = configs.filter(
    (config) => config.ahkRemap || config.binding
  );

  if (configuredKeys.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-secondary">
          まだキー設定がありません。キーボード上のキーをクリックして設定を追加してください。
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-300 dark:border-gray-600">
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
              物理キー
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
              AHKリマップ
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
              実際の入力
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">
              操作割り当て
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-primary">
              アクション
            </th>
          </tr>
        </thead>
        <tbody>
          {configuredKeys.map((config) => {
            const hasRemap = config.ahkRemap && !config.ahkRemap.disabled;
            const isDisabled = config.ahkRemap?.disabled;
            const finalInput = hasRemap ? config.ahkRemap.to : config.physicalKey;

            return (
              <tr
                key={config.physicalKey}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                {/* Physical Key */}
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-primary">
                    {config.physicalKey.toUpperCase()}
                  </span>
                </td>

                {/* AHK Remap */}
                <td className="py-3 px-4">
                  {isDisabled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                      <span>×</span> 無効化
                    </span>
                  ) : hasRemap ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                      → <span className="font-mono">{config.ahkRemap.to?.toUpperCase()}</span>
                    </span>
                  ) : (
                    <span className="text-secondary text-sm">-</span>
                  )}
                </td>

                {/* Final Input */}
                <td className="py-3 px-4">
                  {isDisabled ? (
                    <span className="text-secondary text-sm italic">なし</span>
                  ) : (
                    <span className="font-mono font-medium text-primary">
                      {finalInput?.toUpperCase()}
                    </span>
                  )}
                </td>

                {/* Binding */}
                <td className="py-3 px-4">
                  {config.binding ? (
                    <span className="text-primary text-sm">
                      {getActionLabel(config.binding.action)}
                    </span>
                  ) : (
                    <span className="text-secondary text-sm">-</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditKey(config.physicalKey)}
                    >
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`キー「${config.physicalKey.toUpperCase()}」の設定を削除しますか？`)) {
                          removeKeyConfig(config.physicalKey);
                        }
                      }}
                    >
                      削除
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-secondary">
          合計: <span className="font-semibold text-primary">{configuredKeys.length}</span> 個のキー設定
        </p>
      </div>
    </div>
  );
}
