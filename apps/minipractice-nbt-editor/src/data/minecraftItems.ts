// Re-export from utils package (which contains the full item list)
export { MINECRAFT_ITEMS, getItemsByCategory, getAllItems } from '@mcsr-tools/utils';
export type { ItemCategory } from '@mcsr-tools/types';

import { getAllItems, getJapaneseName } from '@mcsr-tools/utils';

// Category definitions for the UI (based on Minecraft 1.16 Creative Inventory tabs)
export const ITEM_CATEGORIES = [
  { id: 'all', name: 'すべて' },
  { id: 'building_blocks', name: '建築ブロック' },
  { id: 'decorations', name: '装飾ブロック' },
  { id: 'redstone', name: 'レッドストーン' },
  { id: 'transportation', name: '交通' },
  { id: 'miscellaneous', name: '雑貨' },
  { id: 'foodstuffs', name: '食料' },
  { id: 'tools', name: '道具' },
  { id: 'combat', name: '戦闘' },
  { id: 'brewing', name: '醸造' },
] as const;

export function searchItems(query: string): string[] {
  if (!query) return getAllItems();
  const lowerQuery = query.toLowerCase();

  return getAllItems().filter((item: string) => {
    // Search by item ID (with and without minecraft: prefix)
    if (item.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search by item ID without prefix (e.g., "diamond_sword")
    const itemName = item.replace(/^minecraft:/, '');
    if (itemName.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search by Japanese name
    const japaneseName = getJapaneseName(item);
    if (japaneseName && japaneseName.includes(query)) {
      return true;
    }

    return false;
  });
}

export function formatItemName(itemId: string): string {
  // Try to get Japanese name first
  const japaneseName = getJapaneseName(itemId);
  if (japaneseName) {
    return japaneseName;
  }

  // Fallback to English formatted name
  return itemId
    .replace('minecraft:', '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
