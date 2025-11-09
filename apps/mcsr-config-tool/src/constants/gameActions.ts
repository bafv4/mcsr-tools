import type { GameAction } from '../types';

export interface GameActionInfo {
  action: GameAction;
  label: string; // Japanese display name
  category: 'movement' | 'combat' | 'inventory' | 'hotbar' | 'ui' | 'other';
}

export const gameActions: GameActionInfo[] = [
  // Movement
  { action: 'key.forward', label: '前進', category: 'movement' },
  { action: 'key.back', label: '後退', category: 'movement' },
  { action: 'key.left', label: '左移動', category: 'movement' },
  { action: 'key.right', label: '右移動', category: 'movement' },
  { action: 'key.jump', label: 'ジャンプ', category: 'movement' },
  { action: 'key.sneak', label: 'スニーク', category: 'movement' },
  { action: 'key.sprint', label: 'ダッシュ', category: 'movement' },

  // Combat
  { action: 'key.attack', label: '攻撃', category: 'combat' },
  { action: 'key.use', label: '使用', category: 'combat' },
  { action: 'key.pickItem', label: 'ピック', category: 'combat' },

  // Inventory
  { action: 'key.inventory', label: 'インベントリ', category: 'inventory' },
  { action: 'key.swapOffhand', label: 'オフハンド入れ替え', category: 'inventory' },
  { action: 'key.drop', label: 'ドロップ', category: 'inventory' },

  // Hotbar
  { action: 'key.hotbar.1', label: 'ホットバー 1', category: 'hotbar' },
  { action: 'key.hotbar.2', label: 'ホットバー 2', category: 'hotbar' },
  { action: 'key.hotbar.3', label: 'ホットバー 3', category: 'hotbar' },
  { action: 'key.hotbar.4', label: 'ホットバー 4', category: 'hotbar' },
  { action: 'key.hotbar.5', label: 'ホットバー 5', category: 'hotbar' },
  { action: 'key.hotbar.6', label: 'ホットバー 6', category: 'hotbar' },
  { action: 'key.hotbar.7', label: 'ホットバー 7', category: 'hotbar' },
  { action: 'key.hotbar.8', label: 'ホットバー 8', category: 'hotbar' },
  { action: 'key.hotbar.9', label: 'ホットバー 9', category: 'hotbar' },
  { action: 'key.saveToolbarActivator', label: 'ツールバー保存', category: 'hotbar' },
  { action: 'key.loadToolbarActivator', label: 'ツールバー読込', category: 'hotbar' },

  // UI
  { action: 'key.chat', label: 'チャット', category: 'ui' },
  { action: 'key.command', label: 'コマンド', category: 'ui' },
  { action: 'key.playerlist', label: 'プレイヤー一覧', category: 'ui' },
  { action: 'key.screenshot', label: 'スクリーンショット', category: 'ui' },
  { action: 'key.fullscreen', label: 'フルスクリーン', category: 'ui' },
  { action: 'key.togglePerspective', label: '視点変更', category: 'ui' },
  { action: 'key.advancements', label: '進捗', category: 'ui' },
  { action: 'key.spectatorOutlines', label: 'スペクテーター枠線', category: 'ui' },
  { action: 'key.smoothCamera', label: 'スムーズカメラ', category: 'ui' },

  // Other
  { action: 'Create New World', label: '新規ワールド作成', category: 'other' },
  { action: 'speedrunigt.controls.start_timer', label: 'タイマー開始', category: 'other' },
  { action: 'speedrunigt.controls.stop_timer', label: 'タイマー停止', category: 'other' },
];

export const categoryLabels: Record<string, string> = {
  movement: '移動',
  combat: '戦闘',
  inventory: 'インベントリ',
  hotbar: 'ホットバー',
  ui: 'UI',
  other: 'その他',
};

export function getActionLabel(action: GameAction): string {
  const found = gameActions.find((a) => a.action === action);
  return found?.label || action;
}
