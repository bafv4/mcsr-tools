export interface MinecraftKey {
  key: string;
  name: string;
  category: 'movement' | 'gameplay' | 'inventory' | 'multiplayer' | 'misc';
}

export interface KeyBinding {
  [key: string]: string;
}
