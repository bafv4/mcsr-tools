import { useRef, useState } from 'react';
import { Button, Select, Input } from '@mcsr-tools/ui';
import { useInventoryStore } from './store/useInventoryStore';
import { parseNBTFile, exportNBTFile } from './utils/nbtParser';
import { MinecraftInventoryLayout } from './components/MinecraftInventoryLayout';
import { PresetManager } from './components/PresetManager';
import { ImportModal } from './components/ImportModal';

// GitHub URL for sample hotbar.nbt file
const GITHUB_HOTBAR_URL = 'https://raw.githubusercontent.com/Knawk/mc-MiniPracticeKit/refs/heads/master/hotbar.nbt';

// Practice types for the dropdown
const PRACTICE_TYPES = [
  { value: 'nether_enter', label: 'Nether Enter' },
  { value: 'bastion_enter', label: 'Bastion Enter' },
  { value: 'fortress_enter', label: 'Fortress Enter' },
  { value: 'nether_exit', label: 'Nether Exit' },
  { value: 'eye_spy', label: 'Eye Spy' },
  { value: 'end_enter', label: 'End Enter' },
];

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadHotbar, presets, selectedPreset, selectPreset, rawNBTData, reset } = useInventoryStore();
  const [practiceType, setPracticeType] = useState<string>('nether_enter');
  const [presetName, setPresetName] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleFileImport = async (file: File) => {
    try {
      const result = await parseNBTFile(file);
      console.log('Parsed hotbar data:', result.data);
      console.log('Raw NBT data:', result.raw);
      loadHotbar(result.data, result.raw);
      alert(`${result.data.presets.length}個のプリセットを読み込みました`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('NBTファイルの読み込みに失敗しました');
    }
  };

  const handleGitHubImport = async () => {
    try {
      const response = await fetch(GITHUB_HOTBAR_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const file = new File([blob], 'hotbar.nbt', { type: 'application/octet-stream' });

      await handleFileImport(file);
    } catch (error) {
      console.error('GitHub import failed:', error);
      alert('GitHubからのインポートに失敗しました。ネットワーク接続を確認してください。');
    }
  };

  // const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   await handleFileImport(file);

  //   // Reset input
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = '';
  //   }
  // };

  const handleExport = async () => {
    try {
      await exportNBTFile({ presets }, rawNBTData);
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
              >
                インポート
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={reset}
                className="hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:border-red-600"
              >
                リセット
              </Button>
              <Button size="sm" onClick={handleExport}>
                エクスポート
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1920px] mx-auto">
          {rawNBTData ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Preset Selection Section */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-100">練習プリセット</h2>
                <PresetManager
                  onSelectPreset={selectPreset}
                  onPresetNameChange={setPresetName}
                />
              </div>

              {/* Preset Configuration Section */}
              {selectedPreset !== null ? (
                <>
                  {/* Preset Name & Type */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                      <Input
                        label="プリセット名"
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        placeholder="例: Bastion Enter"
                      />
                      <Select
                        label="練習の種類"
                        value={practiceType}
                        onChange={(e) => setPracticeType(e.target.value)}
                        options={PRACTICE_TYPES}
                      />
                    </div>
                  </div>

                  {/* Inventory Section */}
                  <div className="p-8">
                    <h3 className="text-md font-semibold mb-6 text-gray-800 dark:text-gray-100">インベントリ</h3>
                    <MinecraftInventoryLayout />
                  </div>
                </>
              ) : (
                <div className="p-16 text-center text-gray-500 dark:text-gray-400">
                  プリセットを選択してください
                </div>
              )}
            </div>
          ) : (
            /* Empty State - No NBT File Imported */
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex flex-col items-center justify-center py-24 px-6">
                <div className="text-center max-w-md">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    NBTファイルをインポート
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                    MiniPracticeKitの<span className="font-mono font-semibold">hotbar.nbt</span>をインポートしてください
                  </p>
                  <Button
                    onClick={() => setIsImportModalOpen(true)}
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    インポート
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onFileSelect={handleFileImport}
        onGitHubImport={handleGitHubImport}
      />
    </div>
  );
}

export default App;
