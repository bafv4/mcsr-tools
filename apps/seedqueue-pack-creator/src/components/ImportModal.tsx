import { useState, useRef } from 'react';
import { Modal, Button, Select } from '@mcsr-tools/ui';
import { importResourcePack } from '../utils/packImport';
import { useI18n } from '../i18n/I18nContext';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any, resolution: { width: number; height: number }) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resolution, setResolution] = useState({ width: 1920, height: 1080 });
  const [customResolution, setCustomResolution] = useState({ width: '', height: '' });
  const [showCustomResolution, setShowCustomResolution] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
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
      setShowCustomResolution(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert(t('pleaseSelectFile'));
      return;
    }

    setIsImporting(true);
    try {
      const data = await importResourcePack(selectedFile);
      onImport(data, resolution);
      onClose();
      setSelectedFile(null);
      setResolution({ width: 1920, height: 1080 });
      setShowCustomResolution(false);
      setCustomResolution({ width: '', height: '' });
    } catch (error) {
      console.error('Import failed:', error);
      alert(t('importFailed'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setResolution({ width: 1920, height: 1080 });
    setShowCustomResolution(false);
    setCustomResolution({ width: '', height: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={t('importResourcePack')}>
      <div className="space-y-6">
        {/* File selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('selectFile')}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              {selectedFile ? selectedFile.name : t('chooseFile')}
            </Button>
            {selectedFile && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                {t('clear')}
              </Button>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {t('zipFilePrompt')}
          </p>
        </div>

        {/* Resolution selection */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('specifyResolution')}
          </label>
          {!showCustomResolution ? (
            <div className="flex items-center gap-2">
              <Select
                value={`${resolution.width}x${resolution.height}`}
                onChange={(e) => handleResolutionChange(e.target.value)}
                options={[
                  { value: '1920x1080', label: 'FHD (1920x1080)' },
                  { value: '2560x1440', label: 'WQHD (2560x1440)' },
                  { value: '3840x2160', label: '4K (3840x2160)' },
                  { value: '1280x720', label: 'HD (1280x720)' },
                  { value: '1366x768', label: 'WXGA (1366x768)' },
                  { value: '1600x900', label: 'HD+ (1600x900)' },
                  { value: 'custom', label: t('custom') },
                ]}
                className="flex-1"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={t('width')}
                value={customResolution.width}
                onChange={(e) => setCustomResolution({ ...customResolution, width: e.target.value })}
                className="flex-1 px-3 py-2 border border-default rounded text-sm bg-white dark:bg-gray-700 text-primary"
                min="1"
              />
              <span className="text-secondary">×</span>
              <input
                type="number"
                placeholder={t('height')}
                value={customResolution.height}
                onChange={(e) => setCustomResolution({ ...customResolution, height: e.target.value })}
                className="flex-1 px-3 py-2 border border-default rounded text-sm bg-white dark:bg-gray-700 text-primary"
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
                  setResolution({ width: 1920, height: 1080 });
                }}
              >
                {t('cancel')}
              </Button>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {t('importResolutionNote')}<br />
            {t('layoutNoteResolution')}
          </p>
        </div>

        {/* Info section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">{t('resolutionSelectionAbout')}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t('resolutionMatchNote')}<br />
                {t('recommendFHD')}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleCancel} disabled={isImporting}>
            {t('cancel')}
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || isImporting}>
            {isImporting ? t('importing') : t('import')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
