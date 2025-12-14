import { useState } from 'react';
import { useWallStore, BackgroundLayer, ImageLayer, ColorLayer, GradientLayer, BackgroundLayerType } from '../store/useWallStore';
import { Button } from '@mcsr-tools/ui';
import { LayerSettingsModal } from './LayerSettingsModal';
import { useI18n } from '../i18n/I18nContext';

export function BackgroundSettings() {
  const { t } = useI18n();
  const {
    background,
    resolution,
    addLayer,
    removeLayer,
    updateLayer,
    reorderLayers,
    selectedLayerId,
    selectLayer,
  } = useWallStore();
  const [editingLayer, setEditingLayer] = useState<BackgroundLayer | null>(null);

  const handleAddLayer = () => {
    // Add a default color layer
    addLayer('color');
    // Open settings modal for the newly added layer
    setTimeout(() => {
      const layers = useWallStore.getState().background.layers;
      const newLayer = layers[layers.length - 1];
      if (newLayer) {
        setEditingLayer(newLayer);
      }
    }, 0);
  };

  const handleRemoveLayer = (id: string) => {
    if (selectedLayerId === id) {
      selectLayer(null);
    }
    removeLayer(id);
  };

  const handleEditLayer = (layer: BackgroundLayer) => {
    setEditingLayer(layer);
  };

  const handleSaveLayer = (updates: Partial<BackgroundLayer>) => {
    if (editingLayer) {
      updateLayer(editingLayer.id, updates);
    }
    setEditingLayer(null);
  };

  const handleChangeLayerType = (newType: BackgroundLayerType, imageData?: string) => {
    if (!editingLayer) return;

    // Create a new layer object with the new type
    const currentOpacity = editingLayer.opacity;

    if (newType === 'color') {
      updateLayer(editingLayer.id, {
        type: 'color',
        color: '#1a1a1a',
        opacity: currentOpacity,
      } as any);
    } else if (newType === 'gradient') {
      updateLayer(editingLayer.id, {
        type: 'gradient',
        gradientStart: '#1a1a1a',
        gradientEnd: '#4a4a4a',
        gradientDirection: 'vertical',
        opacity: currentOpacity,
      } as any);
    } else if (newType === 'image' && imageData) {
      updateLayer(editingLayer.id, {
        type: 'image',
        image: imageData,
        brightness: 100,
        blur: 0,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        cropX: 0,
        cropY: 0,
        cropWidth: resolution.width,
        cropHeight: resolution.height,
        opacity: currentOpacity,
      } as any);
    }

    // Update the editingLayer reference to reflect the new type
    setTimeout(() => {
      const updatedLayer = useWallStore.getState().background.layers.find(l => l.id === editingLayer.id);
      if (updatedLayer) {
        setEditingLayer(updatedLayer);
      }
    }, 0);
  };

  const handleMoveLayer = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index + 1 : index - 1;
    if (newIndex >= 0 && newIndex < background.layers.length) {
      reorderLayers(index, newIndex);
    }
  };

  const renderLayerPreview = (layer: BackgroundLayer) => {
    switch (layer.type) {
      case 'color':
        return (
          <div
            className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: (layer as ColorLayer).color }}
          />
        );
      case 'image':
        return (
          <img
            src={(layer as ImageLayer).image}
            alt="Layer"
            className="w-12 h-12 object-cover rounded border border-gray-300 dark:border-gray-600"
          />
        );
      case 'gradient': {
        const gradientLayer = layer as GradientLayer;
        const gradientStyle = getGradientStyle(gradientLayer);
        return (
          <div
            className="w-12 h-12 rounded border border-gray-300 dark:border-gray-600"
            style={{ background: gradientStyle }}
          />
        );
      }
    }
  };

  const getGradientStyle = (layer: GradientLayer): string => {
    const { gradientStart, gradientEnd, gradientDirection } = layer;
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
  };

  const getLayerTypeName = (type: BackgroundLayerType): string => {
    switch (type) {
      case 'color':
        return t('colorType');
      case 'image':
        return t('imageType');
      case 'gradient':
        return t('gradientType');
    }
  };

  // Get the current layer data for editing (may have changed since modal opened)
  const currentEditingLayer = editingLayer
    ? background.layers.find((l) => l.id === editingLayer.id)
    : null;

  // Check if a layer is the bottom layer (index 0)
  const isBottomLayer = (layerId: string) => {
    return background.layers.length > 0 && background.layers[0].id === layerId;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('backgroundTitle')}</h3>

        {/* Add Layer Button */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={handleAddLayer}
            className="w-full"
          >
            {t('addLayer')}
          </Button>
        </div>

        {/* Layer list - displayed from top to bottom (reverse order since layers are bottom to top) */}
        {background.layers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('layerOrder')}</p>
            {[...background.layers].reverse().map((layer, reversedIndex) => {
              const actualIndex = background.layers.length - 1 - reversedIndex;
              const isSelected = selectedLayerId === layer.id;
              const isImageLayer = layer.type === 'image';
              const isBottom = actualIndex === 0;
              return (
                <div key={layer.id}>
                  <div
                    onClick={() => isImageLayer ? selectLayer(isSelected ? null : layer.id) : undefined}
                    className={`flex items-center gap-2 p-2 rounded transition-colors ${
                      isImageLayer ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {renderLayerPreview(layer)}
                    <div className="flex-1">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {getLayerTypeName(layer.type)}
                      </div>
                      {!isBottom && layer.opacity < 1 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('opacity')}: {Math.round(layer.opacity * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLayer(layer)}
                        title={t('edit')}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveLayer(actualIndex, 'up')}
                        disabled={actualIndex === background.layers.length - 1}
                        title={t('moveUp')}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveLayer(actualIndex, 'down')}
                        disabled={actualIndex === 0}
                        title={t('moveDown')}
                      >
                        ↓
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveLayer(layer.id)}
                      >
                        {t('removeImage')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {background.layers.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            {t('noLayers')}
          </p>
        )}
      </div>

      {/* Layer Settings Modal */}
      {currentEditingLayer && (
        <LayerSettingsModal
          isOpen={!!editingLayer}
          onClose={() => setEditingLayer(null)}
          layer={currentEditingLayer}
          onSave={handleSaveLayer}
          onChangeType={handleChangeLayerType}
          resolution={resolution}
          isBottomLayer={isBottomLayer(currentEditingLayer.id)}
        />
      )}
    </div>
  );
}
