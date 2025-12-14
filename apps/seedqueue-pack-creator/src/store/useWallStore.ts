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

export type BackgroundLayerType = 'color' | 'image' | 'gradient';

// Base layer properties shared by all layer types
interface BaseLayer {
  id: string;
  type: BackgroundLayerType;
  opacity: number; // 0-1, 1 = fully opaque
}

// Color layer
export interface ColorLayer extends BaseLayer {
  type: 'color';
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Image layer with positioning and cropping
export interface ImageLayer extends BaseLayer {
  type: 'image';
  image: string;
  brightness: number;
  blur: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

// Gradient layer
export interface GradientLayer extends BaseLayer {
  type: 'gradient';
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: 'vertical' | 'horizontal' | 'diagonal' | 'reverse-diagonal';
  x: number;
  y: number;
  width: number;
  height: number;
}

// Union type for all layer types
export type BackgroundLayer = ColorLayer | ImageLayer | GradientLayer;

export interface BackgroundSettings {
  // Layers ordered from bottom to top
  layers: BackgroundLayer[];
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
  selectedLayerId: string | null;
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
  selectLayer: (id: string | null) => void;
  setReplaceLockedInstances: (value: boolean) => void;
  resetToDefault: () => void;
  importData: (data: Partial<WallStore>) => void;
  // Background layer management
  addLayer: (type: BackgroundLayerType, data?: Partial<BackgroundLayer>) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<BackgroundLayer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
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
  layers: [
    {
      id: 'default-color',
      type: 'color',
      color: '#1a1a1a',
      opacity: 1,
      x: 0,
      y: 0,
      width: defaultResolution.width,
      height: defaultResolution.height,
    },
  ],
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
  selectedLayerId: null,
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

  selectLayer: (id) => set({ selectedLayerId: id }),

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
      selectedLayerId: null,
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

  // Background layer management
  addLayer: (type, data) =>
    set((state) => {
      let newLayer: BackgroundLayer;
      const id = crypto.randomUUID();

      // New layer is added at the top, so it gets default opacity of 1
      const newLayerOpacity = 1;

      switch (type) {
        case 'color':
          newLayer = {
            id,
            type: 'color',
            color: (data as Partial<ColorLayer>)?.color ?? '#1a1a1a',
            opacity: newLayerOpacity,
            x: 0,
            y: 0,
            width: state.resolution.width,
            height: state.resolution.height,
          };
          break;
        case 'image': {
          const imageData = data as Partial<ImageLayer>;
          newLayer = {
            id,
            type: 'image',
            image: imageData?.image ?? '',
            brightness: imageData?.brightness ?? 100,
            blur: imageData?.blur ?? 0,
            offsetX: imageData?.offsetX ?? 0,
            offsetY: imageData?.offsetY ?? 0,
            scale: imageData?.scale ?? 1,
            cropX: imageData?.cropX ?? 0,
            cropY: imageData?.cropY ?? 0,
            cropWidth: imageData?.cropWidth ?? state.resolution.width,
            cropHeight: imageData?.cropHeight ?? state.resolution.height,
            opacity: newLayerOpacity,
          };
          break;
        }
        case 'gradient':
          newLayer = {
            id,
            type: 'gradient',
            gradientStart: (data as Partial<GradientLayer>)?.gradientStart ?? '#1a1a1a',
            gradientEnd: (data as Partial<GradientLayer>)?.gradientEnd ?? '#4a4a4a',
            gradientDirection: (data as Partial<GradientLayer>)?.gradientDirection ?? 'vertical',
            opacity: newLayerOpacity,
            x: 0,
            y: 0,
            width: state.resolution.width,
            height: state.resolution.height,
          };
          break;
      }

      return {
        background: {
          ...state.background,
          layers: [...state.background.layers, newLayer],
        },
        selectedLayerId: id,
      };
    }),

  removeLayer: (id) =>
    set((state) => ({
      background: {
        ...state.background,
        layers: state.background.layers.filter((layer) => layer.id !== id),
      },
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })),

  updateLayer: (id, updates) =>
    set((state) => ({
      background: {
        ...state.background,
        layers: state.background.layers.map((layer) =>
          layer.id === id ? { ...layer, ...updates } as BackgroundLayer : layer
        ),
      },
    })),

  reorderLayers: (fromIndex, toIndex) =>
    set((state) => {
      const layers = [...state.background.layers];
      const [removed] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, removed);

      // Force opacity to 1 for the bottom layer (index 0)
      if (layers.length > 0 && layers[0].opacity !== 1) {
        layers[0] = { ...layers[0], opacity: 1 };
      }

      return {
        background: {
          ...state.background,
          layers,
        },
      };
    }),
}));
