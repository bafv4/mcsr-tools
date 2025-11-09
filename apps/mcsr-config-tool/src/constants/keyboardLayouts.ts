import type { PhysicalKey } from '../types';

export interface KeyLayoutInfo {
  key: PhysicalKey;
  label: string; // Display label on key
  width?: number; // Width multiplier (default 1)
}

export type KeyboardLayoutType = 'us' | 'jis';

// US (EN) Keyboard Layout
export const usKeyboardLayout: KeyLayoutInfo[][] = [
  // Row 1: Function keys
  [
    { key: 'escape', label: 'Esc', width: 1 },
    { key: 'f1', label: 'F1' },
    { key: 'f2', label: 'F2' },
    { key: 'f3', label: 'F3' },
    { key: 'f4', label: 'F4' },
    { key: 'f5', label: 'F5' },
    { key: 'f6', label: 'F6' },
    { key: 'f7', label: 'F7' },
    { key: 'f8', label: 'F8' },
    { key: 'f9', label: 'F9' },
    { key: 'f10', label: 'F10' },
    { key: 'f11', label: 'F11' },
    { key: 'f12', label: 'F12' },
  ],
  // Row 2: Number row
  [
    { key: 'grave.accent', label: '`' },
    { key: '1', label: '1' },
    { key: '2', label: '2' },
    { key: '3', label: '3' },
    { key: '4', label: '4' },
    { key: '5', label: '5' },
    { key: '6', label: '6' },
    { key: '7', label: '7' },
    { key: '8', label: '8' },
    { key: '9', label: '9' },
    { key: '0', label: '0' },
    { key: 'minus', label: '-' },
    { key: 'equal', label: '=' },
    { key: 'backspace', label: 'Back', width: 2 },
  ],
  // Row 3: QWERTY
  [
    { key: 'tab', label: 'Tab', width: 1.5 },
    { key: 'q', label: 'Q' },
    { key: 'w', label: 'W' },
    { key: 'e', label: 'E' },
    { key: 'r', label: 'R' },
    { key: 't', label: 'T' },
    { key: 'y', label: 'Y' },
    { key: 'u', label: 'U' },
    { key: 'i', label: 'I' },
    { key: 'o', label: 'O' },
    { key: 'p', label: 'P' },
    { key: 'left.bracket', label: '[' },
    { key: 'right.bracket', label: ']' },
    { key: 'backslash', label: '\\', width: 1.5 },
  ],
  // Row 4: ASDF
  [
    { key: 'caps.lock', label: 'Caps', width: 1.75 },
    { key: 'a', label: 'A' },
    { key: 's', label: 'S' },
    { key: 'd', label: 'D' },
    { key: 'f', label: 'F' },
    { key: 'g', label: 'G' },
    { key: 'h', label: 'H' },
    { key: 'j', label: 'J' },
    { key: 'k', label: 'K' },
    { key: 'l', label: 'L' },
    { key: 'semicolon', label: ';' },
    { key: 'apostrophe', label: "'" },
    { key: 'enter', label: 'Enter', width: 2.25 },
  ],
  // Row 5: ZXCV
  [
    { key: 'left.shift', label: 'Shift', width: 2.25 },
    { key: 'z', label: 'Z' },
    { key: 'x', label: 'X' },
    { key: 'c', label: 'C' },
    { key: 'v', label: 'V' },
    { key: 'b', label: 'B' },
    { key: 'n', label: 'N' },
    { key: 'm', label: 'M' },
    { key: 'comma', label: ',' },
    { key: 'period', label: '.' },
    { key: 'slash', label: '/' },
    { key: 'right.shift', label: 'Shift', width: 2.75 },
  ],
  // Row 6: Bottom row
  [
    { key: 'left.control', label: 'Ctrl', width: 1.25 },
    { key: 'left.win', label: 'Win', width: 1.25 },
    { key: 'left.alt', label: 'Alt', width: 1.25 },
    { key: 'space', label: 'Space', width: 6.25 },
    { key: 'right.alt', label: 'Alt', width: 1.25 },
    { key: 'right.win', label: 'Win', width: 1.25 },
    { key: 'menu', label: 'Menu', width: 1.25 },
    { key: 'right.control', label: 'Ctrl', width: 1.25 },
  ],
];

