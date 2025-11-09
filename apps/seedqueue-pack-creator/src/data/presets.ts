import { WallLayout } from '../store/useWallStore';

export interface LayoutPreset {
  name: string;
  layout: WallLayout;
}

// Presets are defined as ratios (0-1) for easy scaling
interface PresetRatio {
  name: string;
  main: {
    x: number;
    y: number;
    width: number;
    height: number;
    rows: number;
    columns: number;
  };
  locked: {
    x: number;
    y: number;
    width: number;
    height: number;
    rows: number;
    columns: number;
    show: boolean;
  };
  preparing: {
    x: number;
    y: number;
    width: number;
    height: number;
    rows: number;
    columns: number;
    show: boolean;
  };
}

const presetsRatio: PresetRatio[] = [
  {
    name: 'Default',
    main: {
      x: 0,
      y: 0,
      width: 0.85, // 85% of screen width
      height: 1.0, // 100% of screen height
      rows: 4,
      columns: 3,
    },
    locked: {
      x: 0.85, // Start where main ends (85%)
      y: 0,
      width: 0.15, // 15% of screen width
      height: 1.0, // 100% of screen height
      rows: 6,
      columns: 1,
      show: true,
    },
    preparing: {
      x: 0.792,
      y: 0,
      width: 0.208,
      height: 1.0,
      rows: 6,
      columns: 1,
      show: false,
    },
  },
  {
    name: 'Priffie',
    main: {
      x: 0.091,
      y: 0.028,
      width: 0.508,
      height: 0.944,
      rows: 3,
      columns: 2,
    },
    locked: {
      x: 0.635,
      y: 0.046,
      width: 0.318,
      height: 0.565,
      rows: 3,
      columns: 3,
      show: true,
    },
    preparing: {
      x: 0.018,
      y: 0.028,
      width: 0.068,
      height: 0.944,
      rows: 12,
      columns: 1,
      show: true,
    },
  },
  {
    name: 'Dummy',
    main: {
      x: 0.318,
      y: 0.659,
      width: 0.315,
      height: 0.338,
      rows: 2,
      columns: 2,
    },
    locked: {
      x: 0.85,
      y: 0.056,
      width: 0.117,
      height: 0.95,
      rows: 14,
      columns: 1,
      show: true,
    },
    preparing: {
      x: 0.125,
      y: 0.005,
      width: 0.7,
      height: 0.65,
      rows: 2,
      columns: 2,
      show: true,
    },
  },
];

export function scalePreset(
  preset: PresetRatio,
  screenWidth: number,
  screenHeight: number
): WallLayout {
  return {
    main: {
      x: Math.round(preset.main.x * screenWidth),
      y: Math.round(preset.main.y * screenHeight),
      width: Math.round(preset.main.width * screenWidth),
      height: Math.round(preset.main.height * screenHeight),
      rows: preset.main.rows,
      columns: preset.main.columns,
      useGrid: true,
      padding: 0,
    },
    locked: {
      x: Math.round(preset.locked.x * screenWidth),
      y: Math.round(preset.locked.y * screenHeight),
      width: Math.round(preset.locked.width * screenWidth),
      height: Math.round(preset.locked.height * screenHeight),
      rows: preset.locked.rows,
      columns: preset.locked.columns,
      show: preset.locked.show,
      useGrid: true,
      padding: 0,
    },
    preparing: {
      x: Math.round(preset.preparing.x * screenWidth),
      y: Math.round(preset.preparing.y * screenHeight),
      width: Math.round(preset.preparing.width * screenWidth),
      height: Math.round(preset.preparing.height * screenHeight),
      rows: preset.preparing.rows,
      columns: preset.preparing.columns,
      show: preset.preparing.show,
      useGrid: true,
      padding: 0,
    },
  };
}

export function getPresets(screenWidth: number, screenHeight: number): LayoutPreset[] {
  return presetsRatio.map((preset) => ({
    name: preset.name,
    layout: scalePreset(preset, screenWidth, screenHeight),
  }));
}

export { presetsRatio };
