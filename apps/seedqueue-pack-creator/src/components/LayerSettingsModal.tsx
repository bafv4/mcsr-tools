import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Select } from '@mcsr-tools/ui';
import { HexColorPicker } from 'react-colorful';
import { useI18n } from '../i18n/I18nContext';
import {
  BackgroundLayer,
  BackgroundLayerType,
  ColorLayer,
  ImageLayer,
  GradientLayer,
  Resolution,
} from '../store/useWallStore';

interface LayerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  layer: BackgroundLayer;
  onSave: (updates: Partial<BackgroundLayer> & { type?: BackgroundLayerType }) => void;
  onChangeType: (newType: BackgroundLayerType, imageData?: string) => void;
  resolution: Resolution;
  isBottomLayer: boolean;
}

export function LayerSettingsModal({
  isOpen,
  onClose,
  layer,
  onSave,
  onChangeType,
  resolution,
  isBottomLayer,
}: LayerSettingsModalProps) {
  const { t } = useI18n();

  // Layer type state
  const [layerType, setLayerType] = useState<BackgroundLayerType>(layer.type);

  // Common state for all layer types
  const [opacity, setOpacity] = useState(layer.opacity ?? 1);

  // Color layer state
  const [color, setColor] = useState((layer as ColorLayer).color ?? '#1a1a1a');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Position and size state for color/gradient layers
  const [layerX, setLayerX] = useState((layer as ColorLayer).x ?? 0);
  const [layerY, setLayerY] = useState((layer as ColorLayer).y ?? 0);
  const [layerWidth, setLayerWidth] = useState((layer as ColorLayer).width ?? resolution.width);
  const [layerHeight, setLayerHeight] = useState((layer as ColorLayer).height ?? resolution.height);

  // Gradient layer state
  const [gradientStart, setGradientStart] = useState((layer as GradientLayer).gradientStart ?? '#1a1a1a');
  const [gradientEnd, setGradientEnd] = useState((layer as GradientLayer).gradientEnd ?? '#4a4a4a');
  const [gradientDirection, setGradientDirection] = useState<GradientLayer['gradientDirection']>(
    (layer as GradientLayer).gradientDirection ?? 'vertical'
  );
  const [showGradientStartPicker, setShowGradientStartPicker] = useState(false);
  const [showGradientEndPicker, setShowGradientEndPicker] = useState(false);

  // Image layer state
  const imageLayer = layer as ImageLayer;
  const [imageData, setImageData] = useState(imageLayer.image ?? '');
  const [brightness, setBrightness] = useState(imageLayer.brightness ?? 100);
  const [blur, setBlur] = useState(imageLayer.blur ?? 0);
  const [cropX, setCropX] = useState(imageLayer.cropX ?? 0);
  const [cropY, setCropY] = useState(imageLayer.cropY ?? 0);
  const [cropWidth, setCropWidth] = useState(imageLayer.cropWidth ?? resolution.width);
  const [cropHeight, setCropHeight] = useState(imageLayer.cropHeight ?? resolution.height);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens or layer changes
  useEffect(() => {
    if (isOpen) {
      setLayerType(layer.type);
      setOpacity(layer.opacity ?? 1);

      if (layer.type === 'color') {
        const cl = layer as ColorLayer;
        setColor(cl.color);
        setLayerX(cl.x);
        setLayerY(cl.y);
        setLayerWidth(cl.width);
        setLayerHeight(cl.height);
      } else if (layer.type === 'gradient') {
        const gl = layer as GradientLayer;
        setGradientStart(gl.gradientStart);
        setGradientEnd(gl.gradientEnd);
        setGradientDirection(gl.gradientDirection);
        setLayerX(gl.x);
        setLayerY(gl.y);
        setLayerWidth(gl.width);
        setLayerHeight(gl.height);
      } else if (layer.type === 'image') {
        const il = layer as ImageLayer;
        setImageData(il.image);
        setBrightness(il.brightness);
        setBlur(il.blur);
        setCropX(il.cropX);
        setCropY(il.cropY);
        setCropWidth(il.cropWidth);
        setCropHeight(il.cropHeight);
      }
    }
  }, [isOpen, layer]);

  const handleTypeChange = (newType: BackgroundLayerType) => {
    if (newType === 'image') {
      // Trigger file picker for image
      fileInputRef.current?.click();
    } else {
      // Change to color or gradient
      setLayerType(newType);
      onChangeType(newType);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      setImageData(data);
      setLayerType('image');
      // Reset image settings
      setBrightness(100);
      setBlur(0);
      setCropX(0);
      setCropY(0);
      setCropWidth(resolution.width);
      setCropHeight(resolution.height);
      onChangeType('image', data);
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const finalOpacity = isBottomLayer ? 1 : opacity;

    if (layerType === 'color') {
      onSave({
        color,
        opacity: finalOpacity,
        x: layerX,
        y: layerY,
        width: layerWidth,
        height: layerHeight,
      } as Partial<ColorLayer>);
    } else if (layerType === 'gradient') {
      onSave({
        gradientStart,
        gradientEnd,
        gradientDirection,
        opacity: finalOpacity,
        x: layerX,
        y: layerY,
        width: layerWidth,
        height: layerHeight,
      } as Partial<GradientLayer>);
    } else if (layerType === 'image') {
      onSave({
        image: imageData,
        brightness,
        blur,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        opacity: finalOpacity,
      } as Partial<ImageLayer>);
    }
    onClose();
  };

  const handleReset = () => {
    setOpacity(1);

    if (layerType === 'color') {
      setColor('#1a1a1a');
      setLayerX(0);
      setLayerY(0);
      setLayerWidth(resolution.width);
      setLayerHeight(resolution.height);
    } else if (layerType === 'gradient') {
      setGradientStart('#1a1a1a');
      setGradientEnd('#4a4a4a');
      setGradientDirection('vertical');
      setLayerX(0);
      setLayerY(0);
      setLayerWidth(resolution.width);
      setLayerHeight(resolution.height);
    } else if (layerType === 'image') {
      setBrightness(100);
      setBlur(0);
      setCropX(0);
      setCropY(0);
      setCropWidth(resolution.width);
      setCropHeight(resolution.height);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('layerSettings')}
      size="md"
    >
      <div className="flex flex-col">
        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Layer Type Selector */}
        <div className="mb-4">
          <Select
            label={t('layerType')}
            value={layerType}
            onChange={(e) => handleTypeChange(e.target.value as BackgroundLayerType)}
            options={[
              { value: 'color', label: t('colorType') },
              { value: 'gradient', label: t('gradientType') },
              { value: 'image', label: t('imageType') },
            ]}
          />
        </div>

        {/* Color Layer Settings */}
        {layerType === 'color' && (
          <div className="space-y-4">
            <div>
              <Input
                label={t('colorCode')}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#1a1a1a"
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full"
              >
                <div
                  className="w-6 h-6 rounded mr-2 border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                />
                {t('colorPicker')}
              </Button>
              {showColorPicker && (
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <HexColorPicker color={color} onChange={setColor} />
                </div>
              )}
            </div>
            {/* Position and Size */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('positionSize')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={t('layerX')}
                  type="number"
                  value={layerX}
                  onChange={(e) => setLayerX(Number(e.target.value))}
                />
                <Input
                  label={t('layerY')}
                  type="number"
                  value={layerY}
                  onChange={(e) => setLayerY(Number(e.target.value))}
                />
                <Input
                  label={t('layerWidth')}
                  type="number"
                  value={layerWidth}
                  onChange={(e) => setLayerWidth(Math.max(1, Number(e.target.value)))}
                />
                <Input
                  label={t('layerHeight')}
                  type="number"
                  value={layerHeight}
                  onChange={(e) => setLayerHeight(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Gradient Layer Settings */}
        {layerType === 'gradient' && (
          <div className="space-y-4">
            <div>
              <Input
                label={t('gradientStart')}
                value={gradientStart}
                onChange={(e) => setGradientStart(e.target.value)}
                placeholder="#1a1a1a"
              />
              <div className="relative mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGradientStartPicker(!showGradientStartPicker)}
                  className="w-full"
                >
                  <div
                    className="w-6 h-6 rounded mr-2 border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: gradientStart }}
                  />
                  {t('colorPicker')}
                </Button>
                {showGradientStartPicker && (
                  <div className="absolute z-10 mt-2">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowGradientStartPicker(false)}
                    />
                    <HexColorPicker color={gradientStart} onChange={setGradientStart} />
                  </div>
                )}
              </div>
            </div>
            <div>
              <Input
                label={t('gradientEnd')}
                value={gradientEnd}
                onChange={(e) => setGradientEnd(e.target.value)}
                placeholder="#4a4a4a"
              />
              <div className="relative mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGradientEndPicker(!showGradientEndPicker)}
                  className="w-full"
                >
                  <div
                    className="w-6 h-6 rounded mr-2 border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: gradientEnd }}
                  />
                  {t('colorPicker')}
                </Button>
                {showGradientEndPicker && (
                  <div className="absolute z-10 mt-2">
                    <div
                      className="fixed inset-0"
                      onClick={() => setShowGradientEndPicker(false)}
                    />
                    <HexColorPicker color={gradientEnd} onChange={setGradientEnd} />
                  </div>
                )}
              </div>
            </div>
            <Select
              label={t('gradientDirection')}
              value={gradientDirection}
              onChange={(e) => setGradientDirection(e.target.value as GradientLayer['gradientDirection'])}
              options={[
                { value: 'vertical', label: t('vertical') },
                { value: 'horizontal', label: t('horizontal') },
                { value: 'diagonal', label: t('diagonal') },
                { value: 'reverse-diagonal', label: t('reverseDiagonal') },
              ]}
            />
            {/* Gradient Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('preview')}
              </label>
              <div
                className="w-full h-24 rounded border border-gray-300 dark:border-gray-600"
                style={{
                  background: (() => {
                    switch (gradientDirection) {
                      case 'vertical':
                        return `linear-gradient(to bottom, ${gradientStart}, ${gradientEnd})`;
                      case 'horizontal':
                        return `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`;
                      case 'diagonal':
                        return `linear-gradient(to bottom right, ${gradientStart}, ${gradientEnd})`;
                      case 'reverse-diagonal':
                        return `linear-gradient(to bottom left, ${gradientStart}, ${gradientEnd})`;
                    }
                  })(),
                }}
              />
            </div>
            {/* Position and Size */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('positionSize')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={t('layerX')}
                  type="number"
                  value={layerX}
                  onChange={(e) => setLayerX(Number(e.target.value))}
                />
                <Input
                  label={t('layerY')}
                  type="number"
                  value={layerY}
                  onChange={(e) => setLayerY(Number(e.target.value))}
                />
                <Input
                  label={t('layerWidth')}
                  type="number"
                  value={layerWidth}
                  onChange={(e) => setLayerWidth(Math.max(1, Number(e.target.value)))}
                />
                <Input
                  label={t('layerHeight')}
                  type="number"
                  value={layerHeight}
                  onChange={(e) => setLayerHeight(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Layer Settings */}
        {layerType === 'image' && (
          <>
            {imageData ? (
              <div className="space-y-4">
                {/* Image preview thumbnail */}
                <div className="flex items-center gap-4">
                  <img
                    src={imageData}
                    alt="Layer preview"
                    className="w-24 h-24 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('changeImage')}
                  </Button>
                </div>
                {/* Brightness and Blur */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('brightness')}: {brightness}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('blurAmount')}: {blur}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                {/* Crop Position and Size */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('positionSize')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label={t('layerX')}
                      type="number"
                      value={cropX}
                      onChange={(e) => setCropX(Number(e.target.value))}
                    />
                    <Input
                      label={t('layerY')}
                      type="number"
                      value={cropY}
                      onChange={(e) => setCropY(Number(e.target.value))}
                    />
                    <Input
                      label={t('layerWidth')}
                      type="number"
                      value={cropWidth}
                      min="50"
                      onChange={(e) => setCropWidth(Math.max(50, Number(e.target.value)))}
                    />
                    <Input
                      label={t('layerHeight')}
                      type="number"
                      value={cropHeight}
                      min="50"
                      onChange={(e) => setCropHeight(Math.max(50, Number(e.target.value)))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('selectImagePrompt')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('uploadImage')}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Opacity slider (shown for all types except bottom layer) */}
        {!isBottomLayer && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('opacity')}: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {isBottomLayer && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('bottomLayerOpacityNote')}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            {t('reset')}
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={layerType === 'image' && !imageData}>
            {t('apply')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