// JIS Keyboard Layout
export const jisKeyboardLayout: KeyLayoutInfo[][] = [
  // Row 1: Function keys (same as US)
  [
    { key: 'escape', label: 'Esc', width: 1 },
    { key: 'f1', label: 'F1' },
    { key: 'f2', label: 'F2' },
    { key: 'f3', label: 'F3' },
    { key: 'f4', label: 'F4' },
    { key: 'f5', label: 'F5' },
    { key: 'f6', label: 'F6' },
    { key: 'f7', label: 'F7' },
    { key: 'f8', label: 'F8' },
    { key: 'f9', label: 'F9' },
    { key: 'f10', label: 'F10' },
    { key: 'f11', label: 'F11' },
    { key: 'f12', label: 'F12' },
  ],
  // Row 2: Number row
  [
    { key: 'grave.accent', label: '半/全', width: 1.2 },
    { key: '1', label: '1' },
    { key: '2', label: '2' },
    { key: '3', label: '3' },
    { key: '4', label: '4' },
    { key: '5', label: '5' },
    { key: '6', label: '6' },
    { key: '7', label: '7' },
    { key: '8', label: '8' },
    { key: '9', label: '9' },
    { key: '0', label: '0' },
    { key: 'minus', label: '-' },
    { key: 'equal', label: '^' },
    { key: 'backslash', label: '¥' },
    { key: 'backspace', label: 'Back', width: 1.3 },
  ],
  // Row 3: QWERTY
  [
    { key: 'tab', label: 'Tab', width: 1.5 },
    { key: 'q', label: 'Q' },
    { key: 'w', label: 'W' },
    { key: 'e', label: 'E' },
    { key: 'r', label: 'R' },
    { key: 't', label: 'T' },
    { key: 'y', label: 'Y' },
    { key: 'u', label: 'U' },
    { key: 'i', label: 'I' },
    { key: 'o', label: 'O' },
    { key: 'p', label: 'P' },
    { key: 'left.bracket', label: '@' },
    { key: 'right.bracket', label: '[' },
  ],
  // Row 4: ASDF
  [
    { key: 'caps.lock', label: 'Caps', width: 1.75 },
    { key: 'a', label: 'A' },
    { key: 's', label: 'S' },
    { key: 'd', label: 'D' },
    { key: 'f', label: 'F' },
    { key: 'g', label: 'G' },
    { key: 'h', label: 'H' },
    { key: 'j', label: 'J' },
    { key: 'k', label: 'K' },
    { key: 'l', label: 'L' },
    { key: 'semicolon', label: ';' },
    { key: 'apostrophe', label: ':' },
    { key: 'jis.bracket', label: ']' },
    { key: 'enter', label: 'Enter', width: 1.75 },
  ],
  // Row 5: ZXCV
  [
    { key: 'left.shift', label: 'Shift', width: 2.5 },
    { key: 'z', label: 'Z' },
    { key: 'x', label: 'X' },
    { key: 'c', label: 'C' },
    { key: 'v', label: 'V' },
    { key: 'b', label: 'B' },
    { key: 'n', label: 'N' },
    { key: 'm', label: 'M' },
    { key: 'comma', label: ',' },
    { key: 'period', label: '.' },
    { key: 'slash', label: '/' },
    { key: 'jis.underscore', label: '_' },
    { key: 'right.shift', label: 'Shift', width: 1.75 },
  ],
  // Row 6: Bottom row
  [
    { key: 'left.control', label: 'Ctrl', width: 1.25 },
    { key: 'left.win', label: 'Win', width: 1 },
    { key: 'left.alt', label: 'Alt', width: 1 },
    { key: 'jis.muhenkan', label: '無変換', width: 1.25 },
    { key: 'space', label: 'Space', width: 3 },
    { key: 'jis.henkan', label: '変換', width: 1.25 },
    { key: 'jis.katakana', label: 'カタカナ', width: 1.25 },
    { key: 'right.alt', label: 'Alt', width: 1 },
    { key: 'right.win', label: 'Win', width: 1 },
    { key: 'menu', label: 'Menu', width: 1 },
    { key: 'right.control', label: 'Ctrl', width: 1.25 },
  ],
];

// Navigation key cluster
export const navigationKeys: KeyLayoutInfo[][] = [
  [
    { key: 'insert', label: 'Ins' },
    { key: 'home', label: 'Home' },
    { key: 'page.up', label: 'PgUp' },
  ],
  [
    { key: 'delete', label: 'Del' },
    { key: 'end', label: 'End' },
    { key: 'page.down', label: 'PgDn' },
  ],
];

