import JSZip from 'jszip';

export async function importResourcePack(file: File): Promise<any> {
  try {
    const zip = await JSZip.loadAsync(file);
    const result: any = {
      packInfo: {
        name: 'Imported Pack',
        description: '',
        icon: null,
      },
      resolution: {
        width: 1920,
        height: 1080,
      },
      layout: null,
      background: {
        type: 'color' as const,
        color: '#1a1a1a',
        image: null,
        imageBrightness: 100,
        imageBlur: 0,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageScale: 1,
        gradientStart: '#1a1a1a',
        gradientEnd: '#4a4a4a',
        gradientDirection: 'vertical' as const,
      },
      sounds: {
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
      },
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
    if (customLayoutFile) {
      const layoutText = await customLayoutFile.async('text');
      const customLayout = JSON.parse(layoutText);

      // Parse custom layout (SeedQueue format)
      result.layout = {
        main: customLayout.main || {},
        preparing: customLayout.preparing || [],
        locked: customLayout.locked || {},
      };

      // Import replaceLockedInstances if present
      if (typeof customLayout.replaceLockedInstances === 'boolean') {
        result.replaceLockedInstances = customLayout.replaceLockedInstances;
      }
    }

    // Also support legacy format (wall.json) for backwards compatibility
    const wallConfigFile = zip.file('assets/seedqueue/wall.json');
    if (wallConfigFile) {
      const wallConfigText = await wallConfigFile.async('text');
      const wallConfig = JSON.parse(wallConfigText);

      // Parse wall configuration
      if (wallConfig.layout) {
        result.layout = wallConfig.layout;
      }
      if (wallConfig.resolution) {
        result.resolution = wallConfig.resolution;
      }
      if (wallConfig.background) {
        result.background = { ...result.background, ...wallConfig.background };
      }
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
        if (key === 'lockInstance' || key === 'resetInstance') {
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
