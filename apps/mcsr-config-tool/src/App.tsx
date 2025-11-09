import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from '@mcsr-tools/ui';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { KeyRemapModal } from './components/KeyRemapModal';
import { QuickActionModal } from './components/QuickActionModal';
import { RemapSettingsTable } from './components/RemapSettingsTable';
import { DuplicateWarnings } from './components/DuplicateWarnings';
import { GameSettings } from './components/GameSettings';
import { useConfigStore } from './store/useConfigStore';
import { downloadStandardSettings } from './utils/exportStandardSettings';
import { downloadAHK } from './utils/exportAHK';
import type { PhysicalKey } from './types';

function App() {
  const [selectedKey, setSelectedKey] = useState<PhysicalKey | null>(null);
  const [showRemapModal, setShowRemapModal] = useState(false);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);

  const keyConfigs = useConfigStore((state) => state.keyConfigs);
  const standardSettings = useConfigStore((state) => state.standardSettings);
  const duplicateWarnings = useConfigStore((state) => state.duplicateWarnings);

  const handleKeyClick = (key: PhysicalKey) => {
    setSelectedKey(key);
    setShowRemapModal(true);
  };

  const handleKeyRightClick = (key: PhysicalKey) => {
    setSelectedKey(key);
    setShowQuickActionModal(true);
  };

  const handleDownloadStandardSettings = () => {
    downloadStandardSettings(keyConfigs, standardSettings);
  };

  const handleDownloadAHK = () => {
    downloadAHK(keyConfigs);
  };

  const hasConfigs = keyConfigs.size > 0;
  const hasDuplicates = duplicateWarnings.length > 0;

  return (
    <div className="flex flex-col h-screen bg-app">
      <header className="app-header flex-shrink-0">
        <div className="max-w-[1920px] mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary leading-none">
                MCSR Config Tool
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadAHK}
                disabled={!hasConfigs}
                title={!hasConfigs ? 'キー設定がありません' : undefined}
              >
                AHKダウンロード
              </Button>
              <Button
                size="sm"
                onClick={handleDownloadStandardSettings}
                disabled={!hasConfigs || hasDuplicates}
                title={
                  !hasConfigs
                    ? 'キー設定がありません'
                    : hasDuplicates
                      ? '重複エラーを解決してください'
                      : undefined
                }
              >
                StandardSettingsダウンロード
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="max-w-[1920px] mx-auto h-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full flex flex-col">
            <Tabs defaultValue="keys" className="h-full flex flex-col">
              <div className="p-6 pb-4 flex-shrink-0">
                <TabsList>
                  <TabsTrigger value="keys">キー設定</TabsTrigger>
                  <TabsTrigger value="game">ゲーム設定</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
                <TabsContent value="keys" className="mt-0 h-full">
                  <div className="space-y-6">
                    {/* Duplicate Warnings */}
                    <DuplicateWarnings />

                    {/* Virtual Keyboard */}
                    <div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto">
                        <VirtualKeyboard
                          onKeyClick={handleKeyClick}
                          onKeyRightClick={handleKeyRightClick}
                        />
                      </div>
                      <p className="mt-2 text-sm text-secondary">
                        左クリック: リマップ設定 | 右クリック: 操作割り当て
                      </p>
                    </div>

                    {/* Remap Settings Table */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-primary">
                        リマップ設定一覧
                      </h2>
                      <RemapSettingsTable onEditKey={handleKeyClick} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="game" className="mt-0 h-full">
                  <GameSettings />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showRemapModal && selectedKey && (
        <KeyRemapModal
          physicalKey={selectedKey}
          onClose={() => {
            setShowRemapModal(false);
            setSelectedKey(null);
          }}
        />
      )}

      {showQuickActionModal && selectedKey && (
        <QuickActionModal
          physicalKey={selectedKey}
          onClose={() => {
            setShowQuickActionModal(false);
            setSelectedKey(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
