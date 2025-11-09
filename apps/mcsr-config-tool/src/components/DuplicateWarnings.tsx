import { useConfigStore } from '../store/useConfigStore';

export function DuplicateWarnings() {
  const duplicateWarnings = useConfigStore((state) => state.duplicateWarnings);

  if (duplicateWarnings.length === 0) {
    return null;
  }

  return (
    <div className="px-3 py-2 bg-red-50/50 dark:bg-red-900/10 border border-red-300 dark:border-red-800/50 rounded">
      <div className="flex items-center gap-2 text-xs">
        <span className="flex-shrink-0">⚠️</span>
        <div className="flex-1">
          <span className="text-red-700 dark:text-red-400">
            {duplicateWarnings.map((warning, index) => (
              <span key={index}>
                {index > 0 && ' / '}
                <span className="font-mono">{warning.sourceKeys.map((key) => key.toUpperCase()).join(', ')}</span>
                {' → '}
                <span className="font-mono font-semibold">{warning.inputKey.toUpperCase()}</span>
              </span>
            ))}
            {' (ルール違反)'}
          </span>
        </div>
      </div>
    </div>
  );
}
