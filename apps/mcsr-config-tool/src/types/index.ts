// Physical keyboard key identifiers
export type PhysicalKey = string; // e.g., "a", "w", "space", "f3", etc.

// Minecraft key binding format
export type MinecraftKey = string; // e.g., "key.keyboard.a", "key.mouse.left"

// Game action identifiers
export type GameAction =
  | 'key.jump'
  | 'key.sneak'
  | 'key.sprint'
  | 'key.left'
  | 'key.right'
  | 'key.back'
  | 'key.forward'
  | 'key.attack'
  | 'key.pickItem'
  | 'key.use'
  | 'key.drop'
  | 'key.hotbar.1'
  | 'key.hotbar.2'
  | 'key.hotbar.3'
  | 'key.hotbar.4'
  | 'key.hotbar.5'
  | 'key.hotbar.6'
  | 'key.hotbar.7'
  | 'key.hotbar.8'
  | 'key.hotbar.9'
  | 'key.inventory'
  | 'key.swapOffhand'
  | 'key.loadToolbarActivator'
  | 'key.saveToolbarActivator'
  | 'key.playerlist'
  | 'key.chat'
  | 'key.command'
  | 'key.advancements'
  | 'key.spectatorOutlines'
  | 'key.screenshot'
  | 'key.smoothCamera'
  | 'key.fullscreen'
  | 'key.togglePerspective'
  | 'Create New World'
  | 'speedrunigt.controls.start_timer'
  | 'speedrunigt.controls.stop_timer';

// AHK remap configuration
export interface AHKRemap {
  from: PhysicalKey; // Physical key to remap from
  to: PhysicalKey | null; // Physical key to remap to (null = disable key)
  disabled?: boolean; // If true, key is disabled
}

// Key binding configuration
export interface KeyBinding {
  action: GameAction; // Game action
  key: MinecraftKey; // Minecraft key format
}

// Combined key configuration
export interface KeyConfig {
  physicalKey: PhysicalKey;
  ahkRemap?: AHKRemap; // AHK remap settings (optional)
  binding?: KeyBinding; // Game action binding (optional)
}

// StandardSettings enabled/value pattern
export interface EnabledValue<T> {
  enabled: boolean;
  value: T;
}

// StandardSettings configuration
export interface StandardSettings {
  // API metadata
  '.apiVersion': string;
  '.modVersion': string;
  '.dataVersion': number;

  // Video settings
  fov: number;
  realmsNotifications: boolean;
  fullscreenResolution: string | null;
  biomeBlendRadius: number;
  graphicsMode: number;
  renderDistance: number;
  ao: number;
  maxFps: number;
  enableVsync: boolean;
  bobView: boolean;
  guiScale: EnabledValue<number>;
  attackIndicator: number;
  gamma: number;
  renderClouds: number;
  fullscreen: boolean;
  particles: number;
  mipmapLevels: number;
  entityShadows: boolean;
  entityDistanceScaling: number;
  entityCulling: boolean;

  // Model parts
  modelPart_cape: EnabledValue<boolean>;
  modelPart_jacket: boolean;
  modelPart_left_sleeve: boolean;
  modelPart_right_sleeve: boolean;
  modelPart_left_pants_leg: boolean;
  modelPart_right_pants_leg: boolean;
  modelPart_hat: boolean;
  mainHand: EnabledValue<number>;

  // Sound settings
  soundCategory_master: number;
  soundCategory_music: number;
  soundCategory_record: number;
  soundCategory_weather: number;
  soundCategory_block: number;
  soundCategory_hostile: number;
  soundCategory_neutral: number;
  soundCategory_player: number;
  soundCategory_ambient: number;
  soundCategory_voice: number;
  showSubtitles: boolean;

  // Language & input
  language: string;
  forceUnicodeFont: boolean;
  mouseSensitivity: number;
  invertYMouse: boolean;
  mouseWheelSensitivity: number;
  discrete_mouse_scroll: boolean;
  touchscreen: boolean;
  rawMouseInput: boolean;
  autoJump: boolean;

  // Key bindings (dynamic)
  [key: `key_${GameAction}`]: MinecraftKey;

  // Chat settings
  chatVisibility: number;
  chatColors: boolean;
  chatLinks: boolean;
  chatLinksPrompt: boolean;
  chatOpacity: number;
  textBackgroundOpacity: number;
  chatScale: number;
  chatLineSpacing: number;
  chatWidth: number;
  chatHeightFocused: number;
  chatHeightUnfocused: number;
  narrator: number;
  autoSuggestions: boolean;

  // Debug settings
  reducedDebugInfo: boolean;
  backgroundForChatOnly: number;
  chatDelay: number;
  toggleCrouch: number;
  toggleSprint: number;
  pauseOnLostFocus: boolean;
  advancedItemTooltips: boolean;
  hitboxes: boolean;
  chunkborders: boolean;
  pieDirectory: string;
  perspective: number;

  // F3 settings
  f1: EnabledValue<boolean>;
  sneaking: EnabledValue<boolean>;
  sprinting: EnabledValue<boolean>;
  fovOnWorldJoin: EnabledValue<number>;
  renderDistanceOnWorldJoin: EnabledValue<number>;
  entityDistanceScalingOnWorldJoin: EnabledValue<number>;
  guiScaleOnWorldJoin: EnabledValue<number>;

  // StandardSettings mod features
  toggleStandardSettings: boolean;
  toggleAll: boolean;
  autoF3Esc: boolean;
  firstAutoF3EscDelay: number;
  triggerOnResize: boolean;
}

// Duplicate input warning
export interface DuplicateInputWarning {
  inputKey: PhysicalKey; // The resulting input key
  sourceKeys: PhysicalKey[]; // Physical keys that produce this input
}
