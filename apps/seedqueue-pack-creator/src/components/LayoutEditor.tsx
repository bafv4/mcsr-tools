import { useState, useCallback, useMemo, memo } from 'react';
import { useWallStore } from '../store/useWallStore';
import { getPresets } from '../data/presets';
import { AreaEditor } from './AreaEditor';
import { Select, Button, Switch } from '@mcsr-tools/ui';
import { useI18n } from '../i18n/I18nContext';

interface LayoutEditorProps {
  onShowTips?: () => void;
}

export const LayoutEditor = memo(function LayoutEditor({ onShowTips }: LayoutEditorProps) {
  const { t } = useI18n();
  const { resolution, setLayout, replaceLockedInstances, setReplaceLockedInstances } = useWallStore();
  const [selectedPreset, setSelectedPreset] = useState('');

  const presets = useMemo(() => getPresets(resolution.width, resolution.height), [resolution.width, resolution.height]);

  const handleApplyPreset = useCallback(() => {
    const preset = presets.find((p) => p.name === selectedPreset);
    if (preset) {
      setLayout(preset.layout);
    }
  }, [presets, selectedPreset, setLayout]);

  const handlePresetChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPreset(e.target.value);
  }, []);

  const presetOptions = useMemo(() => [
    { value: '', label: t('selectPreset') },
    ...presets.map((p) => ({ value: p.name, label: p.name })),
  ], [presets, t]);

  const handleReplaceLockedInstancesChange = useCallback(() => {
    setReplaceLockedInstances(!replaceLockedInstances);
  }, [replaceLockedInstances, setReplaceLockedInstances]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('layoutTitle')}</h3>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{t('replaceLockedInstances')}</span>
        </div>
        <Switch
          checked={replaceLockedInstances}
          onChange={handleReplaceLockedInstancesChange}
        />
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h4 className="text-md font-semibold mb-4 text-gray-900 dark:text-white">{t('presetTitle')}</h4>
        <div className="flex gap-2 items-center">
          <Select
            value={selectedPreset}
            onChange={handlePresetChange}
            options={presetOptions}
            className="flex-1"
          />
          <Button
            onClick={handleApplyPreset}
            disabled={!selectedPreset}
            className="whitespace-nowrap"
            size="sm"
          >
            {t('applyPreset')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <AreaEditor area="main" title={t('areaMain')} color="#2563eb" allowGridToggle onShowTips={onShowTips} />
        <AreaEditor area="locked" title={t('areaLocked')} color="#ea580c" showToggle />
        <AreaEditor area="preparing" title={t('areaPreparing')} color="#16a34a" showToggle />
      </div>
    </div>
  );
});
