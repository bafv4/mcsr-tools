import { create } from 'zustand';

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  columns: number;
  useGrid?: boolean; // Whether to use grid layout (rows/columns)
  padding?: number; // Gap between instances (in pixels)
}

export interface WallLayout {
  main: Area;
  locked: Area & { show: boolean };
  preparing: Area & { show: boolean };
}

export type BackgroundType = 'color' | 'image' | 'gradient';

export interface BackgroundSettings {
  type: BackgroundType;
  color: string;
  image: string | null;
  imageBrightness: number;
  imageBlur: number;
  imageOffsetX: number;
  imageOffsetY: number;
  imageScale: number;
  imageCropX: number;
  imageCropY: number;
  imageCropWidth: number;
  imageCropHeight: number;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: 'vertical' | 'horizontal' | 'diagonal' | 'reverse-diagonal';
}

export interface PackInfo {
  name: string;
  description: string;
  icon: string | null;
}

export interface LockImageSettings {
  enabled: boolean; // Whether to use lock images
  images: string[]; // Array of image data URLs
}

export type SoundMode = 'off' | 'default' | 'custom';
export type GlobalSoundMode = 'off' | 'default' | 'custom';

export interface SoundSettings {
  // Global sound mode: off (all silent), default (all use SeedQueue built-in), custom (configure individually)
  globalMode: GlobalSoundMode;

  // Lock Instance sound
  lockInstance: {
    mode: SoundMode;
    file: string | null; // Custom .ogg file (only used when mode is 'custom')
  };

  // Reset Instance sounds
  resetInstanceMode: 'unified' | 'separate'; // Unified: all/column/row use same sound, Separate: configure individually
  resetInstance: {
    mode: SoundMode;
    file: string | null;
  };
  resetAll: {
    mode: SoundMode;
    file: string | null;
  };
  resetColumn: {
    mode: SoundMode;
    file: string | null;
  };
  resetRow: {
    mode: SoundMode;
    file: string | null;
  };

  // Benchmark sounds
  startBenchmark: {
    mode: SoundMode;
    file: string | null;
  };
  finishBenchmark: {
    mode: SoundMode;
    file: string | null;
  };
}

export interface Resolution {
  width: number;
  height: number;
}

interface WallStore {
  resolution: Resolution;
  layout: WallLayout;
  background: BackgroundSettings;
  packInfo: PackInfo;
  sounds: SoundSettings;
  lockImages: LockImageSettings;
  selectedArea: 'main' | 'locked' | 'preparing' | null;
  replaceLockedInstances: boolean;

  setResolution: (resolution: Resolution) => void;
  setLayout: (layout: WallLayout) => void;
  updateArea: (area: 'main' | 'locked' | 'preparing', updates: Partial<Area>) => void;
  setBackground: (background: Partial<BackgroundSettings>) => void;
  setPackInfo: (packInfo: Partial<PackInfo>) => void;
  setSounds: (sounds: Partial<SoundSettings>) => void;
  setLockImages: (lockImages: Partial<LockImageSettings>) => void;
  addLockImage: (image: string) => void;
  removeLockImage: (index: number) => void;
  selectArea: (area: 'main' | 'locked' | 'preparing' | null) => void;
  setReplaceLockedInstances: (value: boolean) => void;
  resetToDefault: () => void;
  importData: (data: Partial<WallStore>) => void;
}

const defaultResolution: Resolution = {
  width: 1920,
  height: 1080,
};

const defaultLayout: WallLayout = {
  main: {
    x: 0,
    y: 0,
    width: 1632, // 85% of 1920
    height: 1080, // 100% height
    rows: 4,
    columns: 3,
    useGrid: true, // Use grid by default
    padding: 0,
  },
  locked: {
    x: 1632, // Start where main ends
    y: 0,
    width: 288, // 15% of 1920
    height: 1080, // 100% height
    rows: 6,
    columns: 1,
    show: true,
    useGrid: true,
    padding: 0,
  },
  preparing: {
    x: 1520,
    y: 0,
    width: 400,
    height: 1080,
    rows: 6,
    columns: 1,
    show: false, // Hidden by default
    useGrid: true,
    padding: 0,
  },
};

