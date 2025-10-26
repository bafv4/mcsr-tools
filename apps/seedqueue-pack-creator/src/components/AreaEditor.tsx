import { useCallback, memo } from 'react';
import { useWallStore, Area } from '../store/useWallStore';
import { Input, Button, Switch } from '@mcsr-tools/ui';

interface AreaEditorProps {
  area: 'main' | 'locked' | 'preparing';
  title: string;
  color: string;
  showToggle?: boolean;
  allowGridToggle?: boolean; // Whether to allow toggling grid layout
}

export const AreaEditor = memo(function AreaEditor({ area, title, color, showToggle, allowGridToggle = false }: AreaEditorProps) {
  const { layout, resolution, updateArea } = useWallStore();
  const areaData = layout[area];

  const handleChange = useCallback((field: keyof Area, value: number) => {
    updateArea(area, { [field]: value });
  }, [area, updateArea]);

  const handleCenterHorizontal = useCallback(() => {
    const x = Math.round((resolution.width - areaData.width) / 2);
    updateArea(area, { x });
  }, [area, resolution.width, areaData.width, updateArea]);

  const handleCenterVertical = useCallback(() => {
    const y = Math.round((resolution.height - areaData.height) / 2);
    updateArea(area, { y });
  }, [area, resolution.height, areaData.height, updateArea]);

  const handleToggleShow = useCallback(() => {
    if ('show' in areaData) {
      updateArea(area, { show: !areaData.show } as any);
    }
  }, [area, areaData, updateArea]);

  const handleToggleGrid = useCallback(() => {
    updateArea(area, { useGrid: !areaData.useGrid } as any);
  }, [area, areaData.useGrid, updateArea]);

  const showGridInputs = allowGridToggle ? (areaData.useGrid ?? true) : true;

  const handleXChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('x', Number(e.target.value));
  }, [handleChange]);

  const handleYChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('y', Number(e.target.value));
  }, [handleChange]);

  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('width', Number(e.target.value));
  }, [handleChange]);

  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('height', Number(e.target.value));
  }, [handleChange]);

  const handleRowsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('rows', Number(e.target.value));
  }, [handleChange]);

  const handleColumnsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('columns', Number(e.target.value));
  }, [handleChange]);

  return (
    <div className="border rounded-lg p-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color }}>
          {title}
        </h3>
        {showToggle && 'show' in areaData && (
          <Switch
            checked={areaData.show}
            onChange={handleToggleShow}
            label="表示"
          />
        )}
      </div>

      {/* Group 1: Position, Size, and Alignment */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-secondary mb-3">座標・サイズ</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              label="X座標 (px)"
              type="number"
              value={areaData.x}
              onChange={handleXChange}
            />
          </div>
          <div>
            <Input
              label="Y座標 (px)"
              type="number"
              value={areaData.y}
              onChange={handleYChange}
            />
          </div>
          <div>
            <Input
              label="幅 (px)"
              type="number"
              value={areaData.width}
              onChange={handleWidthChange}
            />
          </div>
          <div>
            <Input
              label="高さ (px)"
              type="number"
              value={areaData.height}
              onChange={handleHeightChange}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCenterHorizontal}>
            左右中央
          </Button>
          <Button variant="outline" size="sm" onClick={handleCenterVertical}>
            上下中央
          </Button>
        </div>
      </div>

      {/* Group 2: Grid Settings */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-secondary">グリッド設定</h4>
          {allowGridToggle && (
            <Switch
              checked={areaData.useGrid ?? true}
              onChange={handleToggleGrid}
              label="使用する"
            />
          )}
        </div>
        {showGridInputs && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="タテ"
                type="number"
                min="1"
                value={areaData.rows}
                onChange={handleRowsChange}
              />
            </div>
            <div>
              <Input
                label="ヨコ"
                type="number"
                min="1"
                value={areaData.columns}
                onChange={handleColumnsChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
