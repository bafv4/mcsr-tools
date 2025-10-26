import { useRef, useState } from 'react';
import { useWallStore } from '../store/useWallStore';
import { Button } from '@mcsr-tools/ui';
import { convertAudioToOgg, fileToDataURL } from '../utils/audioConverter';

export function SoundSettings() {
  const { sounds, setSounds } = useWallStore();
  const [converting, setConverting] = useState<string | null>(null);
  const fileInputRefs = {
    lockInstance: useRef<HTMLInputElement>(null),
    resetInstance: useRef<HTMLInputElement>(null),
    playInstance: useRef<HTMLInputElement>(null),
    resetAll: useRef<HTMLInputElement>(null),
    resetColumn: useRef<HTMLInputElement>(null),
    resetRow: useRef<HTMLInputElement>(null),
    startBenchmark: useRef<HTMLInputElement>(null),
    finishBenchmark: useRef<HTMLInputElement>(null),
  };

  const handleFileUpload = (key: keyof typeof sounds) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setConverting(key);

      // Convert to OGG if needed
      const oggBlob = await convertAudioToOgg(file);
      const dataURL = await fileToDataURL(oggBlob);

      setSounds({ [key]: dataURL });
    } catch (error) {
      console.error('Failed to process audio file:', error);
      alert('音声ファイルの処理に失敗しました。');
    } finally {
      setConverting(null);
      // Reset input value to allow re-uploading the same file
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemoveSound = (key: keyof typeof sounds) => {
    setSounds({ [key]: null });
  };

  const soundItems = [
    {
      key: 'lockInstance' as const,
      title: 'Lock Instance',
      description: 'インスタンスロック時の音',
      isBuiltIn: true,
    },
    {
      key: 'resetInstance' as const,
      title: 'Reset Instance',
      description: 'インスタンスリセット時の音',
      isBuiltIn: true,
    },
    {
      key: 'playInstance' as const,
      title: 'Play Instance',
      description: 'インスタンス再生時の音（カスタムサウンド）',
      isBuiltIn: false,
    },
    {
      key: 'resetAll' as const,
      title: 'Reset All',
      description: '全リセット時の音（カスタムサウンド）',
      isBuiltIn: false,
    },
    {
      key: 'resetColumn' as const,
      title: 'Reset Column',
      description: '列リセット時の音（カスタムサウンド）',
      isBuiltIn: false,
    },
    {
      key: 'resetRow' as const,
      title: 'Reset Row',
      description: '行リセット時の音（カスタムサウンド）',
      isBuiltIn: false,
    },
    {
      key: 'startBenchmark' as const,
      title: 'Start Benchmark',
      description: 'ベンチマーク開始時の音（カスタムサウンド）',
      isBuiltIn: false,
    },
    {
      key: 'finishBenchmark' as const,
      title: 'Finish Benchmark',
      description: 'ベンチマーク終了時の音（カスタムサウンド）',
      isBuiltIn: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">サウンド設定</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          音声ファイルをアップロードしてください。自動的に.ogg形式に変換されます。
        </p>
      </div>

      <div className="space-y-3">
        {soundItems.map((item) => (
          <div key={item.key} className="card-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-primary">{item.title}</h4>
                <p className="text-xs text-secondary mt-1">{item.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <input
                  ref={fileInputRefs[item.key]}
                  type="file"
                  accept=".ogg,.mp3,.wav,.m4a,.aac,.flac,audio/*"
                  onChange={handleFileUpload(item.key)}
                  className="hidden"
                  disabled={converting === item.key}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs[item.key].current?.click()}
                  disabled={converting === item.key}
                >
                  {converting === item.key ? '変換中...' : (sounds[item.key] ? '変更' : 'アップロード')}
                </Button>
                {sounds[item.key] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveSound(item.key)}
                  >
                    削除
                  </Button>
                )}
              </div>
            </div>
            {sounds[item.key] && (
              <div className="mt-2">
                <span className="text-xs text-green-600 dark:text-green-400">✓ サウンドが設定されています</span>
              </div>
            )}
            {item.isBuiltIn && (
              <div className="mt-3 pt-3 border-t border-light">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={sounds[`${item.key}Replace` as keyof typeof sounds] as boolean}
                    onChange={(e) => {
                      // Prevent unchecking when file is selected (undefined behavior)
                      if (sounds[item.key] && !e.target.checked) {
                        alert('ファイルが選択されている場合、「置き換える」のチェックを外すことはできません。\nファイルを削除してから操作してください。');
                        return;
                      }
                      setSounds({ [`${item.key}Replace`]: e.target.checked });
                    }}
                    className="rounded"
                  />
                  <span className="text-muted">既存のサウンドを置き換える</span>
                </label>
                <p className="text-xs text-tertiary mt-1 ml-6">
                  {!sounds[item.key] && sounds[`${item.key}Replace` as keyof typeof sounds]
                    ? '⚠️ 無音になります'
                    : !sounds[`${item.key}Replace` as keyof typeof sounds]
                    ? 'デフォルトの音が使用されます'
                    : '指定されたファイルの音が使用されます'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-sm text-blue-900 dark:text-blue-300 mb-2">ℹ️ サウンド形式について</h4>
        <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
          <li>• <strong>Lock Instance / Reset Instance</strong>: 「置き換える」にチェックを入れると既存のサウンドを置き換えます</li>
          <li>• <strong>置き換える挙動</strong>:</li>
          <li className="ml-4">- ファイル未選択 + チェックなし = デフォルトの音</li>
          <li className="ml-4">- ファイル未選択 + チェックあり = 無音</li>
          <li className="ml-4">- ファイル選択済み + チェックあり = 指定したファイルの音</li>
          <li>• <strong>その他のサウンド</strong>: sounds.jsonを生成してカスタムサウンドとして追加されます</li>
          <li>• <strong>対応形式</strong>: .ogg, .mp3, .wav, .m4a, .aac, .flac など</li>
          <li>• アップロードされた音声ファイルは自動的に.ogg (Ogg Vorbis)に変換されます</li>
        </ul>
      </div>
    </div>
  );
}
