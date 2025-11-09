import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@mcsr-tools/ui';
import { useI18n } from '../i18n/I18nContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [shareName, setShareName] = useState('');
  const [finalShareUrl, setFinalShareUrl] = useState(shareUrl);

  useEffect(() => {
    // Update URL with share name
    if (shareUrl) {
      const url = new URL(shareUrl);
      if (shareName.trim()) {
        url.searchParams.set('name', shareName.trim());
      } else {
        url.searchParams.delete('name');
      }
      setFinalShareUrl(url.toString());
    }
  }, [shareUrl, shareName]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(finalShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert(t('copyUrlFailed'));
    }
  };

  const handleShareToTwitter = () => {
    const text = shareName.trim() ? shareName.trim() : 'SeedQueue Wall Maker';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(finalShareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('shareLayoutTitle')}>
      <div className="space-y-6">
        {/* Share Name Section */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('shareName')}
          </label>
          <Input
            type="text"
            value={shareName}
            onChange={(e) => setShareName(e.target.value)}
            placeholder={t('shareNamePlaceholder')}
            className="w-full"
          />
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {t('shareNameHelp')}
          </p>
        </div>

        {/* URL Copy Section */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('shareUrl')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={finalShareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-default rounded text-sm bg-gray-50 dark:bg-gray-700 text-primary font-mono"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              variant={copied ? 'primary' : 'outline'}
              onClick={handleCopyUrl}
              className="whitespace-nowrap"
            >
              {copied ? (
                <span className="flex items-center gap-2">
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t('copied')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
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
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {t('copyUrl')}
                </span>
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {t('shareUrlHelp')}
          </p>
        </div>

        {/* SNS Share Section */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            {t('shareOnSNS')}
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleShareToTwitter}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {t('shareOnTwitter')}
            </Button>
          </div>
        </div>

        {/* Info Section */}
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
              <p className="font-medium mb-1">{t('shareLayoutOnly')}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {t('shareLayoutOnlyDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
