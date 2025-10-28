import { Tabs, TabsList, TabsTrigger } from '@mcsr-tools/ui';
import { useInventoryStore } from '../store/useInventoryStore';

export function PresetTabs() {
  const { presets, selectedPreset, selectPreset } = useInventoryStore();

  if (presets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-secondary text-center">
          NBTファイルを読み込んでください
        </p>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    selectPreset(parseInt(value));
  };

  return (
    <Tabs value={selectedPreset !== null ? String(selectedPreset) : undefined} onValueChange={handleTabChange}>
      <TabsList>
        {presets.map((preset, index) => (
          <TabsTrigger
            key={index}
            value={String(index)}
          >
            {preset.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
