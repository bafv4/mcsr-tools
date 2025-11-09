import { useState } from 'react';
import { Modal } from './Modal';

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface VersionInfo {
  appName: string;
  version: string;
  author: string;
  authorUrl?: string;
  repoUrl?: string;
  changelog?: ChangelogEntry[];
}

interface VersionChipProps {
  versionInfo: VersionInfo;
  languageSwitcher?: React.ReactNode;
  translations?: {
    versionLabel?: string;
    authorLabel?: string;
    repositoryLabel?: string;
    changelogLabel?: string;
  };
}

export function VersionChip({ versionInfo, languageSwitcher, translations }: VersionChipProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 leading-none hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
      >
        {versionInfo.version}
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${versionInfo.appName}`}
        size="lg"
      >
        <div className="space-y-6">
          {languageSwitcher && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Language / 言語</p>
              {languageSwitcher}
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{translations?.versionLabel || 'バージョン'}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{versionInfo.version}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{translations?.authorLabel || '作者'}</p>
            <div className="flex items-center gap-2">
              {versionInfo.authorUrl ? (
                <a
                  href={versionInfo.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {versionInfo.author}
                </a>
              ) : (
                <p className="text-base text-gray-900 dark:text-white">{versionInfo.author}</p>
              )}
              {versionInfo.repoUrl && (
                <a
                  href={versionInfo.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  title={translations?.repositoryLabel || 'リポジトリ'}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Repo
                </a>
              )}
            </div>
          </div>

          {versionInfo.changelog && versionInfo.changelog.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{translations?.changelogLabel || '更新履歴'}</p>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50 max-h-80 overflow-y-auto">
                <div className="space-y-4">
                  {versionInfo.changelog.map((entry, index) => (
                    <div key={index} className="border-l-2 border-blue-400 dark:border-blue-600 pl-4">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{entry.version}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</span>
                      </div>
                      <ul className="space-y-0">
                        {entry.changes.map((change, changeIndex) => (
                          <li key={changeIndex} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-gray-400 dark:text-gray-500 mt-0.5">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
