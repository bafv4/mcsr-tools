import { create } from 'zustand';
import type {
  KeyConfig,
  StandardSettings,
  AHKRemap,
  KeyBinding,
  PhysicalKey,
  GameAction,
  MinecraftKey,
  DuplicateInputWarning,
} from '../types';

interface ConfigState {
  // Key configurations
  keyConfigs: Map<PhysicalKey, KeyConfig>;

  // StandardSettings configuration
  standardSettings: Partial<StandardSettings>;

  // Game settings (derived from standardSettings for easier access)
  gameSettings: Partial<StandardSettings>;

  // Duplicate input warnings
  duplicateWarnings: DuplicateInputWarning[];

  // Actions
  setKeyConfig: (physicalKey: PhysicalKey, config: Partial<KeyConfig>) => void;
  removeKeyConfig: (physicalKey: PhysicalKey) => void;
  setAHKRemap: (physicalKey: PhysicalKey, remap: AHKRemap | undefined) => void;
  setKeyBinding: (physicalKey: PhysicalKey, binding: KeyBinding | undefined) => void;
  updateStandardSettings: (settings: Partial<StandardSettings>) => void;
  updateGameSetting: <K extends keyof StandardSettings>(key: K, value: StandardSettings[K]) => void;
  detectDuplicateInputs: () => void;
  resetToDefault: () => void;
}

