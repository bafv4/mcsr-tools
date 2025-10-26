import JSZip from 'jszip';
import { downloadFile } from '@mcsr-tools/utils';
import { PackInfo, WallLayout, BackgroundSettings, Resolution, SoundSettings } from '../store/useWallStore';

async function dataURLToBlob(dataURL: string): Promise<Blob> {
  const response = await fetch(dataURL);
  return response.blob();
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

  if (background.type === 'color') {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, resolution.width, resolution.height);
  } else if (background.type === 'image' && background.image) {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = background.image!;
    });

    ctx.save();
    ctx.filter = `brightness(${background.imageBrightness}%) blur(${background.imageBlur}px)`;

    const baseScale = Math.max(
      resolution.width / img.width,
      resolution.height / img.height
    );
    const scale = baseScale * background.imageScale;

    const x = (resolution.width - img.width * scale) / 2 + background.imageOffsetX;
    const y = (resolution.height - img.height * scale) / 2 + background.imageOffsetY;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, resolution.width, resolution.height);
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    ctx.restore();
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

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export async function exportResourcePack(
  packInfo: PackInfo,
  layout: WallLayout,
  background: BackgroundSettings,
  resolution: Resolution,
  sounds: SoundSettings
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

  // Remove rows and columns from main if useGrid is disabled or they are not set
  if (!layout.main.useGrid || !customLayout.main.rows || customLayout.main.rows === 0) {
    delete customLayout.main.rows;
  }
  if (!layout.main.useGrid || !customLayout.main.columns || customLayout.main.columns === 0) {
    delete customLayout.main.columns;
  }

  // Only include preparing if it exists and is shown
  if (layout.preparing && Array.isArray(layout.preparing) && layout.preparing.length > 0) {
    // Check if preparing area is shown (assuming it has a 'show' property)
    const hasVisiblePreparing = layout.preparing.some((area: any) => area.show !== false);
    if (hasVisiblePreparing) {
      customLayout.preparing = layout.preparing.map((area: any) => {
        const cleaned = { ...area };
        delete cleaned.show; // Remove show flag from export
        delete cleaned.useGrid; // Remove useGrid flag from export

        // Remove rows and columns if useGrid is disabled
        if (!area.useGrid) {
          delete cleaned.rows;
          delete cleaned.columns;
        }

        return cleaned;
      });
    }
  }

  // Only include locked if it exists and is shown
  if (layout.locked && (layout.locked as any).show !== false) {
    customLayout.locked = { ...layout.locked };
    delete customLayout.locked.show; // Remove show flag from export
    delete customLayout.locked.useGrid; // Remove useGrid flag from export

    // Remove rows and columns if useGrid is disabled
    if (!layout.locked.useGrid) {
      delete customLayout.locked.rows;
      delete customLayout.locked.columns;
    }
  }

  customLayout.replaceLockedInstances = false;

  wallFolder?.file('custom_layout.json', JSON.stringify(customLayout, null, 2));

  // Generate and add background image to textures folder
  const backgroundBlob = await generateBackgroundImage(background, resolution);
  if (backgroundBlob) {
    texturesFolder?.file('background.png', backgroundBlob);
  }

  // Add sound files
  // Built-in sounds (replace existing based on flag)
  if (sounds.lockInstanceReplace) {
    if (sounds.lockInstance) {
      // Replace with custom file
      const soundBlob = await dataURLToBlob(sounds.lockInstance);
      soundsFolder?.file('lock_instance.ogg', soundBlob);
    } else {
      // Replace with silence (empty file)
      soundsFolder?.file('lock_instance.ogg', new Blob([], { type: 'audio/ogg' }));
    }
  }
  // If not replacing, don't add the file (use default)

  if (sounds.resetInstanceReplace) {
    if (sounds.resetInstance) {
      // Replace with custom file
      const soundBlob = await dataURLToBlob(sounds.resetInstance);
      soundsFolder?.file('reset_instance.ogg', soundBlob);
    } else {
      // Replace with silence (empty file)
      soundsFolder?.file('reset_instance.ogg', new Blob([], { type: 'audio/ogg' }));
    }
  }
  // If not replacing, don't add the file (use default)

  // Custom sounds (require sounds.json)
  const customSounds: any = {};
  const soundMappings = [
    { key: 'playInstance', name: 'play_instance' },
    { key: 'resetAll', name: 'reset_all' },
    { key: 'resetColumn', name: 'reset_column' },
    { key: 'resetRow', name: 'reset_row' },
    { key: 'startBenchmark', name: 'start_benchmark' },
    { key: 'finishBenchmark', name: 'finish_benchmark' },
  ];

  for (const { key, name } of soundMappings) {
    const soundData = sounds[key as keyof SoundSettings];
    if (soundData && typeof soundData === 'string') {
      const soundBlob = await dataURLToBlob(soundData);
      soundsFolder?.file(`${name}.ogg`, soundBlob);
      customSounds[name] = {
        sounds: [`seedqueue:${name}`],
      };
    }
  }

  // Create sounds.json if there are custom sounds
  if (Object.keys(customSounds).length > 0) {
    seedqueueFolder?.file('sounds.json', JSON.stringify(customSounds, null, 2));
  }

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: 'blob' });

  // Download the file
  const filename = `${packInfo.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
  await downloadFile(blob, filename);
}
