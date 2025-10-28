import { useInventoryStore } from '../store/useInventoryStore';

export function ContainerList() {
  const { presets, selectedPreset, selectedContainer, selectContainer } = useInventoryStore();

  if (selectedPreset === null) {
    return null;
  }

  const preset = presets[selectedPreset];
  if (!preset || preset.containers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-secondary text-center">
          このプリセットにはコンテナがありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-primary mb-4">
        {preset.name} - コンテナ一覧
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {preset.containers.map((container, index) => (
          <button
            key={index}
            onClick={() => selectContainer(index)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedContainer === index
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
            }`}
          >
            <div className="text-sm font-medium text-primary">
              {container.name || container.id.replace('minecraft:', '')}
            </div>
            <div className="text-xs text-secondary mt-1">
              {container.items.length} アイテム
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
