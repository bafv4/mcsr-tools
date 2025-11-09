import JSZip from 'jszip';

interface ImportedData {
  packInfo?: {
    name: string;
    description: string;
    icon: string | null;
  };
  resolution?: {
    width: number;
    height: number;
  };
  layout?: any;
  background?: any;
  sounds?: any;
  lockImages?: any;
  replaceLockedInstances?: boolean;
}

/**
 * Convert percentage-based layout to pixel-based layout
 */
function convertPercentageToPixels(area: any, width: number, height: number): any {
  if (!area) return area;

  const result = { ...area };

  // Check if values are percentages (0-1 range indicates percentage format)
  const isPercentage =
    (area.x !== undefined && area.x <= 1 && area.x >= 0) ||
    (area.y !== undefined && area.y <= 1 && area.y >= 0) ||
    (area.width !== undefined && area.width <= 1 && area.width > 0) ||
    (area.height !== undefined && area.height <= 1 && area.height > 0);

  if (isPercentage) {
    if (area.x !== undefined) result.x = Math.round(area.x * width);
    if (area.y !== undefined) result.y = Math.round(area.y * height);
    if (area.width !== undefined) result.width = Math.round(area.width * width);
    if (area.height !== undefined) result.height = Math.round(area.height * height);
  }

  return result;
}

/**
 * Detect resolution from layout data
 */
function detectResolutionFromLayout(layout: any): { width: number; height: number } | null {
  if (!layout || !layout.main) return null;

  const main = layout.main;

  // If main area has coordinates that look like absolute pixels (> 100)
  if (main.x !== undefined && main.y !== undefined &&
      main.width !== undefined && main.height !== undefined) {
    // Calculate potential resolution from main area position
    const estimatedWidth = Math.round(main.x + main.width);
    const estimatedHeight = Math.round(main.y + main.height);

    // Check if this looks like a standard resolution
    const standardResolutions = [
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
      { width: 3840, height: 2160 },
      { width: 1280, height: 720 },
      { width: 1366, height: 768 },
      { width: 1600, height: 900 },
    ];

    // Find closest standard resolution
    for (const res of standardResolutions) {
      const widthDiff = Math.abs(res.width - estimatedWidth) / res.width;
      const heightDiff = Math.abs(res.height - estimatedHeight) / res.height;

      // If within 10% of a standard resolution, use that
      if (widthDiff < 0.1 && heightDiff < 0.1) {
        return res;
      }
    }

    // If no standard resolution matches, use estimated values
    if (estimatedWidth > 800 && estimatedHeight > 600) {
      return {
        width: estimatedWidth,
        height: estimatedHeight,
      };
    }
  }

  return null;
}

