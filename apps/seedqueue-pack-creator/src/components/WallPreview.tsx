import { useEffect, useRef, useState, useCallback } from 'react';
import { useWallStore } from '../store/useWallStore';

type DragMode = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'resize-n' | 'resize-s' | 'resize-w' | 'resize-e' | null;

export function WallPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolution, layout, background, selectedArea, selectArea, updateArea } =
    useWallStore();
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [originalArea, setOriginalArea] = useState<any>(null);
  const [scale, setScale] = useState(1);
  const [cursor, setCursor] = useState('grab');
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [imageLoadTrigger, setImageLoadTrigger] = useState(0);

  // Padding around the canvas (in canvas pixels)
  const CANVAS_PADDING = 20;

  // Calculate UI scale factor based on resolution (baseline: 1920x1080)
  const getUIScale = () => {
    const baseResolution = 1920;
    return Math.max(resolution.width, resolution.height) / baseResolution;
  };

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Account for padding when calculating scale
        const scaleX = containerWidth / (resolution.width + CANVAS_PADDING * 2);
        setScale(Math.min(scaleX, 1));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [resolution.width]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Add padding to canvas size
    canvas.width = resolution.width + CANVAS_PADDING * 2;
    canvas.height = resolution.height + CANVAS_PADDING * 2;

    // Draw padding area with subtle pattern to indicate it's outside the screen
    // Theme-aware colors
    const isDarkMode = document.documentElement.classList.contains('dark');
    const paddingBg = isDarkMode ? '#374151' : '#d1d5db'; // Dark: gray-700, Light: gray-300
    const stripeColor = isDarkMode ? '#4b5563' : '#9ca3af'; // Dark: gray-600, Light: gray-400

    ctx.fillStyle = paddingBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw diagonal stripes pattern in padding area to indicate "outside screen"
    ctx.save();
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 1.5;
    const stripeSpacing = 15;

    // Draw diagonal lines across entire canvas
    for (let i = -canvas.height; i < canvas.width + canvas.height; i += stripeSpacing) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }
    ctx.restore();

    // Save context and translate to account for padding
    ctx.save();
    ctx.translate(CANVAS_PADDING, CANVAS_PADDING);

    // Clip to the actual screen area to prevent background from bleeding into padding
    ctx.beginPath();
    ctx.rect(0, 0, resolution.width, resolution.height);
    ctx.clip();

    // Draw background (this will cover the pattern in the screen area)
    drawBackground(ctx);

    // Draw areas
    drawArea(ctx, layout.main, '#2563eb', 'Main', selectedArea === 'main');
    if (layout.locked.show) {
      drawArea(ctx, layout.locked, '#ea580c', 'Locked', selectedArea === 'locked');
    }
    if (layout.preparing.show) {
      drawArea(ctx, layout.preparing, '#16a34a', 'Preparing', selectedArea === 'preparing');
    }

    // Draw measurement guides if dragging
    if (dragMode && selectedArea) {
      const area = layout[selectedArea];
      drawMeasurementGuides(ctx, area);
      drawCenterGuides(ctx, area);
    }

    // Restore context (back to unpadded coordinates)
    ctx.restore();

    // Draw screen boundary box with prominent styling (after restoring, so it's in canvas coordinates)
    ctx.save();

    // Shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    // Prominent border for the actual screen area - grayscale/low saturation
    ctx.strokeStyle = isDarkMode ? '#e5e7eb' : '#1f2937'; // Dark: gray-200 (light), Light: gray-800 (dark)
    ctx.lineWidth = 3;
    ctx.strokeRect(CANVAS_PADDING, CANVAS_PADDING, resolution.width, resolution.height);
    ctx.restore();

    // Draw subtle outer border for the canvas (padding area boundary)
    ctx.save();
    // Use the same color as stripes - very subtle
    const outerBorderColor = isDarkMode ? '#4b5563' : '#9ca3af'; // Dark: gray-600, Light: gray-400
    ctx.strokeStyle = outerBorderColor;
    ctx.lineWidth = 2; // Slightly thicker to be visible
    // Draw at the edge of canvas
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    ctx.restore();
  }, [resolution, layout, background, selectedArea, dragMode, imageLoadTrigger]);

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    if (background.type === 'color') {
      ctx.fillStyle = background.color;
      ctx.fillRect(0, 0, resolution.width, resolution.height);
    } else if (background.type === 'image' && background.image) {
      // Check if we need to load a new image
      if (!backgroundImageRef.current || backgroundImageRef.current.src !== background.image) {
        const img = new Image();
        img.onload = () => {
          backgroundImageRef.current = img;
          // Trigger re-render by updating state
          setImageLoadTrigger(prev => prev + 1);
        };
        img.onerror = () => {
          console.error('Failed to load background image');
          backgroundImageRef.current = null;
        };
        img.src = background.image;

        // Draw placeholder while loading
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, resolution.width, resolution.height);
      } else if (backgroundImageRef.current) {
        // Use cached image
        drawBackgroundWithImage(ctx, backgroundImageRef.current);
      }
    } else if (background.type === 'gradient') {
      let gradient: CanvasGradient;

      switch (background.gradientDirection) {
        case 'vertical':
          gradient = ctx.createLinearGradient(0, 0, 0, resolution.height);
          break;
        case 'horizontal':
          gradient = ctx.createLinearGradient(0, 0, resolution.width, 0);
          break;
        case 'diagonal':
          gradient = ctx.createLinearGradient(0, 0, resolution.width, resolution.height);
          break;
        case 'reverse-diagonal':
          gradient = ctx.createLinearGradient(resolution.width, 0, 0, resolution.height);
          break;
      }

      gradient.addColorStop(0, background.gradientStart);
      gradient.addColorStop(1, background.gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, resolution.width, resolution.height);
    }
  };

  const drawBackgroundWithImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    ctx.save();

    // Fill background with black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, resolution.width, resolution.height);

    // Apply filters
    ctx.filter = `brightness(${background.imageBrightness}%) blur(${background.imageBlur}px)`;

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
    const scaledWidth = imgWidth * background.imageScale;
    const scaledHeight = imgHeight * background.imageScale;

    // Calculate position (centered + offset)
    const x = (resolution.width - scaledWidth) / 2 + background.imageOffsetX;
    const y = (resolution.height - scaledHeight) / 2 + background.imageOffsetY;

    // Calculate the source rectangle from the original image that corresponds to the crop area
    // We need to map the crop area (which is in resolution coordinates) back to image coordinates

    // First, calculate where the image is positioned
    const imageLeft = x;
    const imageTop = y;
    const imageRight = x + scaledWidth;
    const imageBottom = y + scaledHeight;

    // Calculate crop area in resolution coordinates
    const cropLeft = background.imageCropX;
    const cropTop = background.imageCropY;
    const cropRight = background.imageCropX + background.imageCropWidth;
    const cropBottom = background.imageCropY + background.imageCropHeight;

    // Find the intersection of the crop area with the image bounds
    const visibleLeft = Math.max(cropLeft, imageLeft);
    const visibleTop = Math.max(cropTop, imageTop);
    const visibleRight = Math.min(cropRight, imageRight);
    const visibleBottom = Math.min(cropBottom, imageBottom);

    // If there's no intersection, don't draw anything
    if (visibleLeft >= visibleRight || visibleTop >= visibleBottom) {
      ctx.restore();
      return;
    }

    // Map the visible area back to image coordinates
    const srcLeft = (visibleLeft - imageLeft) / scaledWidth * img.width;
    const srcTop = (visibleTop - imageTop) / scaledHeight * img.height;
    const srcRight = (visibleRight - imageLeft) / scaledWidth * img.width;
    const srcBottom = (visibleBottom - imageTop) / scaledHeight * img.height;

    const srcWidth = srcRight - srcLeft;
    const srcHeight = srcBottom - srcTop;

    // Calculate the destination rectangle (scale the crop area to fill the entire resolution)
    // Map from crop coordinates to full resolution coordinates
    const destX = (visibleLeft - cropLeft) / background.imageCropWidth * resolution.width;
    const destY = (visibleTop - cropTop) / background.imageCropHeight * resolution.height;
    const destWidth = (visibleRight - visibleLeft) / background.imageCropWidth * resolution.width;
    const destHeight = (visibleBottom - visibleTop) / background.imageCropHeight * resolution.height;

    // Draw the cropped portion scaled to fill the screen
    ctx.drawImage(
      img,
      srcLeft, srcTop, srcWidth, srcHeight,
      destX, destY, destWidth, destHeight
    );

    ctx.restore();
  };

  const drawCenterGuides = (ctx: CanvasRenderingContext2D, area: any) => {
    const uiScale = getUIScale();
    const centerX = resolution.width / 2;
    const centerY = resolution.height / 2;
    const areaCenterX = area.x + area.width / 2;
    const areaCenterY = area.y + area.height / 2;
    const snapThreshold = 10 * uiScale;

    ctx.save();
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2 * uiScale;
    ctx.setLineDash([10 * uiScale, 10 * uiScale]);

    // Draw vertical center line if area is snapped to horizontal center
    if (
      Math.abs(areaCenterX - centerX) < snapThreshold ||
      Math.abs(area.x - centerX) < snapThreshold ||
      Math.abs(area.x + area.width - centerX) < snapThreshold
    ) {
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, resolution.height);
      ctx.stroke();
    }

    // Draw horizontal center line if area is snapped to vertical center
    if (
      Math.abs(areaCenterY - centerY) < snapThreshold ||
      Math.abs(area.y - centerY) < snapThreshold ||
      Math.abs(area.y + area.height - centerY) < snapThreshold
    ) {
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(resolution.width, centerY);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawMeasurementGuides = (ctx: CanvasRenderingContext2D, area: any) => {
    const uiScale = getUIScale();
    ctx.save();
    ctx.strokeStyle = '#ff0000';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1 * uiScale;
    ctx.font = `bold ${14 * uiScale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw guide lines and labels
    const padding = 10 * uiScale; // Increased padding to prevent cutoff
    const arrowSize = 6 * uiScale;
    const labelPadding = 4 * uiScale;
    const labelHeight = 20 * uiScale;

    // Left distance (from left edge to area)
    if (area.x > 0) {
      ctx.setLineDash([5 * uiScale, 5 * uiScale]);
      ctx.beginPath();
      ctx.moveTo(0, area.y + area.height / 2);
      ctx.lineTo(area.x, area.y + area.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw label background
      const text = `${area.x}px`;
      const textWidth = ctx.measureText(text).width;
      const labelX = Math.max(textWidth / 2 + padding, Math.min(area.x / 2, resolution.width - textWidth / 2 - padding));
      const labelY = Math.max(labelHeight / 2 + padding, Math.min(area.y + area.height / 2, resolution.height - labelHeight / 2 - padding));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(labelX - textWidth / 2 - labelPadding, labelY - 10 * uiScale, textWidth + labelPadding * 2, labelHeight);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, labelX, labelY);
    }

    // Right distance (from area to right edge)
    const rightDist = resolution.width - (area.x + area.width);
    if (rightDist > 0) {
      ctx.strokeStyle = '#ff0000';
      ctx.setLineDash([5 * uiScale, 5 * uiScale]);
      ctx.beginPath();
      ctx.moveTo(area.x + area.width, area.y + area.height / 2);
      ctx.lineTo(resolution.width, area.y + area.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const text = `${rightDist}px`;
      const textWidth = ctx.measureText(text).width;
      const labelX = Math.max(textWidth / 2 + padding, Math.min(area.x + area.width + rightDist / 2, resolution.width - textWidth / 2 - padding));
      const labelY = Math.max(labelHeight / 2 + padding, Math.min(area.y + area.height / 2, resolution.height - labelHeight / 2 - padding));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(labelX - textWidth / 2 - labelPadding, labelY - 10 * uiScale, textWidth + labelPadding * 2, labelHeight);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, labelX, labelY);
    }

    // Top distance (from top edge to area)
    if (area.y > 0) {
      ctx.strokeStyle = '#ff0000';
      ctx.setLineDash([5 * uiScale, 5 * uiScale]);
      ctx.beginPath();
      ctx.moveTo(area.x + area.width / 2, 0);
      ctx.lineTo(area.x + area.width / 2, area.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const text = `${area.y}px`;
      const textWidth = ctx.measureText(text).width;
      const labelX = Math.max(textWidth / 2 + padding, Math.min(area.x + area.width / 2, resolution.width - textWidth / 2 - padding));
      const labelY = Math.max(labelHeight / 2 + padding, Math.min(area.y / 2, resolution.height - labelHeight / 2 - padding));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(labelX - textWidth / 2 - labelPadding, labelY - 10 * uiScale, textWidth + labelPadding * 2, labelHeight);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, labelX, labelY);
    }

    // Bottom distance (from area to bottom edge)
    const bottomDist = resolution.height - (area.y + area.height);
    if (bottomDist > 0) {
      ctx.strokeStyle = '#ff0000';
      ctx.setLineDash([5 * uiScale, 5 * uiScale]);
      ctx.beginPath();
      ctx.moveTo(area.x + area.width / 2, area.y + area.height);
      ctx.lineTo(area.x + area.width / 2, resolution.height);
      ctx.stroke();
      ctx.setLineDash([]);

      const text = `${bottomDist}px`;
      const textWidth = ctx.measureText(text).width;
      const labelX = Math.max(textWidth / 2 + padding, Math.min(area.x + area.width / 2, resolution.width - textWidth / 2 - padding));
      const labelY = Math.max(labelHeight / 2 + padding, Math.min(area.y + area.height + bottomDist / 2, resolution.height - labelHeight / 2 - padding));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(labelX - textWidth / 2 - labelPadding, labelY - 10 * uiScale, textWidth + labelPadding * 2, labelHeight);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, labelX, labelY);
    }

    // Area dimensions (width x height)
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2 * uiScale;
    ctx.setLineDash([]);

    const guideOffset = 20 * uiScale;

    // Width line at bottom
    ctx.beginPath();
    ctx.moveTo(area.x, area.y + area.height + guideOffset);
    ctx.lineTo(area.x + area.width, area.y + area.height + guideOffset);
    ctx.stroke();

    // Width arrows
    ctx.beginPath();
    ctx.moveTo(area.x, area.y + area.height + guideOffset);
    ctx.lineTo(area.x + arrowSize, area.y + area.height + guideOffset - arrowSize);
    ctx.moveTo(area.x, area.y + area.height + guideOffset);
    ctx.lineTo(area.x + arrowSize, area.y + area.height + guideOffset + arrowSize);
    ctx.moveTo(area.x + area.width, area.y + area.height + guideOffset);
    ctx.lineTo(area.x + area.width - arrowSize, area.y + area.height + guideOffset - arrowSize);
    ctx.moveTo(area.x + area.width, area.y + area.height + guideOffset);
    ctx.lineTo(area.x + area.width - arrowSize, area.y + area.height + guideOffset + arrowSize);
    ctx.stroke();

    const widthText = `${area.width}px`;
    const widthTextWidth = ctx.measureText(widthText).width;
    const widthLabelX = Math.max(widthTextWidth / 2 + padding, Math.min(area.x + area.width / 2, resolution.width - widthTextWidth / 2 - padding));
    const widthLabelY = Math.min(area.y + area.height + guideOffset, resolution.height - labelHeight / 2 - padding);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(widthLabelX - widthTextWidth / 2 - labelPadding, widthLabelY - 10 * uiScale, widthTextWidth + labelPadding * 2, labelHeight);
    ctx.fillStyle = '#00ff00';
    ctx.fillText(widthText, widthLabelX, widthLabelY);

    // Height line at right
    ctx.strokeStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(area.x + area.width + guideOffset, area.y);
    ctx.lineTo(area.x + area.width + guideOffset, area.y + area.height);
    ctx.stroke();

    // Height arrows
    ctx.beginPath();
    ctx.moveTo(area.x + area.width + guideOffset, area.y);
    ctx.lineTo(area.x + area.width + guideOffset - arrowSize, area.y + arrowSize);
    ctx.moveTo(area.x + area.width + guideOffset, area.y);
    ctx.lineTo(area.x + area.width + guideOffset + arrowSize, area.y + arrowSize);
    ctx.moveTo(area.x + area.width + guideOffset, area.y + area.height);
    ctx.lineTo(area.x + area.width + guideOffset - arrowSize, area.y + area.height - arrowSize);
    ctx.moveTo(area.x + area.width + guideOffset, area.y + area.height);
    ctx.lineTo(area.x + area.width + guideOffset + arrowSize, area.y + area.height - arrowSize);
    ctx.stroke();

    const heightText = `${area.height}px`;
    const heightTextWidth = ctx.measureText(heightText).width;
    const heightLabelX = Math.min(area.x + area.width + guideOffset, resolution.width - labelHeight / 2 - padding);
    const heightLabelY = Math.max(heightTextWidth / 2 + padding, Math.min(area.y + area.height / 2, resolution.height - heightTextWidth / 2 - padding));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(heightLabelX - 10 * uiScale, heightLabelY - heightTextWidth / 2 - labelPadding, labelHeight, heightTextWidth + labelPadding * 2);
    ctx.save();
    ctx.translate(heightLabelX, heightLabelY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#00ff00';
    ctx.fillText(heightText, 0, 0);
    ctx.restore();

    ctx.restore();
  };

  const drawArea = (
    ctx: CanvasRenderingContext2D,
    area: any,
    color: string,
    label: string,
    isSelected: boolean
  ) => {
    const uiScale = getUIScale();

    // Fill area with semi-transparent color
    ctx.fillStyle = color + '40';
    ctx.fillRect(area.x, area.y, area.width, area.height);

    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3 * uiScale;
    ctx.strokeRect(area.x, area.y, area.width, area.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1 * uiScale;
    ctx.strokeRect(area.x, area.y, area.width, area.height);

    // Draw grid (only if useGrid is enabled)
    const shouldDrawGrid = area.useGrid !== false; // Default to true if undefined

    if (shouldDrawGrid) {
      const padding = area.padding ?? 0;

      // If padding is set, draw individual cells with gaps
      if (padding > 0) {
        const cellWidth = area.width / area.columns;
        const cellHeight = area.height / area.rows;

        // Draw each cell as a separate rectangle with padding
        for (let row = 0; row < area.rows; row++) {
          for (let col = 0; col < area.columns; col++) {
            const cellX = area.x + col * cellWidth + padding;
            const cellY = area.y + row * cellHeight + padding;
            const cellW = cellWidth - padding * 2;
            const cellH = cellHeight - padding * 2;

            // Draw white border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3 * uiScale;
            ctx.strokeRect(cellX, cellY, cellW, cellH);

            // Draw colored border
            ctx.strokeStyle = color;
            ctx.lineWidth = 1 * uiScale;
            ctx.strokeRect(cellX, cellY, cellW, cellH);
          }
        }
      } else {
        // Original grid drawing without padding
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3 * uiScale;

        const cellWidth = area.width / area.columns;
        const cellHeight = area.height / area.rows;

        for (let i = 1; i < area.columns; i++) {
          const x = area.x + i * cellWidth;
          ctx.beginPath();
          ctx.moveTo(x, area.y);
          ctx.lineTo(x, area.y + area.height);
          ctx.stroke();
        }

        for (let i = 1; i < area.rows; i++) {
          const y = area.y + i * cellHeight;
          ctx.beginPath();
          ctx.moveTo(area.x, y);
          ctx.lineTo(area.x + area.width, y);
          ctx.stroke();
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 1 * uiScale;

        for (let i = 1; i < area.columns; i++) {
          const x = area.x + i * cellWidth;
          ctx.beginPath();
          ctx.moveTo(x, area.y);
          ctx.lineTo(x, area.y + area.height);
          ctx.stroke();
        }

        for (let i = 1; i < area.rows; i++) {
          const y = area.y + i * cellHeight;
          ctx.beginPath();
          ctx.moveTo(area.x, y);
          ctx.lineTo(area.x + area.width, y);
          ctx.stroke();
        }
      }
    }

    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${16 * uiScale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, area.x + area.width / 2, area.y + area.height / 2);

    // Draw resize handles if selected
    if (isSelected) {
      const handleSize = 16 * uiScale;
      const edgeHandleWidth = 6 * uiScale;
      const edgeHandleLength = 40 * uiScale;
      ctx.fillStyle = color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * uiScale;

      // Corner handles
      // Top-left
      ctx.fillRect(area.x - handleSize / 2, area.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(area.x - handleSize / 2, area.y - handleSize / 2, handleSize, handleSize);

      // Top-right
      ctx.fillRect(area.x + area.width - handleSize / 2, area.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(area.x + area.width - handleSize / 2, area.y - handleSize / 2, handleSize, handleSize);

      // Bottom-left
      ctx.fillRect(area.x - handleSize / 2, area.y + area.height - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(area.x - handleSize / 2, area.y + area.height - handleSize / 2, handleSize, handleSize);

      // Bottom-right
      ctx.fillRect(area.x + area.width - handleSize / 2, area.y + area.height - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(area.x + area.width - handleSize / 2, area.y + area.height - handleSize / 2, handleSize, handleSize);

      // Edge handles (rectangles in the middle of each edge)
      // Top edge
      ctx.fillRect(area.x + area.width / 2 - edgeHandleLength / 2, area.y - edgeHandleWidth / 2, edgeHandleLength, edgeHandleWidth);
      ctx.strokeRect(area.x + area.width / 2 - edgeHandleLength / 2, area.y - edgeHandleWidth / 2, edgeHandleLength, edgeHandleWidth);

      // Bottom edge
      ctx.fillRect(area.x + area.width / 2 - edgeHandleLength / 2, area.y + area.height - edgeHandleWidth / 2, edgeHandleLength, edgeHandleWidth);
      ctx.strokeRect(area.x + area.width / 2 - edgeHandleLength / 2, area.y + area.height - edgeHandleWidth / 2, edgeHandleLength, edgeHandleWidth);

      // Left edge
      ctx.fillRect(area.x - edgeHandleWidth / 2, area.y + area.height / 2 - edgeHandleLength / 2, edgeHandleWidth, edgeHandleLength);
      ctx.strokeRect(area.x - edgeHandleWidth / 2, area.y + area.height / 2 - edgeHandleLength / 2, edgeHandleWidth, edgeHandleLength);

      // Right edge
      ctx.fillRect(area.x + area.width - edgeHandleWidth / 2, area.y + area.height / 2 - edgeHandleLength / 2, edgeHandleWidth, edgeHandleLength);
      ctx.strokeRect(area.x + area.width - edgeHandleWidth / 2, area.y + area.height / 2 - edgeHandleLength / 2, edgeHandleWidth, edgeHandleLength);
    }
  };

  const getAreaAtPoint = (x: number, y: number): 'main' | 'locked' | 'preparing' | null => {
    const areas: Array<['main' | 'locked' | 'preparing', any]> = [
      ['preparing', layout.preparing],
      ['locked', layout.locked],
      ['main', layout.main],
    ];

    for (const [name, area] of areas) {
      if (
        name !== 'main' &&
        'show' in area &&
        !area.show
      ) {
        continue;
      }

      if (
        x >= area.x &&
        x <= area.x + area.width &&
        y >= area.y &&
        y <= area.y + area.height
      ) {
        return name;
      }
    }

    return null;
  };

  const getResizeHandle = (
    x: number,
    y: number,
    area: any
  ): 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'resize-n' | 'resize-s' | 'resize-w' | 'resize-e' | null => {
    const uiScale = getUIScale();
    const handleSize = 40 * uiScale; // Scale handle hit area (increased for easier grabbing)
    const edgeHandleHitWidth = 30 * uiScale; // Hit area for edge handles (slightly wider than visual)
    const edgeHandleHitLength = 60 * uiScale; // Hit length for edge handles (longer than visual)

    // Check corners first (top-left, top-right, bottom-left, bottom-right)
    if (Math.abs(x - area.x) < handleSize && Math.abs(y - area.y) < handleSize) {
      return 'resize-nw';
    }
    if (Math.abs(x - (area.x + area.width)) < handleSize && Math.abs(y - area.y) < handleSize) {
      return 'resize-ne';
    }
    if (Math.abs(x - area.x) < handleSize && Math.abs(y - (area.y + area.height)) < handleSize) {
      return 'resize-sw';
    }
    if (
      Math.abs(x - (area.x + area.width)) < handleSize &&
      Math.abs(y - (area.y + area.height)) < handleSize
    ) {
      return 'resize-se';
    }

    // Check edge handles (top, bottom, left, right)
    // Top edge
    if (
      Math.abs(y - area.y) < edgeHandleHitWidth &&
      x >= area.x + area.width / 2 - edgeHandleHitLength / 2 &&
      x <= area.x + area.width / 2 + edgeHandleHitLength / 2
    ) {
      return 'resize-n';
    }

    // Bottom edge
    if (
      Math.abs(y - (area.y + area.height)) < edgeHandleHitWidth &&
      x >= area.x + area.width / 2 - edgeHandleHitLength / 2 &&
      x <= area.x + area.width / 2 + edgeHandleHitLength / 2
    ) {
      return 'resize-s';
    }

    // Left edge
    if (
      Math.abs(x - area.x) < edgeHandleHitWidth &&
      y >= area.y + area.height / 2 - edgeHandleHitLength / 2 &&
      y <= area.y + area.height / 2 + edgeHandleHitLength / 2
    ) {
      return 'resize-w';
    }

    // Right edge
    if (
      Math.abs(x - (area.x + area.width)) < edgeHandleHitWidth &&
      y >= area.y + area.height / 2 - edgeHandleHitLength / 2 &&
      y <= area.y + area.height / 2 + edgeHandleHitLength / 2
    ) {
      return 'resize-e';
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - CANVAS_PADDING;
    const y = (e.clientY - rect.top) / scale - CANVAS_PADDING;

    const areaName = getAreaAtPoint(x, y);
    if (!areaName) return;

    const area = layout[areaName];
    const resizeHandle = getResizeHandle(x, y, area);

    if (resizeHandle) {
      setDragMode(resizeHandle);
    } else {
      setDragMode('move');
    }

    selectArea(areaName);
    setDragStart({ x, y });
    setOriginalArea({ ...area });
  };

  const snapToCenter = (value: number, size: number, screenSize: number): number => {
    const uiScale = getUIScale();
    const snapThreshold = 10 * uiScale; // Scale snap threshold based on resolution
    const center = screenSize / 2;
    const valueCenter = value + size / 2;
    const valueEnd = value + size;

    // Snap center of area to screen center
    if (Math.abs(valueCenter - center) < snapThreshold) {
      return center - size / 2;
    }

    // Snap left/top edge to screen center
    if (Math.abs(value - center) < snapThreshold) {
      return center;
    }

    // Snap right/bottom edge to screen center
    if (Math.abs(valueEnd - center) < snapThreshold) {
      return center - size;
    }

    return value;
  };

  const snapToEdgesAndAreas = (
    areaName: 'main' | 'locked' | 'preparing',
    x: number,
    y: number,
    width: number,
    height: number,
    isResizing: boolean = false
  ): { x: number; y: number; width: number; height: number } => {
    const uiScale = getUIScale();
    const snapThreshold = 10 * uiScale;
    let snappedX = x;
    let snappedY = y;
    let snappedWidth = width;
    let snappedHeight = height;

    // Get other areas to snap to
    const otherAreas: Array<{ name: 'main' | 'locked' | 'preparing'; area: any }> = [];
    if (areaName !== 'main') {
      otherAreas.push({ name: 'main', area: layout.main });
    }
    if (areaName !== 'locked' && layout.locked.show) {
      otherAreas.push({ name: 'locked', area: layout.locked });
    }
    if (areaName !== 'preparing' && layout.preparing.show) {
      otherAreas.push({ name: 'preparing', area: layout.preparing });
    }

    // Snap to screen edges (X axis)
    if (Math.abs(x) < snapThreshold) {
      snappedX = 0;
    }
    if (Math.abs(x + width - resolution.width) < snapThreshold) {
      if (isResizing) {
        snappedWidth = resolution.width - x;
      } else {
        snappedX = resolution.width - width;
      }
    }

    // Snap to screen edges (Y axis)
    if (Math.abs(y) < snapThreshold) {
      snappedY = 0;
    }
    if (Math.abs(y + height - resolution.height) < snapThreshold) {
      if (isResizing) {
        snappedHeight = resolution.height - y;
      } else {
        snappedY = resolution.height - height;
      }
    }

    // Snap to other areas
    for (const { area: otherArea } of otherAreas) {
      // Horizontal snapping
      // Snap left edge to other area's right edge
      if (Math.abs(snappedX - (otherArea.x + otherArea.width)) < snapThreshold) {
        snappedX = otherArea.x + otherArea.width;
      }
      // Snap right edge to other area's left edge
      if (Math.abs(snappedX + snappedWidth - otherArea.x) < snapThreshold) {
        if (isResizing) {
          snappedWidth = otherArea.x - snappedX;
        } else {
          snappedX = otherArea.x - snappedWidth;
        }
      }
      // Snap left edge to other area's left edge
      if (Math.abs(snappedX - otherArea.x) < snapThreshold) {
        snappedX = otherArea.x;
      }
      // Snap right edge to other area's right edge
      if (Math.abs(snappedX + snappedWidth - (otherArea.x + otherArea.width)) < snapThreshold) {
        if (isResizing) {
          snappedWidth = otherArea.x + otherArea.width - snappedX;
        } else {
          snappedX = otherArea.x + otherArea.width - snappedWidth;
        }
      }

      // Vertical snapping
      // Snap top edge to other area's bottom edge
      if (Math.abs(snappedY - (otherArea.y + otherArea.height)) < snapThreshold) {
        snappedY = otherArea.y + otherArea.height;
      }
      // Snap bottom edge to other area's top edge
      if (Math.abs(snappedY + snappedHeight - otherArea.y) < snapThreshold) {
        if (isResizing) {
          snappedHeight = otherArea.y - snappedY;
        } else {
          snappedY = otherArea.y - snappedHeight;
        }
      }
      // Snap top edge to other area's top edge
      if (Math.abs(snappedY - otherArea.y) < snapThreshold) {
        snappedY = otherArea.y;
      }
      // Snap bottom edge to other area's bottom edge
      if (Math.abs(snappedY + snappedHeight - (otherArea.y + otherArea.height)) < snapThreshold) {
        if (isResizing) {
          snappedHeight = otherArea.y + otherArea.height - snappedY;
        } else {
          snappedY = otherArea.y + otherArea.height - snappedHeight;
        }
      }
    }

    // Apply center snap after edge snap
    snappedX = snapToCenter(snappedX, snappedWidth, resolution.width);
    snappedY = snapToCenter(snappedY, snappedHeight, resolution.height);

    return { x: snappedX, y: snappedY, width: snappedWidth, height: snappedHeight };
  };

  const processDrag = useCallback((x: number, y: number) => {
    if (!dragMode || !selectedArea || !originalArea) return;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    // Cancel previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    animationFrameRef.current = requestAnimationFrame(() => {
      if (dragMode === 'move') {
        let newX = Math.floor(originalArea.x + dx);
        let newY = Math.floor(originalArea.y + dy);

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, newX, newY, originalArea.width, originalArea.height);

        updateArea(selectedArea, {
          x: snapped.x,
          y: snapped.y,
        });
      } else if (dragMode === 'resize-se') {
        let newWidth = Math.max(1, Math.floor(originalArea.width + dx));
        let newHeight = Math.max(1, Math.floor(originalArea.height + dy));

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, originalArea.x, originalArea.y, newWidth, newHeight, true);

        updateArea(selectedArea, {
          width: snapped.width,
          height: snapped.height,
        });
      } else if (dragMode === 'resize-nw') {
        const newWidth = Math.max(1, Math.floor(originalArea.width - dx));
        const newHeight = Math.max(1, Math.floor(originalArea.height - dy));
        let newX = Math.floor(originalArea.x + originalArea.width - newWidth);
        let newY = Math.floor(originalArea.y + originalArea.height - newHeight);

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, newX, newY, newWidth, newHeight, true);

        updateArea(selectedArea, {
          x: snapped.x,
          y: snapped.y,
          width: originalArea.x + originalArea.width - snapped.x,
          height: originalArea.y + originalArea.height - snapped.y,
        });
      } else if (dragMode === 'resize-ne') {
        let newWidth = Math.max(1, Math.floor(originalArea.width + dx));
        const newHeight = Math.max(1, Math.floor(originalArea.height - dy));
        let newY = Math.floor(originalArea.y + originalArea.height - newHeight);

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, originalArea.x, newY, newWidth, newHeight, true);

        updateArea(selectedArea, {
          y: snapped.y,
          width: snapped.width,
          height: originalArea.y + originalArea.height - snapped.y,
        });
      } else if (dragMode === 'resize-sw') {
        const newWidth = Math.max(1, Math.floor(originalArea.width - dx));
        let newHeight = Math.max(1, Math.floor(originalArea.height + dy));
        let newX = Math.floor(originalArea.x + originalArea.width - newWidth);

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, newX, originalArea.y, newWidth, newHeight, true);

        updateArea(selectedArea, {
          x: snapped.x,
          width: originalArea.x + originalArea.width - snapped.x,
          height: snapped.height,
        });
      } else if (dragMode === 'resize-n') {
        // Resize from top edge (height changes, y changes, width stays same)
        const newHeight = Math.max(1, Math.floor(originalArea.height - dy));
        let newY = Math.floor(originalArea.y + originalArea.height - newHeight);

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, originalArea.x, newY, originalArea.width, newHeight, true);

        updateArea(selectedArea, {
          y: snapped.y,
          height: originalArea.y + originalArea.height - snapped.y,
        });
      } else if (dragMode === 'resize-s') {
        // Resize from bottom edge (height changes, y stays same, width stays same)
        let newHeight = Math.max(1, Math.floor(originalArea.height + dy));

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, originalArea.x, originalArea.y, originalArea.width, newHeight, true);

        updateArea(selectedArea, {
          height: snapped.height,
        });
      } else if (dragMode === 'resize-w') {
        // Resize from left edge (width changes, x changes, height stays same)
        const newWidth = Math.max(1, Math.floor(originalArea.width - dx));
        let newX = Math.floor(originalArea.x + originalArea.width - newWidth);

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, newX, originalArea.y, newWidth, originalArea.height, true);

        updateArea(selectedArea, {
          x: snapped.x,
          width: originalArea.x + originalArea.width - snapped.x,
        });
      } else if (dragMode === 'resize-e') {
        // Resize from right edge (width changes, x stays same, height stays same)
        let newWidth = Math.max(1, Math.floor(originalArea.width + dx));

        // Apply snap to edges, areas, and center
        const snapped = snapToEdgesAndAreas(selectedArea, originalArea.x, originalArea.y, newWidth, originalArea.height, true);

        updateArea(selectedArea, {
          width: snapped.width,
        });
      }
      animationFrameRef.current = null;
    });
  }, [dragMode, selectedArea, originalArea, dragStart, snapToEdgesAndAreas, updateArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - CANVAS_PADDING;
    const y = (e.clientY - rect.top) / scale - CANVAS_PADDING;

    if (dragMode && selectedArea && originalArea) {
      // Currently dragging - set cursor based on drag mode
      if (dragMode === 'move') {
        setCursor('move');
      } else if (dragMode === 'resize-nw' || dragMode === 'resize-se') {
        setCursor('nwse-resize');
      } else if (dragMode === 'resize-ne' || dragMode === 'resize-sw') {
        setCursor('nesw-resize');
      } else if (dragMode === 'resize-n' || dragMode === 'resize-s') {
        setCursor('ns-resize');
      } else if (dragMode === 'resize-w' || dragMode === 'resize-e') {
        setCursor('ew-resize');
      }

      processDrag(x, y);
    } else {
      // Not dragging, update cursor based on hover position
      const areaName = getAreaAtPoint(x, y);
      if (areaName) {
        const area = layout[areaName];
        const resizeHandle = getResizeHandle(x, y, area);

        if (resizeHandle === 'resize-nw' || resizeHandle === 'resize-se') {
          setCursor('nwse-resize');
        } else if (resizeHandle === 'resize-ne' || resizeHandle === 'resize-sw') {
          setCursor('nesw-resize');
        } else if (resizeHandle === 'resize-n' || resizeHandle === 'resize-s') {
          setCursor('ns-resize');
        } else if (resizeHandle === 'resize-w' || resizeHandle === 'resize-e') {
          setCursor('ew-resize');
        } else {
          setCursor('move');
        }
      } else {
        setCursor('default');
      }
    }
  }, [dragMode, selectedArea, originalArea, scale, layout, processDrag]);

  const handleMouseUp = useCallback(() => {
    setDragMode(null);
    setDragStart({ x: 0, y: 0 });
    setOriginalArea(null);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Add global mouse listeners to handle drag outside canvas
    if (!dragMode) return;

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleMouseMove as any);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [dragMode, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: `${(resolution.width + CANVAS_PADDING * 2) * scale}px`,
          height: `${(resolution.height + CANVAS_PADDING * 2) * scale}px`,
          cursor: dragMode ? 'grabbing' : cursor,
          userSelect: 'none',
        }}
        className="border border-gray-400 dark:border-gray-600"
      />
    </div>
  );
}
