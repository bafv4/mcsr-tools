import { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Button } from '@mcsr-tools/ui';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (adjustments: {
    scale: number;
    offsetX: number;
    offsetY: number;
    brightness: number;
    blur: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
  }) => void;
  initialAdjustments: {
    scale: number;
    offsetX: number;
    offsetY: number;
    brightness: number;
    blur: number;
    cropX: number;
    cropY: number;
    cropWidth: number;
    cropHeight: number;
  };
  resolution: { width: number; height: number };
}

type DragMode = 'image' | 'crop-tl' | 'crop-tr' | 'crop-bl' | 'crop-br' | 'crop-t' | 'crop-b' | 'crop-l' | 'crop-r' | 'crop-move' | null;

export function ImageCropModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  initialAdjustments,
  resolution,
}: ImageCropModalProps) {
  const [scale, setScale] = useState(initialAdjustments.scale);
  const [offsetX, setOffsetX] = useState(initialAdjustments.offsetX);
  const [offsetY, setOffsetY] = useState(initialAdjustments.offsetY);
  const [brightness, setBrightness] = useState(initialAdjustments.brightness);
  const [blur, setBlur] = useState(initialAdjustments.blur);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalCropRect, setOriginalCropRect] = useState<typeof cropRect | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Crop rectangle (relative to resolution coordinates)
  const [cropRect, setCropRect] = useState({
    x: 0,
    y: 0,
    width: resolution.width,
    height: resolution.height,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Calculate aspect ratio
  const aspectRatio = resolution.width / resolution.height;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(initialAdjustments.scale);
      setOffsetX(initialAdjustments.offsetX);
      setOffsetY(initialAdjustments.offsetY);
      setBrightness(initialAdjustments.brightness);
      setBlur(initialAdjustments.blur);
      setCropRect({
        x: initialAdjustments.cropX,
        y: initialAdjustments.cropY,
        width: initialAdjustments.cropWidth,
        height: initialAdjustments.cropHeight,
      });
    }
  }, [isOpen, initialAdjustments]);

  // Load image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      imageRef.current = img;
    };
    img.src = imageUrl;

    return () => {
      imageRef.current = null;
    };
  }, [imageUrl]);

  // Draw preview - optimized with useCallback
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || imageSize.width === 0 || imageSize.height === 0) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const canvasContainer = canvas.parentElement;
    if (!canvasContainer) return;

    // Use the canvas container's dimensions with some padding
    const maxWidth = canvasContainer.clientWidth - 40; // 20px padding on each side
    const maxHeight = canvasContainer.clientHeight - 40; // 20px padding on each side
    const canvasScale = Math.min(maxWidth / resolution.width, maxHeight / resolution.height, 1);

    canvas.width = resolution.width * canvasScale;
    canvas.height = resolution.height * canvasScale;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();

    // Clip to canvas bounds to prevent overflow
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.clip();

    ctx.filter = `brightness(${brightness}%) blur(${blur}px)`;

    // Calculate image dimensions preserving aspect ratio
    const imgAspect = img.width / img.height;
    const resAspect = resolution.width / resolution.height;

    let imgWidth, imgHeight;
    if (imgAspect > resAspect) {
      imgWidth = resolution.width;
      imgHeight = resolution.width / imgAspect;
    } else {
      imgHeight = resolution.height;
      imgWidth = resolution.height * imgAspect;
    }

    // Apply scale
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Calculate position (centered + offset)
    const x = (resolution.width - scaledWidth) / 2 + offsetX;
    const y = (resolution.height - scaledHeight) / 2 + offsetY;

    // Draw image scaled to canvas
    ctx.drawImage(
      img,
      x * canvasScale,
      y * canvasScale,
      scaledWidth * canvasScale,
      scaledHeight * canvasScale
    );

    ctx.restore();

    // Draw crop overlay - darken area outside crop
    ctx.save();

    const cropX = cropRect.x * canvasScale;
    const cropY = cropRect.y * canvasScale;
    const cropW = cropRect.width * canvasScale;
    const cropH = cropRect.height * canvasScale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    // Draw four rectangles around the crop area
    // Top
    ctx.fillRect(0, 0, canvas.width, cropY);
    // Bottom
    ctx.fillRect(0, cropY + cropH, canvas.width, canvas.height - cropY - cropH);
    // Left
    ctx.fillRect(0, cropY, cropX, cropH);
    // Right
    ctx.fillRect(cropX + cropW, cropY, canvas.width - cropX - cropW, cropH);

    // Draw crop border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      cropRect.x * canvasScale,
      cropRect.y * canvasScale,
      cropRect.width * canvasScale,
      cropRect.height * canvasScale
    );

    // Draw corner handles
    const handleSize = 12;
    ctx.fillStyle = '#3b82f6';

    const corners = [
      { x: cropRect.x, y: cropRect.y },
      { x: cropRect.x + cropRect.width, y: cropRect.y },
      { x: cropRect.x, y: cropRect.y + cropRect.height },
      { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
    ];

    corners.forEach(corner => {
      ctx.fillRect(
        corner.x * canvasScale - handleSize / 2,
        corner.y * canvasScale - handleSize / 2,
        handleSize,
        handleSize
      );
    });

    // Draw edge handles
    const edgeHandles = [
      { x: cropRect.x + cropRect.width / 2, y: cropRect.y }, // top
      { x: cropRect.x + cropRect.width / 2, y: cropRect.y + cropRect.height }, // bottom
      { x: cropRect.x, y: cropRect.y + cropRect.height / 2 }, // left
      { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height / 2 }, // right
    ];

    edgeHandles.forEach(handle => {
      ctx.fillRect(
        handle.x * canvasScale - handleSize / 2,
        handle.y * canvasScale - handleSize / 2,
        handleSize,
        handleSize
      );
    });

    ctx.restore();
  }, [imageUrl, scale, offsetX, offsetY, brightness, blur, resolution, cropRect, imageSize]);

  // Redraw when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Get drag mode based on mouse position
  const getDragMode = (mouseX: number, mouseY: number, canvasScale: number): DragMode => {
    const handleSize = 12;
    const tolerance = handleSize / canvasScale;

    const x = mouseX / canvasScale;
    const y = mouseY / canvasScale;

    // Check corners
    if (Math.abs(x - cropRect.x) < tolerance && Math.abs(y - cropRect.y) < tolerance) return 'crop-tl';
    if (Math.abs(x - (cropRect.x + cropRect.width)) < tolerance && Math.abs(y - cropRect.y) < tolerance) return 'crop-tr';
    if (Math.abs(x - cropRect.x) < tolerance && Math.abs(y - (cropRect.y + cropRect.height)) < tolerance) return 'crop-bl';
    if (Math.abs(x - (cropRect.x + cropRect.width)) < tolerance && Math.abs(y - (cropRect.y + cropRect.height)) < tolerance) return 'crop-br';

    // Check edges
    if (Math.abs(y - cropRect.y) < tolerance && x > cropRect.x && x < cropRect.x + cropRect.width) return 'crop-t';
    if (Math.abs(y - (cropRect.y + cropRect.height)) < tolerance && x > cropRect.x && x < cropRect.x + cropRect.width) return 'crop-b';
    if (Math.abs(x - cropRect.x) < tolerance && y > cropRect.y && y < cropRect.y + cropRect.height) return 'crop-l';
    if (Math.abs(x - (cropRect.x + cropRect.width)) < tolerance && y > cropRect.y && y < cropRect.y + cropRect.height) return 'crop-r';

    // Check inside crop rect
    if (x > cropRect.x && x < cropRect.x + cropRect.width && y > cropRect.y && y < cropRect.y + cropRect.height) {
      return 'crop-move';
    }

    return 'image';
  };

  const getCursor = (mode: DragMode): string => {
    switch (mode) {
      case 'crop-tl':
      case 'crop-br':
        return 'cursor-nwse-resize';
      case 'crop-tr':
      case 'crop-bl':
        return 'cursor-nesw-resize';
      case 'crop-t':
      case 'crop-b':
        return 'cursor-ns-resize';
      case 'crop-l':
      case 'crop-r':
        return 'cursor-ew-resize';
      case 'crop-move':
        return 'cursor-move';
      case 'image':
        return dragMode === 'image' ? 'cursor-grabbing' : 'cursor-grab';
      default:
        return 'cursor-default';
    }
  };

  const [hoverMode, setHoverMode] = useState<DragMode>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasScale = canvas.width / resolution.width;

    const mode = getDragMode(mouseX, mouseY, canvasScale);
    setDragMode(mode);
    setDragStart({ x: mouseX, y: mouseY });
    setOriginalCropRect({ ...cropRect });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasScale = canvas.width / resolution.width;

    if (!dragMode) {
      const mode = getDragMode(mouseX, mouseY, canvasScale);
      setHoverMode(mode);
      return;
    }

    if (!originalCropRect) return;

    // Cancel previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      // Calculate delta from original position (like WallPreview)
      const dx = (mouseX - dragStart.x) / canvasScale;
      const dy = (mouseY - dragStart.y) / canvasScale;

      if (dragMode === 'image') {
        setOffsetX(offsetX + dx * canvasScale);
        setOffsetY(offsetY + dy * canvasScale);
      } else if (dragMode === 'crop-move') {
        const newX = Math.max(0, Math.min(resolution.width - originalCropRect.width, originalCropRect.x + dx));
        const newY = Math.max(0, Math.min(resolution.height - originalCropRect.height, originalCropRect.y + dy));
        setCropRect({
          ...originalCropRect,
          x: Math.round(newX),
          y: Math.round(newY),
        });
      } else if (dragMode?.startsWith('crop-')) {
        let newWidth = originalCropRect.width;
        let newHeight = originalCropRect.height;
        let newX = originalCropRect.x;
        let newY = originalCropRect.y;

        // Calculate based on which handle is being dragged
        // Always maintain aspect ratio
        // @ts-ignore
        if (dragMode === 'crop-br' || dragMode === 'crop-se') {
          // Bottom-right corner: resize from top-left anchor
          newWidth = Math.max(50, Math.min(resolution.width - originalCropRect.x, originalCropRect.width + dx));
          newHeight = newWidth / aspectRatio;
            // Constrain to bounds
            if (newY + newHeight > resolution.height) {
              newHeight = resolution.height - newY;
              newWidth = newHeight * aspectRatio;
            }
          // @ts-ignore
          } else if (dragMode === 'crop-tl' || dragMode === 'crop-nw') {
            // Top-left corner: resize from bottom-right anchor
            const anchorX = originalCropRect.x + originalCropRect.width;
            const anchorY = originalCropRect.y + originalCropRect.height;
            newWidth = Math.max(50, originalCropRect.width - dx);
            newHeight = newWidth / aspectRatio;
            newX = anchorX - newWidth;
            newY = anchorY - newHeight;
            // Constrain to bounds
            if (newX < 0) {
              newX = 0;
              newWidth = anchorX;
              newHeight = newWidth / aspectRatio;
              newY = anchorY - newHeight;
            }
            if (newY < 0) {
              newY = 0;
              newHeight = anchorY;
              newWidth = newHeight * aspectRatio;
              newX = anchorX - newWidth;
            }
          // @ts-ignore
          } else if (dragMode === 'crop-tr' || dragMode === 'crop-ne') {
            // Top-right corner
            const anchorY = originalCropRect.y + originalCropRect.height;
            newWidth = Math.max(50, Math.min(resolution.width - originalCropRect.x, originalCropRect.width + dx));
            newHeight = newWidth / aspectRatio;
            newY = anchorY - newHeight;
            if (newY < 0) {
              newY = 0;
              newHeight = anchorY;
              newWidth = newHeight * aspectRatio;
            }
            if (newX + newWidth > resolution.width) {
              newWidth = resolution.width - newX;
              newHeight = newWidth / aspectRatio;
              newY = anchorY - newHeight;
            }
          // @ts-ignore
          } else if (dragMode === 'crop-bl' || dragMode === 'crop-sw') {
            // Bottom-left corner
            const anchorX = originalCropRect.x + originalCropRect.width;
            newWidth = Math.max(50, originalCropRect.width - dx);
            newHeight = newWidth / aspectRatio;
            newX = anchorX - newWidth;
            if (newX < 0) {
              newX = 0;
              newWidth = anchorX;
              newHeight = newWidth / aspectRatio;
            }
            if (newY + newHeight > resolution.height) {
              newHeight = resolution.height - newY;
              newWidth = newHeight * aspectRatio;
              newX = anchorX - newWidth;
            }
          } else if (dragMode === 'crop-r') {
            // Right edge
            newWidth = Math.max(50, Math.min(resolution.width - originalCropRect.x, originalCropRect.width + dx));
            newHeight = newWidth / aspectRatio;
            // Center vertically
            newY = originalCropRect.y + (originalCropRect.height - newHeight) / 2;
            if (newY < 0) {
              newY = 0;
              newHeight = Math.min(resolution.height, newHeight);
              newWidth = newHeight * aspectRatio;
            }
            if (newY + newHeight > resolution.height) {
              newHeight = resolution.height - newY;
              newWidth = newHeight * aspectRatio;
            }
          } else if (dragMode === 'crop-l') {
            // Left edge
            const anchorX = originalCropRect.x + originalCropRect.width;
            newWidth = Math.max(50, originalCropRect.width - dx);
            newHeight = newWidth / aspectRatio;
            newX = anchorX - newWidth;
            newY = originalCropRect.y + (originalCropRect.height - newHeight) / 2;
            if (newX < 0) {
              newX = 0;
              newWidth = anchorX;
              newHeight = newWidth / aspectRatio;
              newY = originalCropRect.y + (originalCropRect.height - newHeight) / 2;
            }
            if (newY < 0) {
              newY = 0;
              newHeight = Math.min(resolution.height, newHeight);
              newWidth = newHeight * aspectRatio;
              newX = anchorX - newWidth;
            }
            if (newY + newHeight > resolution.height) {
              newHeight = resolution.height - newY;
              newWidth = newHeight * aspectRatio;
              newX = anchorX - newWidth;
            }
          } else if (dragMode === 'crop-t') {
            // Top edge
            const anchorY = originalCropRect.y + originalCropRect.height;
            newHeight = Math.max(50, originalCropRect.height - dy);
            newWidth = newHeight * aspectRatio;
            newY = anchorY - newHeight;
            newX = originalCropRect.x + (originalCropRect.width - newWidth) / 2;
            if (newY < 0) {
              newY = 0;
              newHeight = anchorY;
              newWidth = newHeight * aspectRatio;
              newX = originalCropRect.x + (originalCropRect.width - newWidth) / 2;
            }
            if (newX < 0) {
              newX = 0;
              newWidth = Math.min(resolution.width, newWidth);
              newHeight = newWidth / aspectRatio;
              newY = anchorY - newHeight;
            }
            if (newX + newWidth > resolution.width) {
              newWidth = resolution.width - newX;
              newHeight = newWidth / aspectRatio;
              newY = anchorY - newHeight;
            }
          } else if (dragMode === 'crop-b') {
            // Bottom edge
            newHeight = Math.max(50, Math.min(resolution.height - originalCropRect.y, originalCropRect.height + dy));
            newWidth = newHeight * aspectRatio;
            newX = originalCropRect.x + (originalCropRect.width - newWidth) / 2;
            if (newX < 0) {
              newX = 0;
              newWidth = Math.min(resolution.width, newWidth);
              newHeight = newWidth / aspectRatio;
            }
            if (newX + newWidth > resolution.width) {
              newWidth = resolution.width - newX;
              newHeight = newWidth / aspectRatio;
            }
            if (newY + newHeight > resolution.height) {
              newHeight = resolution.height - newY;
              newWidth = newHeight * aspectRatio;
              newX = originalCropRect.x + (originalCropRect.width - newWidth) / 2;
            }
          }

        setCropRect({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        });
      }
      animationFrameRef.current = null;
    });
  }, [dragMode, originalCropRect, dragStart, resolution, aspectRatio]);

  const handleMouseUp = useCallback((_e?: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    setDragMode(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Add document-level event listeners when dragging
  useEffect(() => {
    if (!dragMode) return;

    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp as any);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp as any);
    };
  }, [dragMode, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    onSave({
      scale,
      offsetX,
      offsetY,
      brightness,
      blur,
      cropX: cropRect.x,
      cropY: cropRect.y,
      cropWidth: cropRect.width,
      cropHeight: cropRect.height,
    });
    onClose();
  };

  const handleReset = () => {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
    setBrightness(100);
    setBlur(0);
    setCropRect({
      x: 0,
      y: 0,
      width: resolution.width,
      height: resolution.height,
    });
  };

  const currentCursor = dragMode ? getCursor(dragMode) : getCursor(hoverMode);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="画像の調整" size="full">
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg mb-3 relative min-h-0 overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`${currentCursor} max-w-full max-h-full`}
          />
        </div>

        {/* Controls - Compact Layout */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                明度: {brightness}%
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
                ぼかし: {blur}px
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
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            💡 青い枠をドラッグして表示範囲を調整
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              リセット
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              キャンセル
            </Button>
            <Button size="sm" onClick={handleSave}>
              適用
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
