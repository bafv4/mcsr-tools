import { useState, useEffect } from 'react';
import { useWallStore } from './store/useWallStore';
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Select, VersionChip } from '@mcsr-tools/ui';
import type { VersionInfo } from '@mcsr-tools/ui';
import { PackInfo } from './components/PackInfo';
import { BackgroundSettings } from './components/BackgroundSettings';
import { LayoutEditor } from './components/LayoutEditor';
import { SoundSettings } from './components/SoundSettings';
import { LockImageSettings } from './components/LockImageSettings';
import { TipsModal } from './components/TipsModal';
import { ShareModal } from './components/ShareModal';
import { ImportModal } from './components/ImportModal';
import { WallPreview } from './components/WallPreview';
import { exportResourcePack } from './utils/packExport';
import { useI18n } from './i18n/I18nContext';

const versionInfo: VersionInfo = {
  appName: 'SeedQueue Wall Maker',
  version: 'v2.4.0',
  author: 'baf',
  authorUrl: 'https://github.com/bafv4',
  repoUrl: 'https://github.com/bafv4/mcsr-tools',
  changelog: [
    {
      version: 'v2.4.0',
      date: '2025-11-10',
      changes: [
        'サウンド設定の改善',
        'デザイン調整',
        'i18n対応',
      ],
    },
    {
      version: 'v2.3.1',
      date: '2025-11-09',
      changes: [
        '共有機能を改善',
      ],
    },
    {
      version: 'v2.3.0',
      date: '2025-11-09',
      changes: [
        'ロック画像設定機能を追加',
        '画像・エリア調整機能の改善',
        'インポート機能の改善',
        'Removed Herobrine',
      ],
    },
    {
      version: 'v2.2.0',
      date: '2025-10-30',
      changes: [
        'プリセットを反映したときに使えないリソースパックが生成される問題を修正',
      ],
    },
    {
      version: 'v2.1.0',
      date: '2025-10-28',
      changes: [
        'Padding調整機能を追加',
        'replaceLockedInstances設定機能を追加',
        '数値入力スライダーを追加',
      ],
    },
    {
      version: 'v2.0.0',
      date: '2025-10-27',
      changes: [
        '初回リリース',
      ],
    },
  ],
};