// Arrow keys
export const arrowKeys: KeyLayoutInfo[][] = [
  [
    { key: 'up', label: '↑' },
  ],
  [
    { key: 'left', label: '←' },
    { key: 'down', label: '↓' },
    { key: 'right', label: '→' },
  ],
];

// Numpad layout (optional)
export const numpadLayout: KeyLayoutInfo[][] = [
  [
    { key: 'numlock', label: 'Num' },
    { key: 'numpad.divide', label: '/' },
    { key: 'numpad.multiply', label: '*' },
    { key: 'numpad.subtract', label: '-' },
  ],
  [
    { key: 'numpad.7', label: '7' },
    { key: 'numpad.8', label: '8' },
    { key: 'numpad.9', label: '9' },
    { key: 'numpad.add', label: '+' },
  ],
  [
    { key: 'numpad.4', label: '4' },
    { key: 'numpad.5', label: '5' },
    { key: 'numpad.6', label: '6' },
  ],
  [
    { key: 'numpad.1', label: '1' },
    { key: 'numpad.2', label: '2' },
    { key: 'numpad.3', label: '3' },
    { key: 'numpad.enter', label: 'Enter' },
  ],
  [
    { key: 'numpad.0', label: '0', width: 2 },
    { key: 'numpad.decimal', label: '.' },
  ],
];

// Mouse buttons
export const mouseButtons: KeyLayoutInfo[] = [
  { key: 'mouse.left', label: 'Left Click' },
  { key: 'mouse.middle', label: 'Middle Click' },
  { key: 'mouse.right', label: 'Right Click' },
  { key: 'mouse.4', label: 'Mouse 4' },
  { key: 'mouse.5', label: 'Mouse 5' },
];

// Convert physical key to Minecraft key format
export function toMinecraftKey(physicalKey: PhysicalKey): string {
  if (physicalKey.startsWith('mouse.')) {
    return `key.${physicalKey}`;
  }
  return `key.keyboard.${physicalKey}`;
}

// Convert Minecraft key to physical key
export function fromMinecraftKey(minecraftKey: string): PhysicalKey {
  return minecraftKey.replace(/^key\.(keyboard\.|mouse\.)/, '');
}

// Get all available physical keys for remapping
export function getAllAvailableKeys(): { key: PhysicalKey; label: string; category: string }[] {
  const keys: { key: PhysicalKey; label: string; category: string }[] = [];

  // Add all keys from US layout
  usKeyboardLayout.forEach((row) => {
    row.forEach((keyInfo) => {
      keys.push({ key: keyInfo.key, label: keyInfo.label, category: 'Main Keyboard' });
    });
  });

  // Add JIS-specific keys
  const jisSpecificKeys = [
    'jis.bracket',
    'jis.underscore',
    'jis.muhenkan',
    'jis.henkan',
    'jis.katakana',
  ];
  jisKeyboardLayout.forEach((row) => {
    row.forEach((keyInfo) => {
      if (jisSpecificKeys.includes(keyInfo.key) && !keys.find((k) => k.key === keyInfo.key)) {
        keys.push({ key: keyInfo.key, label: keyInfo.label, category: 'JIS Keyboard' });
      }
    });
  });

  // Add navigation keys
  navigationKeys.forEach((row) => {
    row.forEach((keyInfo) => {
      keys.push({ key: keyInfo.key, label: keyInfo.label, category: 'Navigation' });
    });
  });

  // Add arrow keys
  arrowKeys.forEach((row) => {
    row.forEach((keyInfo) => {
      keys.push({ key: keyInfo.key, label: keyInfo.label, category: 'Arrow Keys' });
    });
  });

  // Add numpad keys
  numpadLayout.forEach((row) => {
    row.forEach((keyInfo) => {
      keys.push({ key: keyInfo.key, label: keyInfo.label, category: 'Numpad' });
    });
  });

  // Add F13-F24 keys
  for (let i = 13; i <= 24; i++) {
    keys.push({ key: `f${i}`, label: `F${i}`, category: 'Function Keys (Extended)' });
  }

  // Add mouse buttons
  mouseButtons.forEach((keyInfo) => {
    keys.push({ key: keyInfo.key, label: keyInfo.label, category: 'Mouse' });
  });

  return keys;
}
