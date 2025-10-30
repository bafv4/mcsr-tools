import { useState } from 'react';
import { useInventoryStore } from '../store/useInventoryStore';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@mcsr-tools/ui';

export function DebugView() {
  const { presets, rawNBTData } = useInventoryStore();
  const [activeTab, setActiveTab] = useState<'parsed' | 'raw'>('parsed');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary mb-4">NBT Debug View</h2>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'parsed' | 'raw')}>
          <TabsList className="mb-4">
            <TabsTrigger value="parsed">パース済みデータ</TabsTrigger>
            <TabsTrigger value="raw">生NBTデータ</TabsTrigger>
          </TabsList>

          <TabsContent value="parsed">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
              <pre className="text-sm text-primary font-mono whitespace-pre-wrap break-words">
                {JSON.stringify({ presets }, null, 2)}
              </pre>
            </div>
            <div className="mt-4 text-sm text-secondary">
              <p>プリセット数: {presets.length}</p>
              <p>
                総アイテム数:{' '}
                {presets.reduce(
                  (total, preset) =>
                    total +
                    preset.containers.reduce(
                      (containerTotal, container) =>
                        containerTotal + container.items.length,
                      0
                    ),
                  0
                )}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="raw">
            {rawNBTData ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
                <pre className="text-sm text-primary font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(rawNBTData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center text-secondary">
                NBTファイルがインポートされていません
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