// Default StandardSettings values
const defaultStandardSettings: Partial<StandardSettings> = {
  '.apiVersion': '2.1+1.16.1',
  '.modVersion': '2.3+1.16.1',
  '.dataVersion': 0,
  fov: 95.0,
  realmsNotifications: false,
  fullscreenResolution: null,
  biomeBlendRadius: 0.0,
  graphicsMode: 1,
  renderDistance: 5.0,
  ao: 1,
  maxFps: 260.0,
  enableVsync: false,
  bobView: false,
  guiScale: {
    enabled: false,
    value: 6,
  },
  attackIndicator: 1,
  gamma: 5.0,
  renderClouds: 0,
  fullscreen: true,
  particles: 2,
  mipmapLevels: 4.0,
  entityShadows: false,
  entityDistanceScaling: 0.5,
  entityCulling: false,
  modelPart_cape: {
    enabled: false,
    value: true,
  },
  modelPart_jacket: true,
  modelPart_left_sleeve: true,
  modelPart_right_sleeve: true,
  modelPart_left_pants_leg: true,
  modelPart_right_pants_leg: true,
  modelPart_hat: true,
  mainHand: {
    enabled: false,
    value: 0,
  },
  soundCategory_master: 1.0,
  soundCategory_music: 0.0,
  soundCategory_record: 0.64,
  soundCategory_weather: 0.65,
  soundCategory_block: 0.86,
  soundCategory_hostile: 0.16,
  soundCategory_neutral: 0.49,
  soundCategory_player: 0.64,
  soundCategory_ambient: 0.0,
  soundCategory_voice: 0.0,
  showSubtitles: true,
  language: 'en_us',
  forceUnicodeFont: false,
  mouseSensitivity: 0.5,
  invertYMouse: false,
  mouseWheelSensitivity: 0.85,
  discrete_mouse_scroll: false,
  touchscreen: false,
  rawMouseInput: true,
  autoJump: false,
  chatVisibility: 0,
  chatColors: true,
  chatLinks: true,
  chatLinksPrompt: true,
  chatOpacity: 1.0,
  textBackgroundOpacity: 0.0,
  chatScale: 0.65,
  chatLineSpacing: 0.0,
  chatWidth: 0.77,
  chatHeightFocused: 1.0,
  chatHeightUnfocused: 0.44,
  narrator: 0,
  autoSuggestions: true,
  reducedDebugInfo: false,
  backgroundForChatOnly: 1,
  chatDelay: 0.0,
  toggleCrouch: 0,
  toggleSprint: 0,
  pauseOnLostFocus: true,
  advancedItemTooltips: false,
  hitboxes: false,
  chunkborders: true,
  pieDirectory: 'root.gameRenderer.level.entities',
  perspective: 0,
  f1: {
    enabled: false,
    value: false,
  },
  sneaking: {
    enabled: false,
    value: false,
  },
  sprinting: {
    enabled: false,
    value: false,
  },
  fovOnWorldJoin: {
    enabled: false,
    value: 90.0,
  },
  renderDistanceOnWorldJoin: {
    enabled: false,
    value: 5.0,
  },
  entityDistanceScalingOnWorldJoin: {
    enabled: false,
    value: 0.5,
  },
  guiScaleOnWorldJoin: {
    enabled: false,
    value: 5,
  },
  toggleStandardSettings: true,
  toggleAll: true,
  autoF3Esc: true,
  firstAutoF3EscDelay: 20,
  triggerOnResize: false,
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  keyConfigs: new Map(),
  standardSettings: { ...defaultStandardSettings },
  gameSettings: { ...defaultStandardSettings },
  duplicateWarnings: [],

  setKeyConfig: (physicalKey, config) => {
    set((state) => {
      const newConfigs = new Map(state.keyConfigs);
      const existing = newConfigs.get(physicalKey) || { physicalKey };
      newConfigs.set(physicalKey, { ...existing, ...config });
      return { keyConfigs: newConfigs };
    });
    get().detectDuplicateInputs();
  },

  removeKeyConfig: (physicalKey) => {
    set((state) => {
      const newConfigs = new Map(state.keyConfigs);
      newConfigs.delete(physicalKey);
      return { keyConfigs: newConfigs };
    });
    get().detectDuplicateInputs();
  },

  setAHKRemap: (physicalKey, remap) => {
    set((state) => {
      const newConfigs = new Map(state.keyConfigs);
      const existing = newConfigs.get(physicalKey) || { physicalKey };
      if (remap) {
        newConfigs.set(physicalKey, { ...existing, ahkRemap: remap });
      } else {
        const { ahkRemap, ...rest } = existing;
        if (Object.keys(rest).length === 1) {
          // Only physicalKey left, remove entire config
          newConfigs.delete(physicalKey);
        } else {
          newConfigs.set(physicalKey, rest as KeyConfig);
        }
      }
      return { keyConfigs: newConfigs };
    });
    get().detectDuplicateInputs();
  },

  setKeyBinding: (physicalKey, binding) => {
    set((state) => {
      const newConfigs = new Map(state.keyConfigs);
      const existing = newConfigs.get(physicalKey) || { physicalKey };
      if (binding) {
        newConfigs.set(physicalKey, { ...existing, binding });
      } else {
        const { binding: _, ...rest } = existing;
        if (Object.keys(rest).length === 1) {
          // Only physicalKey left, remove entire config
          newConfigs.delete(physicalKey);
        } else {
          newConfigs.set(physicalKey, rest as KeyConfig);
        }
      }
      return { keyConfigs: newConfigs };
    });
  },

  updateStandardSettings: (settings) => {
    set((state) => ({
      standardSettings: { ...state.standardSettings, ...settings },
      gameSettings: { ...state.gameSettings, ...settings },
    }));
  },

  updateGameSetting: (key, value) => {
    set((state) => ({
      gameSettings: { ...state.gameSettings, [key]: value },
      standardSettings: { ...state.standardSettings, [key]: value },
    }));
  },

  detectDuplicateInputs: () => {
    const { keyConfigs } = get();
    const inputMap = new Map<PhysicalKey, PhysicalKey[]>();

    // Get all physical keys that exist (including those not in keyConfigs)
    const allRemappedKeys = new Set<PhysicalKey>();
    keyConfigs.forEach((config) => {
      if (config.ahkRemap && !config.ahkRemap.disabled) {
        allRemappedKeys.add(config.physicalKey);
      }
    });

    // Build map of final input -> source keys
    // This includes:
    // 1. Keys that are remapped (A -> 6 means A produces "6")
    // 2. Keys that are NOT remapped and NOT disabled (W produces "W")
    keyConfigs.forEach((config) => {
      if (config.ahkRemap?.disabled) {
        // Disabled keys don't produce any input
        return;
      }

      const finalInput = config.ahkRemap?.to || config.physicalKey;
      const sources = inputMap.get(finalInput) || [];
      sources.push(config.physicalKey);
      inputMap.set(finalInput, sources);
    });

    // Also check for unmapped keys that might conflict with remap targets
    // For example: A->6 creates conflict if "6" key is not remapped to something else
    const remapTargets = new Set<PhysicalKey>();
    keyConfigs.forEach((config) => {
      if (config.ahkRemap?.to && !config.ahkRemap.disabled) {
        remapTargets.add(config.ahkRemap.to);
      }
    });

    // For each remap target, check if the original key exists and is not remapped
    remapTargets.forEach((target) => {
      const targetConfig = keyConfigs.get(target);
      const isTargetRemapped = targetConfig?.ahkRemap && !targetConfig.ahkRemap.disabled;
      const isTargetDisabled = targetConfig?.ahkRemap?.disabled;

      // If target key is not remapped and not disabled, it creates a duplicate
      if (!isTargetRemapped && !isTargetDisabled) {
        const sources = inputMap.get(target) || [];
        if (!sources.includes(target)) {
          sources.push(target); // Add the original key as a source
          inputMap.set(target, sources);
        }
      }
    });

    // Find duplicates (inputs produced by multiple keys)
    const warnings: DuplicateInputWarning[] = [];
    inputMap.forEach((sourceKeys, inputKey) => {
      if (sourceKeys.length > 1) {
        warnings.push({ inputKey, sourceKeys });
      }
    });

    set({ duplicateWarnings: warnings });
  },

  resetToDefault: () => {
    set({
      keyConfigs: new Map(),
      standardSettings: { ...defaultStandardSettings },
      gameSettings: { ...defaultStandardSettings },
      duplicateWarnings: [],
    });
  },
}));
