import { useRef, useState } from 'react';
import { useWallStore } from './store/useWallStore';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Select, VersionChip } from '@mcsr-tools/ui';
import type { VersionInfo } from '@mcsr-tools/ui';
import { PackInfo } from './components/PackInfo';
import { BackgroundSettings } from './components/BackgroundSettings';
import { LayoutEditor } from './components/LayoutEditor';
import { SoundSettings } from './components/SoundSettings';
import { WallPreview } from './components/WallPreview';
import { exportResourcePack } from './utils/packExport';
import { importResourcePack } from './utils/packImport';

const versionInfo: VersionInfo = {
  appName: 'SeedQueue Wall Maker',
  version: 'v2.2',
  author: 'baf',
  authorUrl: 'https://github.com/bafv4',
  repoUrl: 'https://github.com/bafv4/mcsr-tools',
  changelog: [
    {
      version: 'v2.2',
      date: '2025-10-30',
      changes: [
        'プリセットを反映したときに使えないリソースパックが生成される問題を修正',
      ],
    },
    {
      version: 'v2.1',
      date: '2025-10-28',
      changes: [
        'Padding調整機能を追加',
        'replaceLockedInstances設定機能を追加',
        '数値入力スライダーを追加',
      ],
    },
    {
      version: 'v2.0',
      date: '2025-10-27',
      changes: [
        '初回リリース',
      ],
    },
  ],
};

function App() {
  const {
    packInfo,
    layout,
    background,
    resolution,
    sounds,
    replaceLockedInstances,
    setResolution,
    resetToDefault,
    importData,
  } = useWallStore();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [customResolution, setCustomResolution] = useState({ width: '', height: '' });
  const [showCustomResolution, setShowCustomResolution] = useState(false);

  const handleDownload = async () => {
    try {
      await exportResourcePack(packInfo, layout, background, resolution, sounds, replaceLockedInstances);
    } catch (error) {
      console.error('Export failed:', error);
      alert('リソースパックのエクスポートに失敗しました');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importResourcePack(file);

      // Only import fields that exist (not null)
      const importPayload: any = {};
      if (data.packInfo) importPayload.packInfo = data.packInfo;
      if (data.resolution) importPayload.resolution = data.resolution;
      if (data.layout) importPayload.layout = data.layout;
      if (data.background) importPayload.background = data.background;
      if (data.sounds) importPayload.sounds = data.sounds;
      if (typeof data.replaceLockedInstances === 'boolean') importPayload.replaceLockedInstances = data.replaceLockedInstances;

      importData(importPayload);
      alert('リソースパックを読み込みました');
    } catch (error) {
      console.error('Import failed:', error);
      alert('リソースパックの読み込みに失敗しました');
    }

    // Reset input
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }
  };

  const handleResolutionChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomResolution(true);
    } else {
      setShowCustomResolution(false);
      const [width, height] = value.split('x').map(Number);
      setResolution({ width, height });
    }
  };

  const handleCustomResolutionApply = () => {
    const width = parseInt(customResolution.width);
    const height = parseInt(customResolution.height);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      setResolution({ width, height });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-app">
      <header className="app-header flex-shrink-0">
        <div className="max-w-[1920px] mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary leading-none">
                SeedQueue Wall Maker
              </h1>
              <VersionChip versionInfo={versionInfo} />
            </div>
            <div className="flex items-center gap-6">
              {!showCustomResolution ? (
                <div className="w-48">
                  <Select
                    value={`${resolution.width}x${resolution.height}`}
                    onChange={(e) => handleResolutionChange(e.target.value)}
                    options={[
                      { value: '1920x1080', label: 'FHD (1920x1080)' },
                      { value: '2560x1440', label: 'WQHD (2560x1440)' },
                      { value: '3840x2160', label: '4K (3840x2160)' },
                      { value: 'custom', label: 'カスタム...' },
                    ]}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="幅"
                    value={customResolution.width}
                    onChange={(e) => setCustomResolution({ ...customResolution, width: e.target.value })}
                    className="w-20 px-2 py-1 border border-default rounded text-sm bg-white dark:bg-gray-700 text-primary"
                    min="1"
                  />
                  <span className="text-secondary">×</span>
                  <input
                    type="number"
                    placeholder="高さ"
                    value={customResolution.height}
                    onChange={(e) => setCustomResolution({ ...customResolution, height: e.target.value })}
                    className="w-20 px-2 py-1 border border-default rounded text-sm bg-white dark:bg-gray-700 text-primary"
                    min="1"
                  />
                  <Button size="sm" onClick={handleCustomResolutionApply}>
                    適用
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomResolution(false);
                      setCustomResolution({ width: '', height: '' });
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => importInputRef.current?.click()}
                >
                  インポート
                </Button>
                <Button variant="secondary" size="sm" onClick={resetToDefault}>
                  リセット
                </Button>
                <Button size="sm" onClick={handleDownload}>ダウンロード</Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="max-w-[1920px] mx-auto h-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel - Settings */}
            <div className="lg:col-span-1 min-h-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full flex flex-col">
                <Tabs defaultValue="info" className="h-full flex flex-col">
                  <div className="p-6 pb-4 flex-shrink-0">
                    <TabsList>
                      <TabsTrigger value="info">情報</TabsTrigger>
                      <TabsTrigger value="background">背景</TabsTrigger>
                      <TabsTrigger value="layout">レイアウト</TabsTrigger>
                      <TabsTrigger value="sound">サウンド</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
                    <TabsContent value="info" className="mt-0">
                      <PackInfo />
                    </TabsContent>

                    <TabsContent value="background" className="mt-0">
                      <BackgroundSettings />
                    </TabsContent>

                    <TabsContent value="layout" className="mt-0">
                      <LayoutEditor />
                    </TabsContent>

                    <TabsContent value="sound" className="mt-0">
                      <SoundSettings />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">プレビュー</h2>
                <div className="flex justify-center">
                  <WallPreview />
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>ヒント: エリアをドラッグして移動、角をドラッグしてリサイズできます</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
