import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { cn } from './lib/utils';
import { AtlasParser } from 'mc-assets';
import itemsAtlases from 'mc-assets/dist/itemsAtlases.json';
import blocksAtlases from 'mc-assets/dist/blocksAtlases.json';

// Import PNG files as URLs
const itemsAtlasLatest = new URL('mc-assets/dist/itemsAtlasLatest.png', import.meta.url).href;
const itemsAtlasLegacy = new URL('mc-assets/dist/itemsAtlasLegacy.png', import.meta.url).href;
const blocksAtlasLatest = new URL('mc-assets/dist/blocksAtlasLatest.png', import.meta.url).href;
const blocksAtlasLegacy = new URL('mc-assets/dist/blocksAtlasLegacy.png', import.meta.url).href;

// Create atlas parser singletons
let itemsAtlasParser: AtlasParser | null = null;
let blocksAtlasParser: AtlasParser | null = null;

function getItemsAtlasParser(): AtlasParser {
  if (!itemsAtlasParser) {
    itemsAtlasParser = new AtlasParser(itemsAtlases, itemsAtlasLatest, itemsAtlasLegacy);
  }
  return itemsAtlasParser;
}

function getBlocksAtlasParser(): AtlasParser {
  if (!blocksAtlasParser) {
    blocksAtlasParser = new AtlasParser(blocksAtlases, blocksAtlasLatest, blocksAtlasLegacy);
  }
  return blocksAtlasParser;
}

export interface MinecraftItemIconProps extends Omit<ImgHTMLAttributes<HTMLCanvasElement>, 'src' | 'alt'> {
  itemId: string;
  size?: number;
  fallback?: React.ReactNode;
  showFallbackOnError?: boolean;
  version?: 'latest' | 'legacy'; // mc-assets atlas version: 'legacy' for MC 1.16.x and older, 'latest' for newer versions
}

export function MinecraftItemIcon({
  itemId,
  size = 48,
  fallback,
  showFallbackOnError = true,
  version = 'latest', // Default to latest (MC 1.16.1 textures are similar to latest)
  className,
  ...props
}: MinecraftItemIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const itemName = itemId.replace('minecraft:', '');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    async function renderItem() {
      try {
        // Try to find texture in multiple atlases with various naming patterns
        const itemsParser = getItemsAtlasParser();
        const blocksParser = getBlocksAtlasParser();

        let textureInfo = null;

        // 1. Try items atlas with exact name
        textureInfo = itemsParser.getTextureInfo(itemName, version);

        // 2. Try blocks atlas with exact name
        if (!textureInfo) {
          textureInfo = blocksParser.getTextureInfo(itemName, version);
        }

        // 3. Try blocks atlas with _front suffix (for blocks like crafting_table, furnace, etc.)
        if (!textureInfo) {
          textureInfo = blocksParser.getTextureInfo(`${itemName}_front`, version);
        }

        // 4. Try blocks atlas with _top suffix
        if (!textureInfo) {
          textureInfo = blocksParser.getTextureInfo(`${itemName}_top`, version);
        }

        // 5. Try blocks atlas with _side suffix
        if (!textureInfo) {
          textureInfo = blocksParser.getTextureInfo(`${itemName}_side`, version);
        }

        // 6. For items ending with _block, try without the _block suffix (e.g., magma_block -> magma)
        if (!textureInfo && itemName.endsWith('_block')) {
          const nameWithoutBlock = itemName.replace(/_block$/, '');
          textureInfo = blocksParser.getTextureInfo(nameWithoutBlock, version);
        }

        // 7. Try with invsprite_ prefix (for beds, shulker boxes, leaves, etc.)
        if (!textureInfo) {
          textureInfo = itemsParser.getTextureInfo(`invsprite_${itemName}`, version);
        }

        if (!textureInfo) {
          if (isMounted) {
            setHasError(true);
          }
          return;
        }

        const img = await textureInfo.getLoadedImage();

        if (!isMounted || !canvas || !ctx) {
          return;
        }

        // Calculate source dimensions from atlas
        const sourceX = textureInfo.u * img.width;
        const sourceY = textureInfo.v * img.height;
        const sourceWidth = img.width * textureInfo.su;
        const sourceHeight = img.height * textureInfo.sv;

        // Set canvas size
        canvas.width = size;
        canvas.height = size;

        // Disable image smoothing for pixelated look
        ctx.imageSmoothingEnabled = false;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw texture
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          size,
          size
        );

        if (isMounted) {
          setIsLoaded(true);
          setHasError(false);
        }
      } catch (error) {
        console.error('Failed to render Minecraft item:', error);
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    renderItem();

    return () => {
      isMounted = false;
    };
  }, [itemId, itemName, size, version]);

  // Show fallback if error occurred
  if (hasError && showFallbackOnError) {
    if (fallback) {
      return <>{fallback}</>;
    }
    // Default fallback: show first letter of item name
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold rounded',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {itemName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn(
          'pixelated',
          !isLoaded && 'opacity-0',
          isLoaded && 'opacity-100 transition-opacity duration-200',
          className
        )}
        style={{ width: size, height: size }}
        {...props}
      />
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded',
            className
          )}
          style={{ width: size, height: size }}
        />
      )}
    </>
  );
}
