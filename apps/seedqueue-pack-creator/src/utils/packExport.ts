import JSZip from 'jszip';
import { downloadFile } from '@mcsr-tools/utils';
import { PackInfo, WallLayout, BackgroundSettings, Resolution, SoundSettings, LockImageSettings, ImageLayer, ColorLayer, GradientLayer } from '../store/useWallStore';

async function dataURLToBlob(dataURL: string): Promise<Blob> {
  const response = await fetch(dataURL);
  return response.blob();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawColorLayer(
  ctx: CanvasRenderingContext2D,
  layer: ColorLayer
) {
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.fillStyle = layer.color;
  ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
  ctx.restore();
}

function drawGradientLayer(
  ctx: CanvasRenderingContext2D,
  layer: GradientLayer
) {
  ctx.save();
  ctx.globalAlpha = layer.opacity;

  let gradient: CanvasGradient;

  switch (layer.gradientDirection) {
    case 'vertical':
      gradient = ctx.createLinearGradient(layer.x, layer.y, layer.x, layer.y + layer.height);
      break;
    case 'horizontal':
      gradient = ctx.createLinearGradient(layer.x, layer.y, layer.x + layer.width, layer.y);
      break;
    case 'diagonal':
      gradient = ctx.createLinearGradient(layer.x, layer.y, layer.x + layer.width, layer.y + layer.height);
      break;
    case 'reverse-diagonal':
      gradient = ctx.createLinearGradient(layer.x + layer.width, layer.y, layer.x, layer.y + layer.height);
      break;
  }

  gradient.addColorStop(0, layer.gradientStart);
  gradient.addColorStop(1, layer.gradientEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
  ctx.restore();
}

function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  layer: ImageLayer,
  resolution: Resolution
) {
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.filter = `brightness(${layer.brightness}%) blur(${layer.blur}px)`;

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
  const scaledWidth = imgWidth * layer.scale;
  const scaledHeight = imgHeight * layer.scale;

  // Calculate position (centered + offset)
  const x = (resolution.width - scaledWidth) / 2 + layer.offsetX;
  const y = (resolution.height - scaledHeight) / 2 + layer.offsetY;

  // Set up clipping region to crop area
  // The crop area defines where the image is visible, not how it's scaled
  ctx.beginPath();
  ctx.rect(layer.cropX, layer.cropY, layer.cropWidth, layer.cropHeight);
  ctx.clip();

  // Draw the image at its natural position (not stretched to fill crop area)
  ctx.drawImage(
    img,
    0, 0, img.width, img.height,
    x, y, scaledWidth, scaledHeight
  );

  ctx.restore();
}

async function generateBackgroundImage(
  background: BackgroundSettings,
  resolution: Resolution
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = resolution.width;
  canvas.height = resolution.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Draw black base first
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, resolution.width, resolution.height);

  // Draw all layers from bottom to top
  for (const layer of background.layers) {
    switch (layer.type) {
      case 'color':
        drawColorLayer(ctx, layer as ColorLayer);
        break;
      case 'image': {
        const img = await loadImage((layer as ImageLayer).image);
        drawImageLayer(ctx, img, layer as ImageLayer, resolution);
        break;
      }
      case 'gradient':
        drawGradientLayer(ctx, layer as GradientLayer);
        break;
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export async function exportResourcePack(
  packInfo: PackInfo,
  layout: WallLayout,
  background: BackgroundSettings,
  resolution: Resolution,
  sounds: SoundSettings,
  lockImages: LockImageSettings,
  replaceLockedInstances: boolean
) {
  const zip = new JSZip();

  // Create pack.mcmeta
  const mcmeta = {
    pack: {
      pack_format: 5, // Minecraft 1.16.x
      description: packInfo.description,
    },
  };
  zip.file('pack.mcmeta', JSON.stringify(mcmeta, null, 2));

  // Add pack icon if exists
  if (packInfo.icon) {
    const iconBlob = await dataURLToBlob(packInfo.icon);
    zip.file('pack.png', iconBlob);
  }

  // Create assets folder structure
  const assetsFolder = zip.folder('assets');
  const seedqueueFolder = assetsFolder?.folder('seedqueue');
  const wallFolder = seedqueueFolder?.folder('wall');
  const texturesFolder = seedqueueFolder?.folder('textures')?.folder('gui')?.folder('wall');
  const soundsFolder = seedqueueFolder?.folder('sounds');

  // Save custom layout configuration (SeedQueue format)
  const customLayout: any = {
    main: { ...layout.main },
  };

  // Remove useGrid flag (internal only, not part of SeedQueue spec)
  delete customLayout.main.useGrid;

  // Only remove rows and columns from main if useGrid is explicitly disabled
  // Default to true if undefined (for backwards compatibility with shared URLs)
  if (layout.main.useGrid === false) {
    delete customLayout.main.rows;
    delete customLayout.main.columns;
  }

  // Remove padding if it's 0 or undefined (keep default behavior)
  if (!customLayout.main.padding) {
    delete customLayout.main.padding;
  }

  // Only include preparing if it exists and is shown
  if (layout.preparing && Array.isArray(layout.preparing) && layout.preparing.length > 0) {
    // Check if preparing area is shown (assuming it has a 'show' property)
    const hasVisiblePreparing = layout.preparing.some((area: any) => area.show !== false);
    if (hasVisiblePreparing) {
      customLayout.preparing = layout.preparing.map((area: any) => {
        const cleaned = { ...area };
        delete cleaned.show; // Remove show flag from export

        // Only remove rows and columns if useGrid is explicitly disabled
        const useGrid = area.useGrid;
        delete cleaned.useGrid; // Remove useGrid flag from export

        if (useGrid === false) {
          delete cleaned.rows;
          delete cleaned.columns;
        }

        // Remove padding if it's 0 or undefined (keep default behavior)
        if (!cleaned.padding) {
          delete cleaned.padding;
        }

        return cleaned;
      });
    }
  } else if (layout.preparing && (layout.preparing as any).show !== false) {
    // Handle preparing as single object (not array)
    const useGrid = (layout.preparing as any).useGrid;
    customLayout.preparing = { ...layout.preparing };
    delete customLayout.preparing.show; // Remove show flag from export
    delete customLayout.preparing.useGrid; // Remove useGrid flag from export

    // Only remove rows and columns if useGrid is explicitly disabled
    if (useGrid === false) {
      delete customLayout.preparing.rows;
      delete customLayout.preparing.columns;
    }

    // Remove padding if it's 0 or undefined (keep default behavior)
    if (!customLayout.preparing.padding) {
      delete customLayout.preparing.padding;
    }
  }

  // Only include locked if it exists and is shown
  if (layout.locked && (layout.locked as any).show !== false) {
    const useGrid = (layout.locked as any).useGrid;
    customLayout.locked = { ...layout.locked };
    delete customLayout.locked.show; // Remove show flag from export
    delete customLayout.locked.useGrid; // Remove useGrid flag from export

    // Only remove rows and columns if useGrid is explicitly disabled
    if (useGrid === false) {
      delete customLayout.locked.rows;
      delete customLayout.locked.columns;
    }

    // Remove padding if it's 0 or undefined (keep default behavior)
    if (!customLayout.locked.padding) {
      delete customLayout.locked.padding;
    }
  }

  customLayout.replaceLockedInstances = replaceLockedInstances;

  wallFolder?.file('custom_layout.json', JSON.stringify(customLayout, null, 2));

  // Generate and add background image to textures folder
  const backgroundBlob = await generateBackgroundImage(background, resolution);
  if (backgroundBlob) {
    texturesFolder?.file('background.png', backgroundBlob);
  }

  // Add lock images
  if (!lockImages.enabled) {
    // Disabled: use pre-generated transparent 32x32 PNG as lock.png
    // Base64-encoded minimal transparent 32x32 PNG
    const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAADklEQVR42mNgGAWjYBQAAAJAAAH3bfLDAAAAAElFTkSuQmCC';
    const binaryString = atob(transparentPngBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    texturesFolder?.file('lock.png', bytes);
  } else if (lockImages.images.length === 1) {
    // Exactly 1 image: export as lock.png
    const lockImageBlob = await dataURLToBlob(lockImages.images[0]);
    texturesFolder?.file('lock.png', lockImageBlob);
  } else if (lockImages.images.length > 1) {
    // 2 or more images: export as lock-1.png, lock-2.png, etc.
    for (let i = 0; i < lockImages.images.length; i++) {
      const lockImageBlob = await dataURLToBlob(lockImages.images[i]);
      texturesFolder?.file(`lock-${i + 1}.png`, lockImageBlob);
    }
  }
  // Enabled without custom images: don't add any lock image file (use default)

  // Add sound files and create sounds.json
  // Create sounds.json based on globalMode
  if (sounds.globalMode !== 'default') {
    const soundsJson: any = {
      lock_instance: { replace: true, sounds: [] },
      reset_all: { replace: true, sounds: [] },
      reset_column: { replace: true, sounds: [] },
      reset_row: { replace: true, sounds: [] },
      start_benchmark: { replace: true, sounds: [] },
      finish_benchmark: { replace: true, sounds: [] },
    };

    if (sounds.globalMode === 'off') {
      // Off mode: all sounds are empty arrays (silent)
      // soundsJson is already initialized with empty arrays and replace: true
    } else if (sounds.globalMode === 'custom') {
      // Custom mode: process each sound individually
      const processSound = async (
        soundKey: 'lockInstance' | 'resetInstance' | 'resetAll' | 'resetColumn' | 'resetRow' | 'startBenchmark' | 'finishBenchmark',
        jsonKey: string
      ) => {
        const sound = sounds[soundKey];

        if (sound.mode === 'off') {
          // Off: empty array (silent), replace: true already set
          soundsJson[jsonKey].sounds = [];
        } else if (sound.mode === 'default') {
          // Default: reference built-in SeedQueue sound
          soundsJson[jsonKey].sounds = [`seedqueue:${jsonKey}`];
        } else if (sound.mode === 'custom') {
          if (sound.file) {
            // Custom with file: add .ogg file
            const soundBlob = await dataURLToBlob(sound.file);
            soundsFolder?.file(`${jsonKey}.ogg`, soundBlob);
            soundsJson[jsonKey].sounds = [`${jsonKey}.ogg`];
          } else {
            // Custom without file: same as off (silent)
            soundsJson[jsonKey].sounds = [];
          }
        }
      };

      // Process basic sounds
      await processSound('lockInstance', 'lock_instance');
      await processSound('startBenchmark', 'start_benchmark');
      await processSound('finishBenchmark', 'finish_benchmark');

      // Process reset sounds
      if (sounds.resetInstanceMode === 'unified') {
        // Unified: use resetInstance for all three
        await processSound('resetInstance', 'reset_all');
        await processSound('resetInstance', 'reset_column');
        await processSound('resetInstance', 'reset_row');
      } else {
        // Separate: use individual settings
        await processSound('resetAll', 'reset_all');
        await processSound('resetColumn', 'reset_column');
        await processSound('resetRow', 'reset_row');
      }
    }

    // Always create sounds.json when globalMode is 'off' or 'custom'
    seedqueueFolder?.file('sounds.json', JSON.stringify(soundsJson, null, 2));
  }
  // If globalMode is 'default', don't create sounds.json (use SeedQueue's built-in sounds)

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: 'blob' });

  // Download the file
  const filename = `${packInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
  await downloadFile(blob, filename);
}
