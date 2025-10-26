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
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Crop rectangle (relative to resolution coordinates)
  const [cropRect, setCropRect] = useState({
    x: 0,
    y: 0,
    width: resolution.width,
    height: resolution.height,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

    const container = containerRef.current;
    if (!container) return;

    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight - 100;
    const canvasScale = Math.min(maxWidth / resolution.width, maxHeight / resolution.height, 1);

    canvas.width = resolution.width * canvasScale;
    canvas.height = resolution.height * canvasScale;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
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
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

    // Use requestAnimationFrame for smooth updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const dx = (e.clientX - dragStart.x) / canvasScale;
      const dy = (e.clientY - dragStart.y) / canvasScale;

      if (dragMode === 'image') {
        setOffsetX(offsetX + dx * canvasScale);
        setOffsetY(offsetY + dy * canvasScale);
      } else if (dragMode === 'crop-move') {
        setCropRect(prev => ({
          ...prev,
          x: Math.max(0, Math.min(resolution.width - prev.width, prev.x + dx)),
          y: Math.max(0, Math.min(resolution.height - prev.height, prev.y + dy)),
        }));
      } else if (dragMode?.startsWith('crop-')) {
        setCropRect(prev => {
          let newWidth = prev.width;
          let newHeight = prev.height;
          let newX = prev.x;
          let newY = prev.y;

          // Calculate based on which handle is being dragged
          // Always maintain aspect ratio
          // @ts-ignore
          if (dragMode === 'crop-br' || dragMode === 'crop-se') {
            // Bottom-right corner: resize from top-left anchor
            newWidth = Math.max(50, Math.min(resolution.width - prev.x, prev.width + dx));
            newHeight = newWidth / aspectRatio;
            // Constrain to bounds
            if (newY + newHeight > resolution.height) {
              newHeight = resolution.height - newY;
              newWidth = newHeight * aspectRatio;
            }
          // @ts-ignore
          } else if (dragMode === 'crop-tl' || dragMode === 'crop-nw') {
            // Top-left corner: resize from bottom-right anchor
            const anchorX = prev.x + prev.width;
            const anchorY = prev.y + prev.height;
            newWidth = Math.max(50, prev.width - dx);
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
            const anchorY = prev.y + prev.height;
            newWidth = Math.max(50, Math.min(resolution.width - prev.x, prev.width + dx));
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
            const anchorX = prev.x + prev.width;
            newWidth = Math.max(50, prev.width - dx);
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
            newWidth = Math.max(50, Math.min(resolution.width - prev.x, prev.width + dx));
            newHeight = newWidth / aspectRatio;
            // Center vertically
            newY = prev.y + (prev.height - newHeight) / 2;
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
            const anchorX = prev.x + prev.width;
            newWidth = Math.max(50, prev.width - dx);
            newHeight = newWidth / aspectRatio;
            newX = anchorX - newWidth;
            newY = prev.y + (prev.height - newHeight) / 2;
            if (newX < 0) {
              newX = 0;
              newWidth = anchorX;
              newHeight = newWidth / aspectRatio;
              newY = prev.y + (prev.height - newHeight) / 2;
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
            const anchorY = prev.y + prev.height;
            newHeight = Math.max(50, prev.height - dy);
            newWidth = newHeight * aspectRatio;
            newY = anchorY - newHeight;
            newX = prev.x + (prev.width - newWidth) / 2;
            if (newY < 0) {
              newY = 0;
              newHeight = anchorY;
              newWidth = newHeight * aspectRatio;
              newX = prev.x + (prev.width - newWidth) / 2;
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
            newHeight = Math.max(50, Math.min(resolution.height - prev.y, prev.height + dy));
            newWidth = newHeight * aspectRatio;
            newX = prev.x + (prev.width - newWidth) / 2;
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
              newX = prev.x + (prev.width - newWidth) / 2;
            }
          }

          return {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          };
        });
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    });
  };

  const handleMouseUp = () => {
    setDragMode(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (imageSize.width === 0 || imageSize.height === 0) return;

    const delta = -e.deltaY;
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    let newScale = scale * zoomFactor;
    newScale = Math.max(0.1, Math.min(5, newScale));

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const canvasScale = canvas.width / resolution.width;

    const imgAspect = imageSize.width / imageSize.height;
    const resAspect = resolution.width / resolution.height;

    let imgWidth, imgHeight;
    if (imgAspect > resAspect) {
      imgWidth = resolution.width;
      imgHeight = resolution.width / imgAspect;
    } else {
      imgHeight = resolution.height;
      imgWidth = resolution.height * imgAspect;
    }

    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    const currentX = (resolution.width - scaledWidth) / 2 + offsetX;
    const currentY = (resolution.height - scaledHeight) / 2 + offsetY;

    const imageX = (mouseX / canvasScale - currentX) / scale;
    const imageY = (mouseY / canvasScale - currentY) / scale;

    const newScaledWidth = imgWidth * newScale;
    const newScaledHeight = imgHeight * newScale;
    const newX = (resolution.width - newScaledWidth) / 2;
    const newY = (resolution.height - newScaledHeight) / 2;

    const newOffsetX = mouseX / canvasScale - newX - imageX * newScale;
    const newOffsetY = mouseY / canvasScale - newY - imageY * newScale;

    setScale(newScale);
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
  }, [imageSize, scale, offsetX, offsetY, resolution]);

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
      <div ref={containerRef} className="flex flex-col h-full">
        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg mb-4 relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={currentCursor}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">エフェクト</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleReset}>
            リセット
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>
              適用
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>💡 ヒント: 画像をドラッグして移動、青い枠をドラッグしてトリミング、マウスホイールでズーム</p>
        </div>
      </div>
    </Modal>
  );
}
