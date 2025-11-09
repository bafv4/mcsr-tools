import { useRef } from 'react';
import { useWallStore } from '../store/useWallStore';
import { Button, Switch } from '@mcsr-tools/ui';
import { useI18n } from '../i18n/I18nContext';

export function LockImageSettings() {
  const { t } = useI18n();
  const { lockImages, addLockImage, removeLockImage, setLockImages } = useWallStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process all selected files
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          addLockImage(result);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    removeLockImage(index);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('lockImagesTitle')}</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{t('useLockImages')}</span>
          </div>
          <Switch
            checked={lockImages.enabled}
            onChange={(e) => setLockImages({ enabled: e.target.checked })}
          />
        </div>
      </div>

      {lockImages.enabled && (
        <>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              {t('addImage')}
            </Button>
          </div>

          {lockImages.images.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {t('registeredImages')} ({lockImages.images.length})
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {lockImages.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group border border-gray-300 dark:border-gray-600 rounded overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`Lock ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                        className="bg-white dark:bg-gray-800 opacity-90 hover:opacity-100"
                      >
                        {t('removeImage')}
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1">
                      {lockImages.images.length === 1 ? 'lock.png' : `lock-${index + 1}.png`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
