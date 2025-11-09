import { useState, useCallback, useMemo, memo } from 'react';
import { useWallStore } from '../store/useWallStore';
import { getPresets } from '../data/presets';
import { AreaEditor } from './AreaEditor';
import { Select, Button, Switch } from '@mcsr-tools/ui';

interface LayoutEditorProps {
  onShowTips?: () => void;
}

export const LayoutEditor = memo(function LayoutEditor({ onShowTips }: LayoutEditorProps) {
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
    { value: '', label: 'プリセットを選択' },
    ...presets.map((p) => ({ value: p.name, label: p.name })),
  ], [presets]);

  const handleReplaceLockedInstancesChange = useCallback(() => {
    setReplaceLockedInstances(!replaceLockedInstances);
  }, [replaceLockedInstances, setReplaceLockedInstances]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">プリセット</h3>
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
            プリセットを反映
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <Switch
          checked={replaceLockedInstances}
          onChange={handleReplaceLockedInstancesChange}
          label="Replace Locked Instances"
        />
      </div>

      <div className="space-y-4">
        <AreaEditor area="main" title="Main" color="#2563eb" allowGridToggle onShowTips={onShowTips} />
        <AreaEditor area="locked" title="Locked" color="#ea580c" showToggle />
        <AreaEditor area="preparing" title="Preparing" color="#16a34a" showToggle />
      </div>
    </div>
  );
});