function App() {
  const { language, setLanguage, t } = useI18n();
  const {
    packInfo,
    layout,
    background,
    resolution,
    sounds,
    lockImages,
    replaceLockedInstances,
    setResolution,
    setLayout,
    resetToDefault,
    importData,
  } = useWallStore();
  const [customResolution, setCustomResolution] = useState({ width: '', height: '' });
  const [showCustomResolution, setShowCustomResolution] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Load layout and resolution from URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const layoutParam = params.get('layout');
    const resolutionParam = params.get('resolution');

    // First, set the resolution before loading the layout
    if (resolutionParam) {
      try {
        const [width, height] = resolutionParam.split('x').map(Number);
        if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
          setResolution({ width, height });
        } else {
          // If resolution parameter is invalid, default to 1920x1080
          setResolution({ width: 1920, height: 1080 });
        }
      } catch (error) {
        console.error('Failed to load resolution from URL:', error);
        // If resolution parsing fails, default to 1920x1080
        setResolution({ width: 1920, height: 1080 });
      }
    } else if (layoutParam) {
      // If layout is present but no resolution parameter, default to 1920x1080
      setResolution({ width: 1920, height: 1080 });
    }

    // Then, load the layout after resolution is set
    if (layoutParam) {
      try {
        const decodedLayout = JSON.parse(atob(layoutParam));
        setLayout(decodedLayout);
      } catch (error) {
        console.error('Failed to load layout from URL:', error);
      }
    }
  }, [setLayout, setResolution]);

  const handleDownload = async () => {
    try {
      await exportResourcePack(packInfo, layout, background, resolution, sounds, lockImages, replaceLockedInstances);
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('exportFailed'));
    }
  };

  const handleImport = (data: any, resolution: { width: number; height: number }) => {
    // Only import fields that exist (not null)
    const importPayload: any = {};
    if (data.packInfo) importPayload.packInfo = data.packInfo;

    // Use the resolution from modal instead of detected resolution
    importPayload.resolution = resolution;

    if (data.layout) importPayload.layout = data.layout;

    // Update background with correct crop dimensions for the selected resolution
    if (data.background) {
      importPayload.background = {
        ...data.background,
        imageCropWidth: resolution.width,
        imageCropHeight: resolution.height,
      };
    }

    if (data.sounds) importPayload.sounds = data.sounds;
    if (data.lockImages) importPayload.lockImages = data.lockImages;
    if (typeof data.replaceLockedInstances === 'boolean') importPayload.replaceLockedInstances = data.replaceLockedInstances;

    importData(importPayload);
    alert(t('importSuccess'));
  };

  const handleResolutionChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomResolution(true);
    } else {
      setShowCustomResolution(false);
      const [width, height] = value.split('x').map(Number);
      setResolution({ width, height });
    }
  };

  const handleCustomResolutionApply = () => {
    const width = parseInt(customResolution.width);
    const height = parseInt(customResolution.height);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      setResolution({ width, height });
    }
  };

  const handleShare = () => {
    // Encode layout to base64
    const layoutData = btoa(JSON.stringify(layout));

    // Create share URL with layout and resolution parameters
    const url = new URL(window.location.href);
    url.searchParams.set('layout', layoutData);
    url.searchParams.set('resolution', `${resolution.width}x${resolution.height}`);
    setShareUrl(url.toString());
    setShowShareModal(true);
  };

  return (
    <div className="flex flex-col h-screen bg-app">
      <header className="app-header flex-shrink-0">
        <div className="max-w-[1920px] mx-auto h-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary leading-none">
                SeedQueue Wall Maker
              </h1>
              <VersionChip
                versionInfo={versionInfo}
                languageSwitcher={
                  <div className="flex gap-2">
                    <Button
                      variant={language === 'ja' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('ja')}
                      className="flex-1"
                    >
                      日本語
                    </Button>
                    <Button
                      variant={language === 'en' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('en')}
                      className="flex-1"
                    >
                      English
                    </Button>
                  </div>
                }
                translations={{
                  versionLabel: t('versionLabel'),
                  authorLabel: t('authorLabel'),
                  repositoryLabel: t('repositoryLabel'),
                  changelogLabel: t('changelogLabel'),
                }}
              />
            </div>
            <div className="flex items-center gap-6">
              {!showCustomResolution ? (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-secondary whitespace-nowrap">
                    {t('resolution')}
                  </label>
                  <div className="w-48">
                    <Select
                      value={`${resolution.width}x${resolution.height}`}
                      onChange={(e) => handleResolutionChange(e.target.value)}
                      options={[
                        { value: '1920x1080', label: 'FHD (1920x1080)' },
                        { value: '2560x1440', label: 'WQHD (2560x1440)' },
                        { value: '3840x2160', label: '4K (3840x2160)' },
                        { value: 'custom', label: t('custom') },
                      ]}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={t('width')}
                    value={customResolution.width}
                    onChange={(e) => setCustomResolution({ ...customResolution, width: e.target.value })}
                    className="w-20 px-2 py-1 border border-default rounded text-sm bg-white dark:bg-gray-700 text-primary"
                    min="1"
                  />
                  <span className="text-secondary">×</span>
                  <input
                    type="number"
                    placeholder={t('height')}
                    value={customResolution.height}
                    onChange={(e) => setCustomResolution({ ...customResolution, height: e.target.value })}
                    className="w-20 px-2 py-1 border border-default rounded text-sm bg-white dark:bg-gray-700 text-primary"
                    min="1"
                  />
                  <Button size="sm" onClick={handleCustomResolutionApply}>
                    {t('apply')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomResolution(false);
                      setCustomResolution({ width: '', height: '' });
                    }}
                  >
                    {t('cancel')}
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportModal(true)}
                >
                  {t('import')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  title={t('shareLayout')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(t('confirmReset'))) {
                      resetToDefault();
                    }
                  }}
                >
                  {t('reset')}
                </Button>
                <Button size="sm" onClick={handleDownload}>{t('download')}</Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="max-w-[1920px] mx-auto h-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Panel - Settings */}
            <div className="lg:col-span-1 min-h-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-full flex flex-col">
                <Tabs defaultValue="info" className="h-full flex flex-col">
                  <div className="p-6 pb-4 flex-shrink-0">
                    <TabsList>
                      <TabsTrigger value="info">{t('tabInfo')}</TabsTrigger>
                      <TabsTrigger value="background">{t('tabBackground')}</TabsTrigger>
                      <TabsTrigger value="layout">{t('tabLayout')}</TabsTrigger>
                      <TabsTrigger value="lockImages">{t('tabLockImages')}</TabsTrigger>
                      <TabsTrigger value="sound">{t('tabSound')}</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
                    <TabsContent value="info" className="mt-0">
                      <PackInfo />
                    </TabsContent>

                    <TabsContent value="background" className="mt-0">
                      <BackgroundSettings />
                    </TabsContent>

                    <TabsContent value="layout" className="mt-0">
                      <LayoutEditor onShowTips={() => setShowTipsModal(true)} />
                    </TabsContent>

                    <TabsContent value="lockImages" className="mt-0">
                      <LockImageSettings />
                    </TabsContent>

                    <TabsContent value="sound" className="mt-0">
                      <SoundSettings />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('preview')}</h2>
                <div className="flex justify-center">
                  <WallPreview />
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>{t('previewHint')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <TipsModal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)} />
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} shareUrl={shareUrl} />
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={handleImport} />
    </div>
  );
}

export default App;
