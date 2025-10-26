import { create } from 'zustand';

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
  rows: number;
  columns: number;
  useGrid?: boolean; // Whether to use grid layout (rows/columns)
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

export interface SoundSettings {
  // Built-in sounds (can be replaced with .ogg files)
  lockInstance: string | null;
  lockInstanceReplace: boolean;
  resetInstance: string | null;
  resetInstanceReplace: boolean;
  // Custom sounds (require sounds.json)
  playInstance: string | null;
  resetAll: string | null;
  resetColumn: string | null;
  resetRow: string | null;
  startBenchmark: string | null;
  finishBenchmark: string | null;
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
  selectedArea: 'main' | 'locked' | 'preparing' | null;

  setResolution: (resolution: Resolution) => void;
  setLayout: (layout: WallLayout) => void;
  updateArea: (area: 'main' | 'locked' | 'preparing', updates: Partial<Area>) => void;
  setBackground: (background: Partial<BackgroundSettings>) => void;
  setPackInfo: (packInfo: Partial<PackInfo>) => void;
  setSounds: (sounds: Partial<SoundSettings>) => void;
  selectArea: (area: 'main' | 'locked' | 'preparing' | null) => void;
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

export const useWallStore = create<WallStore>((set) => ({
  resolution: defaultResolution,
  layout: defaultLayout,
  background: defaultBackground,
  packInfo: defaultPackInfo,
  sounds: defaultSounds,
  selectedArea: null,

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

  selectArea: (area) => set({ selectedArea: area }),

  resetToDefault: () =>
    set({
      resolution: defaultResolution,
      layout: defaultLayout,
      background: defaultBackground,
      packInfo: defaultPackInfo,
      sounds: defaultSounds,
      selectedArea: null,
    }),

  importData: (data) => set((state) => ({ ...state, ...data })),
}));