export async function importResourcePack(file: File): Promise<ImportedData> {
  try {
    const zip = await JSZip.loadAsync(file);
    const result: ImportedData = {};

    // Initialize pack info
    result.packInfo = {
      name: 'Imported Pack',
      description: '',
      icon: null,
    };

    // Read pack.mcmeta
    const mcmetaFile = zip.file('pack.mcmeta');
    if (mcmetaFile) {
      const mcmetaText = await mcmetaFile.async('text');
      const mcmeta = JSON.parse(mcmetaText);
      if (mcmeta.pack) {
        result.packInfo.description = mcmeta.pack.description || '';
      }
    }

    // Read pack.png
    const packPngFile = zip.file('pack.png');
    if (packPngFile) {
      const pngData = await packPngFile.async('base64');
      result.packInfo.icon = `data:image/png;base64,${pngData}`;
    }

    // Try to read custom layout from SeedQueue format
    const customLayoutFile = zip.file('assets/seedqueue/wall/custom_layout.json');
    let rawLayout: any = null;
    let detectedResolution: { width: number; height: number } | null = null;

    if (customLayoutFile) {
      const layoutText = await customLayoutFile.async('text');
      const customLayout = JSON.parse(layoutText);

      rawLayout = {
        main: customLayout.main || {},
        preparing: customLayout.preparing || {},
        locked: customLayout.locked || {},
      };

      // Import replaceLockedInstances if present
      if (typeof customLayout.replaceLockedInstances === 'boolean') {
        result.replaceLockedInstances = customLayout.replaceLockedInstances;
      }

      // Set show flag based on whether the area exists in the layout
      // If the area is not present in the JSON, hide it
      if (rawLayout.preparing) {
        rawLayout.preparing.show = customLayout.preparing !== undefined;
      }
      if (rawLayout.locked) {
        rawLayout.locked.show = customLayout.locked !== undefined;
      }

      // Try to detect resolution from layout
      detectedResolution = detectResolutionFromLayout(rawLayout);
    }

    // Also support legacy format (wall.json) for backwards compatibility
    const wallConfigFile = zip.file('assets/seedqueue/wall.json');
    if (wallConfigFile) {
      const wallConfigText = await wallConfigFile.async('text');
      const wallConfig = JSON.parse(wallConfigText);

      // Parse wall configuration
      if (wallConfig.layout) {
        rawLayout = wallConfig.layout;

        // Set show flag based on whether the area exists in the layout
        if (rawLayout.preparing) {
          rawLayout.preparing.show = wallConfig.layout.preparing !== undefined;
        }
        if (rawLayout.locked) {
          rawLayout.locked.show = wallConfig.layout.locked !== undefined;
        }

        detectedResolution = detectResolutionFromLayout(rawLayout);
      }

      // Use explicit resolution if provided
      if (wallConfig.resolution) {
        result.resolution = wallConfig.resolution;
        detectedResolution = wallConfig.resolution;
      }

      if (wallConfig.background) {
        result.background = wallConfig.background;
      }
    }

    // Set resolution (detected or default)
    if (!result.resolution) {
      result.resolution = detectedResolution || { width: 1920, height: 1080 };
    }

    // Convert layout based on detected resolution
    if (rawLayout) {
      const width = result.resolution.width;
      const height = result.resolution.height;

      result.layout = {
        main: convertPercentageToPixels(rawLayout.main, width, height),
        preparing: convertPercentageToPixels(rawLayout.preparing, width, height),
        locked: convertPercentageToPixels(rawLayout.locked, width, height),
      };

      // Preserve other properties
      if (rawLayout.main) {
        result.layout.main = {
          ...result.layout.main,
          useGrid: rawLayout.main.useGrid,
          columns: rawLayout.main.columns,
          rows: rawLayout.main.rows,
          padding: rawLayout.main.padding,
        };
      }
      if (rawLayout.preparing) {
        result.layout.preparing = {
          ...result.layout.preparing,
          show: rawLayout.preparing.show ?? false, // Default to false if not set
          useGrid: rawLayout.preparing.useGrid,
          columns: rawLayout.preparing.columns,
          rows: rawLayout.preparing.rows,
          padding: rawLayout.preparing.padding,
        };
      }
      if (rawLayout.locked) {
        result.layout.locked = {
          ...result.layout.locked,
          show: rawLayout.locked.show ?? false, // Default to false if not set
          useGrid: rawLayout.locked.useGrid,
          columns: rawLayout.locked.columns,
          rows: rawLayout.locked.rows,
          padding: rawLayout.locked.padding,
        };
      }
    }

    // Initialize background if not set
    if (!result.background) {
      const width = result.resolution?.width || 1920;
      const height = result.resolution?.height || 1080;

      result.background = {
        type: 'color' as const,
        color: '#1a1a1a',
        image: null,
        imageBrightness: 100,
        imageBlur: 0,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageScale: 1,
        imageCropX: 0,
        imageCropY: 0,
        imageCropWidth: width,
        imageCropHeight: height,
        gradientStart: '#1a1a1a',
        gradientEnd: '#4a4a4a',
        gradientDirection: 'vertical' as const,
      };
    }

    // Read background image from textures folder (SeedQueue format)
    const bgImageFile = zip.file('assets/seedqueue/textures/gui/wall/background.png') ||
                       zip.file('assets/seedqueue/textures/gui/wall/background.jpg') ||
                       // Legacy location for backwards compatibility
                       zip.file('assets/seedqueue/background.png') ||
                       zip.file('assets/seedqueue/background.jpg');

    if (bgImageFile) {
      const bgData = await bgImageFile.async('base64');
      const ext = bgImageFile.name.endsWith('.png') ? 'png' : 'jpeg';
      result.background.image = `data:image/${ext};base64,${bgData}`;
      result.background.type = 'image';
    }

    // Initialize lock images
    result.lockImages = {
      enabled: true,
      images: [],
    };

    // Read lock images
    // Check for lock.png first (single image case)
    const singleLockFile = zip.file('assets/seedqueue/textures/gui/wall/lock.png');

    // Check for lock-*.png files (multiple images case)
    const lockImageFiles: { index: number; file: JSZip.JSZipObject }[] = [];
    zip.folder('assets/seedqueue/textures/gui/wall')?.forEach((relativePath, file) => {
      const lockMatch = relativePath.match(/^lock-(\d+)\.png$/);
      if (lockMatch) {
        const index = parseInt(lockMatch[1], 10);
        lockImageFiles.push({ index, file });
      }
    });

    if (lockImageFiles.length > 0) {
      // Multiple images: read lock-1.png, lock-2.png, etc.
      lockImageFiles.sort((a, b) => a.index - b.index);
      for (const { file } of lockImageFiles) {
        const imageData = await file.async('base64');
        result.lockImages.images.push(`data:image/png;base64,${imageData}`);
      }
      result.lockImages.enabled = true;
    } else if (singleLockFile) {
      // Single lock.png file
      const imageData = await singleLockFile.async('base64');
      const blob = await singleLockFile.async('blob');

      // Check if it's a transparent 1x1 image (disabled state)
      if (blob.size < 100) {
        // Likely a transparent placeholder, consider it disabled
        result.lockImages.enabled = false;
      } else {
        // Regular lock image
        result.lockImages.images.push(`data:image/png;base64,${imageData}`);
        result.lockImages.enabled = true;
      }
    }
    // If no lock files found, leave as default (enabled but empty)

    // Initialize sounds
    result.sounds = {
      lockInstance: null,
      lockInstanceReplace: false,
      resetInstance: null,
      resetInstanceReplace: false,
      playInstance: null,
      resetAll: null,
      resetColumn: null,
      resetRow: null,
      startBenchmark: null,
      finishBenchmark: null,
    };

    // Read sound files
    const soundMappings = [
      { key: 'lockInstance', filename: 'lock_instance.ogg' },
      { key: 'resetInstance', filename: 'reset_instance.ogg' },
      { key: 'playInstance', filename: 'play_instance.ogg' },
      { key: 'resetAll', filename: 'reset_all.ogg' },
      { key: 'resetColumn', filename: 'reset_column.ogg' },
      { key: 'resetRow', filename: 'reset_row.ogg' },
      { key: 'startBenchmark', filename: 'start_benchmark.ogg' },
      { key: 'finishBenchmark', filename: 'finish_benchmark.ogg' },
    ];

    for (const { key, filename } of soundMappings) {
      const soundFile = zip.file(`assets/seedqueue/sounds/${filename}`);
      if (soundFile) {
        const soundData = await soundFile.async('base64');
        const dataURL = `data:audio/ogg;base64,${soundData}`;

        // Check if file has content (not empty/silent)
        const blob = await soundFile.async('blob');
        const hasContent = blob.size > 0;

        result.sounds[key] = hasContent ? dataURL : null;

        // Set replace flag for built-in sounds if the file exists
        if ((key === 'lockInstance' || key === 'resetInstance') && hasContent) {
          result.sounds[`${key}Replace`] = true;
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Failed to import resource pack:', error);
    throw new Error('リソースパックの読み込みに失敗しました');
  }
}
