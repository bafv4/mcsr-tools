import { useRef, useState } from 'react';
import { useWallStore, SoundMode } from '../store/useWallStore';
import { Button } from '@mcsr-tools/ui';
import { convertAudioToOgg, fileToDataURL } from '../utils/audioConverter';
import { useI18n } from '../i18n/I18nContext';

type SoundKey = 'lockInstance' | 'resetInstance' | 'resetAll' | 'resetColumn' | 'resetRow' | 'startBenchmark' | 'finishBenchmark';

export function SoundSettings() {
  const { t } = useI18n();
  const { sounds, setSounds } = useWallStore();
  const [converting, setConverting] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<SoundKey, HTMLInputElement | null>>({
    lockInstance: null,
    resetInstance: null,
    resetAll: null,
    resetColumn: null,
    resetRow: null,
    startBenchmark: null,
    finishBenchmark: null,
  });

  const handleFileUpload = (key: SoundKey) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setConverting(key);

      // Convert to OGG if needed
      const oggBlob = await convertAudioToOgg(file);
      const dataURL = await fileToDataURL(oggBlob);

      setSounds({
        [key]: {
          ...sounds[key],
          file: dataURL,
          mode: 'custom' as SoundMode,
        },
      });
    } catch (error) {
      console.error('Failed to process audio file:', error);
      alert(t('audioProcessFailed'));
    } finally {
      setConverting(null);
      // Reset input value to allow re-uploading the same file
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleModeChange = (key: SoundKey, mode: SoundMode) => {
    setSounds({
      [key]: {
        ...sounds[key],
        mode,
        file: mode === 'custom' ? sounds[key].file : null,
      },
    });
  };

  const handleRemoveSound = (key: SoundKey) => {
    setSounds({
      [key]: {
        mode: 'default',
        file: null,
      },
    });
  };

  const soundItems: Array<{ key: SoundKey; title: string; description: string }> = [
    {
      key: 'lockInstance',
      title: t('lockInstance'),
      description: t('lockInstanceDesc'),
    },
    {
      key: 'startBenchmark',
      title: t('startBenchmark'),
      description: t('startBenchmarkDesc'),
    },
    {
      key: 'finishBenchmark',
      title: t('finishBenchmark'),
      description: t('finishBenchmarkDesc'),
    },
  ];

  const resetSoundItems: Array<{ key: SoundKey; title: string; description: string }> = [
    {
      key: 'resetAll',
      title: t('resetAll'),
      description: t('resetAllDesc'),
    },
    {
      key: 'resetColumn',
      title: t('resetColumn'),
      description: t('resetColumnDesc'),
    },
    {
      key: 'resetRow',
      title: t('resetRow'),
      description: t('resetRowDesc'),
    },
  ];

  const renderSoundItem = (item: { key: SoundKey; title: string; description: string }) => {
    const sound = sounds[item.key];
    const hasFile = sound.mode === 'custom' && sound.file !== null;

    return (
      <div key={item.key} className="card-border">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm text-primary">{item.title}</h4>
              <p className="text-xs text-secondary mt-1">{item.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-secondary">{t('soundSetting')}</label>
            <div className="flex gap-2">
              <Button
                variant={sound.mode === 'off' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleModeChange(item.key, 'off')}
                className="flex-1"
              >
                {t('soundOff')}
              </Button>
              <Button
                variant={sound.mode === 'default' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleModeChange(item.key, 'default')}
                className="flex-1"
              >
                {t('soundDefault')}
              </Button>
              <Button
                variant={sound.mode === 'custom' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleModeChange(item.key, 'custom')}
                className="flex-1"
              >
                {t('soundCustom')}
              </Button>
            </div>
          </div>

          {sound.mode === 'custom' && (
            <div className="flex items-center gap-2 pt-2 border-t border-light">
              <input
                ref={(el) => (fileInputRefs.current[item.key] = el)}
                type="file"
                accept=".ogg,.mp3,.wav,.m4a,.aac,.flac,audio/*"
                onChange={handleFileUpload(item.key)}
                className="hidden"
                disabled={converting === item.key}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRefs.current[item.key]?.click()}
                disabled={converting === item.key}
              >
                {converting === item.key ? t('soundConverting') : hasFile ? t('soundChange') : t('soundUpload')}
              </Button>
              {hasFile && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveSound(item.key)}>
                    {t('soundRemove')}
                  </Button>
                  <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                    ✓ {t('soundSet')}
                  </span>
                </>
              )}
            </div>
          )}

          {sound.mode === 'default' && (
            <p className="text-xs text-tertiary pt-2 border-t border-light">
              {t('soundDefaultUsed')}
            </p>
          )}
          {sound.mode === 'off' && (
            <p className="text-xs text-tertiary pt-2 border-t border-light">{t('soundSilent')}</p>
          )}
          {sound.mode === 'custom' && !hasFile && (
            <p className="text-xs text-tertiary pt-2 border-t border-light">
              {t('soundNoFile')}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('soundSettings')}</h3>
      </div>

      {/* Global Sound Mode Toggle */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={sounds.globalMode === 'default' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSounds({ globalMode: 'default' })}
              className="flex-1"
            >
              {t('soundModeDefault')}
            </Button>
            <Button
              variant={sounds.globalMode === 'custom' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSounds({ globalMode: 'custom' })}
              className="flex-1"
            >
              {t('soundModeCustom')}
            </Button>
            <Button
              variant={sounds.globalMode === 'off' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSounds({ globalMode: 'off' })}
              className="flex-1"
            >
              {t('soundModeOff')}
            </Button>
          </div>
        </div>
      </div>

      {sounds.globalMode === 'custom' && (
        <>
          {/* Basic Sounds */}
          <div className="space-y-3">
            {soundItems.map(renderSoundItem)}
          </div>

          {/* Reset Sounds */}
          <div className="space-y-3">

            <div className="card-border">
              <div className="space-y-2">
                <label className="text-sm text-secondary">{t('resetInstanceMode')}</label>
                <div className="flex gap-2">
                  <Button
                    variant={sounds.resetInstanceMode === 'unified' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSounds({ resetInstanceMode: 'unified' })}
                    className="flex-1"
                  >
                    {t('resetUnified')}
                  </Button>
                  <Button
                    variant={sounds.resetInstanceMode === 'separate' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSounds({ resetInstanceMode: 'separate' })}
                    className="flex-1"
                  >
                    {t('resetSeparate')}
                  </Button>
                </div>
              </div>
            </div>

            {sounds.resetInstanceMode === 'unified' ? (
              renderSoundItem({
                key: 'resetInstance',
                title: t('resetInstance'),
                description: t('resetInstanceDesc'),
              })
            ) : (
              <>{resetSoundItems.map(renderSoundItem)}</>
            )}
          </div>
        </>
      )}
    </div>
  );
}
