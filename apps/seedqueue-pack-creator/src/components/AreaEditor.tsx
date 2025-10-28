import { useCallback, memo, useState, useEffect } from 'react';
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

  // Local state for input values to prevent validation on empty
  const [localRows, setLocalRows] = useState(String(areaData.rows));
  const [localColumns, setLocalColumns] = useState(String(areaData.columns));
  const [localPadding, setLocalPadding] = useState(String(areaData.padding ?? 0));
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync local state with store when areaData changes
  useEffect(() => {
    setLocalRows(String(areaData.rows));
    setLocalColumns(String(areaData.columns));
    setLocalPadding(String(areaData.padding ?? 0));
  }, [areaData.rows, areaData.columns, areaData.padding]);

  const validateGrid = useCallback((rows: number, columns: number): string | null => {
    if (rows * columns > 30) {
      return 'タテ × ヨコは30以下にしてください';
    }
    return null;
  }, []);

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
    setLocalRows(e.target.value);
  }, []);

  const handleRowsBlur = useCallback(() => {
    const value = localRows === '' ? 1 : Math.max(1, Number(localRows));
    const columns = areaData.columns;
    const error = validateGrid(value, columns);
    setValidationError(error);
    if (!error) {
      handleChange('rows', value);
    }
    setLocalRows(String(value));
  }, [localRows, areaData.columns, validateGrid, handleChange]);

  const handleRowsSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const columns = areaData.columns;
    const error = validateGrid(value, columns);
    setValidationError(error);
    if (!error) {
      handleChange('rows', value);
      setLocalRows(String(value));
    }
  }, [areaData.columns, validateGrid, handleChange]);

  const handleColumnsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColumns(e.target.value);
  }, []);

  const handleColumnsBlur = useCallback(() => {
    const value = localColumns === '' ? 1 : Math.max(1, Number(localColumns));
    const rows = areaData.rows;
    const error = validateGrid(rows, value);
    setValidationError(error);
    if (!error) {
      handleChange('columns', value);
    }
    setLocalColumns(String(value));
  }, [localColumns, areaData.rows, validateGrid, handleChange]);

  const handleColumnsSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const rows = areaData.rows;
    const error = validateGrid(rows, value);
    setValidationError(error);
    if (!error) {
      handleChange('columns', value);
      setLocalColumns(String(value));
    }
  }, [areaData.rows, validateGrid, handleChange]);

  const handlePaddingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPadding(e.target.value);
  }, []);

  const handlePaddingBlur = useCallback(() => {
    const value = localPadding === '' ? 0 : Math.max(0, Math.min(64, Number(localPadding)));
    handleChange('padding', value);
    setLocalPadding(String(value));
  }, [localPadding, handleChange]);

  const handlePaddingSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    handleChange('padding', value);
    setLocalPadding(String(value));
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
        {validationError && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
            {validationError}
          </div>
        )}
        {showGridInputs && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="タテ"
                  type="number"
                  min="1"
                  value={localRows}
                  onChange={handleRowsChange}
                  onBlur={handleRowsBlur}
                />
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={areaData.rows}
                  onChange={handleRowsSliderChange}
                  className="w-full mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div>
                <Input
                  label="ヨコ"
                  type="number"
                  min="1"
                  value={localColumns}
                  onChange={handleColumnsChange}
                  onBlur={handleColumnsBlur}
                />
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={areaData.columns}
                  onChange={handleColumnsSliderChange}
                  className="w-full mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
            <div>
              <Input
                label="Padding (px)"
                type="number"
                min="0"
                max="64"
                value={localPadding}
                onChange={handlePaddingChange}
                onBlur={handlePaddingBlur}
              />
              <input
                type="range"
                min="0"
                max="64"
                value={areaData.padding ?? 0}
                onChange={handlePaddingSliderChange}
                className="w-full mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
