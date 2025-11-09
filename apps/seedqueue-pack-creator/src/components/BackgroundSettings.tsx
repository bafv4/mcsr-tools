import { useState, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useWallStore } from '../store/useWallStore';
import { Button, Input, Select } from '@mcsr-tools/ui';
import { ImageCropModal } from './ImageCropModal';
import { useI18n } from '../i18n/I18nContext';

export function BackgroundSettings() {
  const { t } = useI18n();
  const { background, setBackground, resolution } = useWallStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackground({ image: event.target?.result as string });
      // Open crop modal after image upload
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setBackground({ image: null });
    handleResetAdjustments();
  };

  const handleResetAdjustments = () => {
    setBackground({
      imageBrightness: 100,
      imageBlur: 0,
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageScale: 1,
    });
  };

  const handleSaveCrop = (adjustments: {
    scale: number;
    offsetX: number;
    offsetY: number;
    brightness: number;
    blur: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
  }) => {
    setBackground({
      imageScale: adjustments.scale,
      imageOffsetX: adjustments.offsetX,
      imageOffsetY: adjustments.offsetY,
      imageBrightness: adjustments.brightness,
      imageBlur: adjustments.blur,
      imageCropX: adjustments.cropX,
      imageCropY: adjustments.cropY,
      imageCropWidth: adjustments.cropWidth,
      imageCropHeight: adjustments.cropHeight,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('backgroundTitle')}</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="text-md font-semibold mb-4 text-gray-900 dark:text-white">{t('backgroundType')}</h4>
          <div className="flex gap-2 items-center">
            <Button
              variant={background.type === 'color' ? 'primary' : 'outline'}
              onClick={() => setBackground({ type: 'color' })}
              className="flex-1"
              size="sm"
            >
              {t('colorType')}
            </Button>
            <Button
              variant={background.type === 'image' ? 'primary' : 'outline'}
              onClick={() => setBackground({ type: 'image' })}
              className="flex-1"
              size="sm"
            >
              {t('imageType')}
            </Button>
            <Button
              variant={background.type === 'gradient' ? 'primary' : 'outline'}
              onClick={() => setBackground({ type: 'gradient' })}
              className="flex-1"
              size="sm"
            >
              {t('gradientType')}
            </Button>
          </div>
        </div>
      </div>

      {background.type === 'color' && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">{t('colorSelect')}</h4>
          <div className="space-y-2">
            <Input
              label={t('colorCode')}
              value={background.color}
              onChange={(e) => setBackground({ color: e.target.value })}
              placeholder="#1a1a1a"
            />
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full"
              >
                <div
                  className="w-6 h-6 rounded mr-2 border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: background.color }}
                />
                {t('colorPicker')}
              </Button>
              {showColorPicker && (
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <HexColorPicker
                    color={background.color}
                    onChange={(color) => setBackground({ color })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {background.type === 'image' && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">{t('imageSelect')}</h4>
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  {background.image ? t('changeImage') : t('uploadImage')}
                </Button>
                {background.image && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowCropModal(true)}
                    >
                      {t('adjustImage')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRemoveImage}
                    >
                      {t('removeImage')}
                    </Button>
                  </>
                )}
              </div>
              {background.image && (
                <div className="mt-2">
                  <img
                    src={background.image}
                    alt="Background preview"
                    className="w-full h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {background.type === 'gradient' && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">{t('gradientSettings')}</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                label={t('gradientStart')}
                value={background.gradientStart}
                onChange={(e) => setBackground({ gradientStart: e.target.value })}
                placeholder="#1a1a1a"
              />
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowStartPicker(!showStartPicker)}
                  className="w-full"
                >
                  <div
                    className="w-6 h-6 rounded mr-2 border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: background.gradientStart }}
                  />
                  {t('colorPicker')}
                </Button>
                {showStartPicker && (
                  <div className="absolute z-10 mt-2">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowStartPicker(false)}
                    />
                    <HexColorPicker
                      color={background.gradientStart}
                      onChange={(color) => setBackground({ gradientStart: color })}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Input
                label={t('gradientEnd')}
                value={background.gradientEnd}
                onChange={(e) => setBackground({ gradientEnd: e.target.value })}
                placeholder="#4a4a4a"
              />
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowEndPicker(!showEndPicker)}
                  className="w-full"
                >
                  <div
                    className="w-6 h-6 rounded mr-2 border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: background.gradientEnd }}
                  />
                  {t('colorPicker')}
                </Button>
                {showEndPicker && (
                  <div className="absolute z-10 mt-2">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowEndPicker(false)}
                    />
                    <HexColorPicker
                      color={background.gradientEnd}
                      onChange={(color) => setBackground({ gradientEnd: color })}
                    />
                  </div>
                )}
              </div>
            </div>
            <Select
              label={t('gradientDirection')}
              value={background.gradientDirection}
              onChange={(e) =>
                setBackground({
                  gradientDirection: e.target.value as any,
                })
              }
              options={[
                { value: 'vertical', label: t('vertical') },
                { value: 'horizontal', label: t('horizontal') },
                { value: 'diagonal', label: t('diagonal') },
                { value: 'reverse-diagonal', label: t('reverseDiagonal') },
              ]}
            />
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {background.image && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageUrl={background.image}
          onSave={handleSaveCrop}
          initialAdjustments={{
            scale: background.imageScale,
            offsetX: background.imageOffsetX,
            offsetY: background.imageOffsetY,
            brightness: background.imageBrightness,
            blur: background.imageBlur,
            cropX: background.imageCropX,
            cropY: background.imageCropY,
            cropWidth: background.imageCropWidth,
            cropHeight: background.imageCropHeight,
          }}
          resolution={resolution}
        />
      )}
    </div>
  );
}
