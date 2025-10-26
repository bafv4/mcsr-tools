import { useState, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useWallStore } from '../store/useWallStore';
import { Button, Input, Select } from '@mcsr-tools/ui';
import { ImageCropModal } from './ImageCropModal';

export function BackgroundSettings() {
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
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">背景タイプ</h3>
        <div className="flex gap-2">
          <Button
            variant={background.type === 'color' ? 'primary' : 'outline'}
            onClick={() => setBackground({ type: 'color' })}
          >
            単色
          </Button>
          <Button
            variant={background.type === 'image' ? 'primary' : 'outline'}
            onClick={() => setBackground({ type: 'image' })}
          >
            画像
          </Button>
          <Button
            variant={background.type === 'gradient' ? 'primary' : 'outline'}
            onClick={() => setBackground({ type: 'gradient' })}
          >
            グラデーション
          </Button>
        </div>
      </div>

      {background.type === 'color' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">単色設定</h3>
          <div className="space-y-2">
            <Input
              label="カラーコード"
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
                カラーピッカー
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">画像設定</h3>
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
                  {background.image ? '画像を変更' : '画像をアップロード'}
                </Button>
                {background.image && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowCropModal(true)}
                    >
                      調整
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRemoveImage}
                    >
                      削除
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">グラデーション設定</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                label="開始色"
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
                  カラーピッカー
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
                label="終了色"
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
                  カラーピッカー
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
              label="方向"
              value={background.gradientDirection}
              onChange={(e) =>
                setBackground({
                  gradientDirection: e.target.value as any,
                })
              }
              options={[
                { value: 'vertical', label: '垂直' },
                { value: 'horizontal', label: '水平' },
                { value: 'diagonal', label: '対角線' },
                { value: 'reverse-diagonal', label: '逆対角線' },
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