const defaultBackground: BackgroundSettings = {
  type: 'color',
  color: '#1a1a1a',
  image: null,
  imageBrightness: 100,
  imageBlur: 0,
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageScale: 1,
  imageCropX: 0,
  imageCropY: 0,
  imageCropWidth: 1920,
  imageCropHeight: 1080,
  gradientStart: '#1a1a1a',
  gradientEnd: '#4a4a4a',
  gradientDirection: 'vertical',
};

const defaultPackInfo: PackInfo = {
  name: '',
  description: '',
  icon: null,
};

const defaultSounds: SoundSettings = {
  globalMode: 'default',
  lockInstance: {
    mode: 'default',
    file: null,
  },
  resetInstanceMode: 'unified',
  resetInstance: {
    mode: 'default',
    file: null,
  },
  resetAll: {
    mode: 'default',
    file: null,
  },
  resetColumn: {
    mode: 'default',
    file: null,
  },
  resetRow: {
    mode: 'default',
    file: null,
  },
  startBenchmark: {
    mode: 'default',
    file: null,
  },
  finishBenchmark: {
    mode: 'default',
    file: null,
  },
};

const defaultLockImages: LockImageSettings = {
  enabled: true, // Default to enabled
  images: [],
};

export const useWallStore = create<WallStore>((set) => ({
  resolution: defaultResolution,
  layout: defaultLayout,
  background: defaultBackground,
  packInfo: defaultPackInfo,
  sounds: defaultSounds,
  lockImages: defaultLockImages,
  selectedArea: null,
  replaceLockedInstances: false,

  setResolution: (resolution) =>
    set((state) => {
      // Calculate scale factors
      const scaleX = resolution.width / state.resolution.width;
      const scaleY = resolution.height / state.resolution.height;

      // Scale all areas
      const scaleArea = (area: Area | (Area & { show: boolean })) => {
        const scaled = {
          ...area,
          x: Math.round(area.x * scaleX),
          y: Math.round(area.y * scaleY),
          width: Math.round(area.width * scaleX),
          height: Math.round(area.height * scaleY),
        };
        return scaled;
      };

      return {
        resolution,
        layout: {
          main: scaleArea(state.layout.main),
          locked: scaleArea(state.layout.locked) as Area & { show: boolean },
          preparing: scaleArea(state.layout.preparing) as Area & { show: boolean },
        },
      };
    }),

  setLayout: (layout) => set({ layout }),

  updateArea: (area, updates) =>
    set((state) => ({
      layout: {
        ...state.layout,
        [area]: { ...state.layout[area], ...updates },
      },
    })),

  setBackground: (background) =>
    set((state) => ({
      background: { ...state.background, ...background },
    })),

  setPackInfo: (packInfo) =>
    set((state) => ({
      packInfo: { ...state.packInfo, ...packInfo },
    })),

  setSounds: (sounds) =>
    set((state) => ({
      sounds: { ...state.sounds, ...sounds },
    })),

  setLockImages: (lockImages) =>
    set((state) => ({
      lockImages: { ...state.lockImages, ...lockImages },
    })),

  addLockImage: (image) =>
    set((state) => ({
      lockImages: {
        ...state.lockImages,
        images: [...state.lockImages.images, image],
      },
    })),

  removeLockImage: (index) =>
    set((state) => ({
      lockImages: {
        ...state.lockImages,
        images: state.lockImages.images.filter((_, i) => i !== index),
      },
    })),

  selectArea: (area) => set({ selectedArea: area }),

  setReplaceLockedInstances: (value) => set({ replaceLockedInstances: value }),

  resetToDefault: () =>
    set({
      resolution: defaultResolution,
      layout: defaultLayout,
      background: defaultBackground,
      packInfo: defaultPackInfo,
      sounds: defaultSounds,
      lockImages: defaultLockImages,
      selectedArea: null,
      replaceLockedInstances: false,
    }),

  importData: (data) =>
    set((state) => ({
      ...state,
      ...data,
      // Merge background settings to preserve all properties
      background: data.background
        ? { ...state.background, ...data.background }
        : state.background,
      // Merge other nested objects
      packInfo: data.packInfo
        ? { ...state.packInfo, ...data.packInfo }
        : state.packInfo,
      sounds: data.sounds
        ? { ...state.sounds, ...data.sounds }
        : state.sounds,
      lockImages: data.lockImages
        ? { ...state.lockImages, ...data.lockImages }
        : state.lockImages,
    })),
}));
