import { useState } from 'react';
import { Modal, Button } from '@mcsr-tools/ui';
import { useWallStore } from '../store/useWallStore';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TipsModal({ isOpen, onClose }: TipsModalProps) {
  const { layout } = useWallStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate instance size if grid is enabled
  const getInstanceSize = () => {
    if (!layout.main.useGrid) {
      return null;
    }

    const padding = layout.main.padding ?? 0;
    const cellWidth = Math.floor(layout.main.width / layout.main.columns);
    const cellHeight = Math.floor(layout.main.height / layout.main.rows);

    // Subtract padding from both sides of the cell
    const instanceWidth = cellWidth - padding * 2;
    const instanceHeight = cellHeight - padding * 2;

    return {
      width: instanceWidth,
      height: instanceHeight,
    };
  };

  const instanceSize = getInstanceSize();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!instanceSize) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="インスタンスサイズ">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">幅</span>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {instanceSize.width}
              </div>
            </div>
            <Button
              variant={copiedId === 'width' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCopy(instanceSize.width.toString(), 'width')}
            >
              {copiedId === 'width' ? '✓ コピー済み' : 'コピー'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">高さ</span>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {instanceSize.height}
              </div>
            </div>
            <Button
              variant={copiedId === 'height' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCopy(instanceSize.height.toString(), 'height')}
            >
              {copiedId === 'height' ? '✓ コピー済み' : 'コピー'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
