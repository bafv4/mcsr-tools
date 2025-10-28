import { useRef } from 'react';
import { Button } from '@mcsr-tools/ui';
import { useInventoryStore } from './store/useInventoryStore';
import { parseNBTFile, exportNBTFile } from './utils/nbtParser';
import { debugNBTFile } from './utils/debugNBT';
import { PresetTabs } from './components/PresetList';
import { MinecraftInventoryLayout } from './components/MinecraftInventoryLayout';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadHotbar, presets, reset } = useInventoryStore();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Debug: log NBT structure
      await debugNBTFile(file);

      const hotbarData = await parseNBTFile(file);
      console.log('Parsed hotbar data:', hotbarData);
      loadHotbar(hotbarData);
      alert(`${hotbarData.presets.length}個のプリセットを読み込みました`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('NBTファイルの読み込みに失敗しました');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    try {
      await exportNBTFile({ presets });
    } catch (error) {
      console.error('Export failed:', error);
      alert('NBTファイルのエクスポートに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-app">
      <header className="app-header">
        <div className="max-w-[1920px] mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <h1 className="text-2xl font-bold text-primary">
              MiniPracticeKit NBT Editor
            </h1>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".nbt"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                インポート
              </Button>
              <Button variant="secondary" size="sm" onClick={reset}>
                リセット
              </Button>
              <Button size="sm" onClick={handleExport}>
                エクスポート
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow max-w-fit mx-auto">
          {/* Preset Tabs */}
          <div className="px-6 pt-4">
            <PresetTabs />
          </div>

          {/* Minecraft Inventory Layout */}
          <div className="p-6">
            <MinecraftInventoryLayout />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
