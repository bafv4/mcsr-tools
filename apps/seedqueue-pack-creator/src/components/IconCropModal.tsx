import { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Button } from '@mcsr-tools/ui';
import { useI18n } from '../i18n/I18nContext';

interface IconCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string;
  onCrop: (croppedImage: string) => void;
}

export function IconCropModal({ isOpen, onClose, imageData, onCrop }: IconCropModalProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Canvas display size
  const CANVAS_SIZE = 400;

  // Load image when modal opens
  useEffect(() => {
    if (isOpen && imageData) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Calculate scale to fit image in canvas
        const maxDim = Math.max(img.width, img.height);
        const newScale = CANVAS_SIZE / maxDim;
        setScale(newScale);

        // Initialize crop area to center square
        const minDim = Math.min(img.width, img.height);
        const cropSize = minDim * 0.8;
        setCropArea({
          x: (img.width - cropSize) / 2,
          y: (img.height - cropSize) / 2,
          size: cropSize,
        });
      };
      img.src = imageData;
    }
  }, [isOpen, imageData]);

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image scaled to fit
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const offsetX = (CANVAS_SIZE - scaledWidth) / 2;
    const offsetY = (CANVAS_SIZE - scaledHeight) / 2;

    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw darkened overlay outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';

    const cropX = offsetX + cropArea.x * scale;
    const cropY = offsetY + cropArea.y * scale;
    const cropSize = cropArea.size * scale;

    // Top
    ctx.fillRect(0, 0, CANVAS_SIZE, cropY);
    // Bottom
    ctx.fillRect(0, cropY + cropSize, CANVAS_SIZE, CANVAS_SIZE - cropY - cropSize);
    // Left
    ctx.fillRect(0, cropY, cropX, cropSize);
    // Right
    ctx.fillRect(cropX + cropSize, cropY, CANVAS_SIZE - cropX - cropSize, cropSize);

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropSize, cropSize);

    // Draw corner handles
    const handleSize = 10;
    ctx.fillStyle = '#3b82f6';

    // Corner positions
    const corners = [
      { x: cropX - handleSize / 2, y: cropY - handleSize / 2 },
      { x: cropX + cropSize - handleSize / 2, y: cropY - handleSize / 2 },
      { x: cropX - handleSize / 2, y: cropY + cropSize - handleSize / 2 },
      { x: cropX + cropSize - handleSize / 2, y: cropY + cropSize - handleSize / 2 },
    ];

    corners.forEach((corner) => {
      ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
    });
  }, [image, cropArea, scale]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // Convert to image coordinates
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const offsetX = (CANVAS_SIZE - scaledWidth) / 2;
    const offsetY = (CANVAS_SIZE - scaledHeight) / 2;

    return {
      x: (canvasX - offsetX) / scale,
      y: (canvasY - offsetY) / scale,
    };
  }, [image, scale]);

  const isNearCorner = useCallback((mouseX: number, mouseY: number) => {
    const handleSize = 15 / scale;
    const corners = [
      { x: cropArea.x, y: cropArea.y, cursor: 'nwse-resize' },
      { x: cropArea.x + cropArea.size, y: cropArea.y, cursor: 'nesw-resize' },
      { x: cropArea.x, y: cropArea.y + cropArea.size, cursor: 'nesw-resize' },
      { x: cropArea.x + cropArea.size, y: cropArea.y + cropArea.size, cursor: 'nwse-resize' },
    ];

    for (const corner of corners) {
      if (Math.abs(mouseX - corner.x) < handleSize && Math.abs(mouseY - corner.y) < handleSize) {
        return corner;
      }
    }
    return null;
  }, [cropArea, scale]);

  const isInsideCrop = useCallback((mouseX: number, mouseY: number) => {
    return (
      mouseX >= cropArea.x &&
      mouseX <= cropArea.x + cropArea.size &&
      mouseY >= cropArea.y &&
      mouseY <= cropArea.y + cropArea.size
    );
  }, [cropArea]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (isNearCorner(pos.x, pos.y)) {
      setIsResizing(true);
      setDragStart(pos);
    } else if (isInsideCrop(pos.x, pos.y)) {
      setIsDragging(true);
      setDragStart(pos);
    }
  }, [getMousePos, isNearCorner, isInsideCrop]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const pos = getMousePos(e);

    if (isDragging) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      setCropArea((prev) => {
        let newX = prev.x + dx;
        let newY = prev.y + dy;

        // Clamp to image bounds
        newX = Math.max(0, Math.min(image.width - prev.size, newX));
        newY = Math.max(0, Math.min(image.height - prev.size, newY));

        return { ...prev, x: newX, y: newY };
      });
      setDragStart(pos);
    } else if (isResizing) {
      // Calculate new size based on mouse position
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      const delta = Math.max(dx, dy);

      setCropArea((prev) => {
        let newSize = prev.size + delta;

        // Minimum size
        newSize = Math.max(50, newSize);

        // Maximum size (limited by image bounds)
        const maxSize = Math.min(
          image.width - prev.x,
          image.height - prev.y,
          Math.min(image.width, image.height)
        );
        newSize = Math.min(maxSize, newSize);

        return { ...prev, size: newSize };
      });
      setDragStart(pos);
    } else {
      // Update cursor
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isNearCorner(pos.x, pos.y)) {
        canvas.style.cursor = 'nwse-resize';
      } else if (isInsideCrop(pos.x, pos.y)) {
        canvas.style.cursor = 'move';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  }, [image, isDragging, isResizing, dragStart, getMousePos, isNearCorner, isInsideCrop]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleCrop = useCallback(() => {
    if (!image) return;

    // Create a canvas for the cropped image
    const outputCanvas = document.createElement('canvas');
    const outputSize = 128; // Standard Minecraft pack icon size
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;

    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    // Draw the cropped portion
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.size,
      cropArea.size,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert to data URL
    const croppedDataUrl = outputCanvas.toDataURL('image/png');
    onCrop(croppedDataUrl);
    onClose();
  }, [image, cropArea, onCrop, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('iconCropTitle')}
      size="md"
    >
      <div className="flex flex-col items-center space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('iconCropHint')}
        </p>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="border border-gray-300 dark:border-gray-600 rounded"
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCrop}>
            {t('apply')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
