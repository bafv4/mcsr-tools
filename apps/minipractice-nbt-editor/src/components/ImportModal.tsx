import { useState } from 'react';
import { Button } from '@mcsr-tools/ui';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onGitHubImport: () => void;
}

export function ImportModal({ isOpen, onClose, onFileSelect, onGitHubImport }: ImportModalProps) {
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      onClose();
    }
  };

  const handleGitHubImport = async () => {
    setIsImporting(true);
    try {
      await onGitHubImport();
      onClose();
    } catch (error) {
      console.error('GitHub import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            NBTファイルをインポート
          </h2>

          {/* Import Options */}
          <div className="space-y-4">
            {/* Option 1: Upload from PC */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  PCからアップロード
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  ローカルの hotbar.nbt ファイルを選択
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".nbt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    ファイルを選択
                  </span>
                </label>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  または
                </span>
              </div>
            </div>

            {/* Option 2: Import from GitHub */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center text-center">
                <svg
                  className="w-12 h-12 text-gray-900 dark:text-gray-100 mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  GitHubからインポート
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  サンプルファイルをダウンロード
                </p>
                <Button
                  onClick={handleGitHubImport}
                  disabled={isImporting}
                  variant="primary"
                  className="min-w-[120px]"
                >
                  {isImporting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      インポート中...
                    </span>
                  ) : (
                    'インポート'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
