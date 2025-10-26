import { useRef } from 'react';
import { useWallStore } from '../store/useWallStore';
import { Input, Button } from '@mcsr-tools/ui';

export function PackInfo() {
  const { packInfo, setPackInfo } = useWallStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPackInfo({ icon: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">リソースパック情報</h3>

      <Input
        label="リソースパック名"
        value={packInfo.name}
        onChange={(e) => setPackInfo({ name: e.target.value })}
        placeholder="SeedQueue Resource Pack"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          説明
        </label>
        <textarea
          value={packInfo.description}
          onChange={(e) => setPackInfo({ description: e.target.value })}
          placeholder=""
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          アイコン (pack.png)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleIconUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          アイコンをアップロード
        </Button>
        {packInfo.icon && (
          <div className="mt-2">
            <img
              src={packInfo.icon}
              alt="Pack icon preview"
              className="w-32 h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
