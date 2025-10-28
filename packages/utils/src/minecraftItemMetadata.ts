/**
 * Minecraft item metadata including stack sizes and equipment types
 */

export type ArmorType = 'helmet' | 'chestplate' | 'leggings' | 'boots';
export type EquipmentSlot = 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'offhand' | 'mainhand';

export interface ItemMetadata {
  maxStackSize: number;
  equipmentSlot?: EquipmentSlot;
  armorType?: ArmorType;
}

// Default stack size for most items
const DEFAULT_STACK_SIZE = 64;

// Items with special stack sizes
const STACK_SIZE_16 = [
  'minecraft:ender_pearl',
  'minecraft:snowball',
  'minecraft:egg',
];

const STACK_SIZE_1 = [
  // Tools
  'minecraft:wooden_pickaxe', 'minecraft:wooden_axe', 'minecraft:wooden_shovel', 'minecraft:wooden_sword', 'minecraft:wooden_hoe',
  'minecraft:stone_pickaxe', 'minecraft:stone_axe', 'minecraft:stone_shovel', 'minecraft:stone_sword', 'minecraft:stone_hoe',
  'minecraft:iron_pickaxe', 'minecraft:iron_axe', 'minecraft:iron_shovel', 'minecraft:iron_sword', 'minecraft:iron_hoe',
  'minecraft:golden_pickaxe', 'minecraft:golden_axe', 'minecraft:golden_shovel', 'minecraft:golden_sword', 'minecraft:golden_hoe',
  'minecraft:diamond_pickaxe', 'minecraft:diamond_axe', 'minecraft:diamond_shovel', 'minecraft:diamond_sword', 'minecraft:diamond_hoe',

  // Armor
  'minecraft:leather_helmet', 'minecraft:leather_chestplate', 'minecraft:leather_leggings', 'minecraft:leather_boots',
  'minecraft:iron_helmet', 'minecraft:iron_chestplate', 'minecraft:iron_leggings', 'minecraft:iron_boots',
  'minecraft:golden_helmet', 'minecraft:golden_chestplate', 'minecraft:golden_leggings', 'minecraft:golden_boots',
  'minecraft:diamond_helmet', 'minecraft:diamond_chestplate', 'minecraft:diamond_leggings', 'minecraft:diamond_boots',

  // Weapons & shields
  'minecraft:bow', 'minecraft:crossbow', 'minecraft:trident', 'minecraft:shield',

  // Special items
  'minecraft:flint_and_steel', 'minecraft:shears', 'minecraft:fishing_rod',
  'minecraft:bucket', 'minecraft:water_bucket', 'minecraft:lava_bucket', 'minecraft:milk_bucket',
  'minecraft:compass', 'minecraft:clock',

  // Food (cooked)
  'minecraft:mushroom_stew', 'minecraft:suspicious_stew',

  // Beds
  'minecraft:white_bed', 'minecraft:red_bed', 'minecraft:black_bed', 'minecraft:blue_bed',
  'minecraft:brown_bed', 'minecraft:cyan_bed', 'minecraft:gray_bed', 'minecraft:green_bed',
  'minecraft:light_blue_bed', 'minecraft:light_gray_bed', 'minecraft:lime_bed', 'minecraft:magenta_bed',
  'minecraft:orange_bed', 'minecraft:pink_bed', 'minecraft:purple_bed', 'minecraft:yellow_bed',
];

// Armor item mappings
const HELMET_ITEMS = [
  'minecraft:leather_helmet',
  'minecraft:iron_helmet',
  'minecraft:golden_helmet',
  'minecraft:diamond_helmet',
];

const CHESTPLATE_ITEMS = [
  'minecraft:leather_chestplate',
  'minecraft:iron_chestplate',
  'minecraft:golden_chestplate',
  'minecraft:diamond_chestplate',
];

const LEGGINGS_ITEMS = [
  'minecraft:leather_leggings',
  'minecraft:iron_leggings',
  'minecraft:golden_leggings',
  'minecraft:diamond_leggings',
];

const BOOTS_ITEMS = [
  'minecraft:leather_boots',
  'minecraft:iron_boots',
  'minecraft:golden_boots',
  'minecraft:diamond_boots',
];

/**
 * Get maximum stack size for an item
 */
export function getMaxStackSize(itemId: string): number {
  if (STACK_SIZE_1.includes(itemId)) {
    return 1;
  }
  if (STACK_SIZE_16.includes(itemId)) {
    return 16;
  }
  return DEFAULT_STACK_SIZE;
}

/**
 * Get armor type for an item
 */
export function getArmorType(itemId: string): ArmorType | undefined {
  if (HELMET_ITEMS.includes(itemId)) return 'helmet';
  if (CHESTPLATE_ITEMS.includes(itemId)) return 'chestplate';
  if (LEGGINGS_ITEMS.includes(itemId)) return 'leggings';
  if (BOOTS_ITEMS.includes(itemId)) return 'boots';
  return undefined;
}

/**
 * Check if an item can be equipped in a specific armor slot
 */
export function canEquipInSlot(itemId: string, slotType: ArmorType): boolean {
  const armorType = getArmorType(itemId);
  return armorType === slotType;
}

/**
 * Check if an item is stackable
 */
export function isStackable(itemId: string): boolean {
  return getMaxStackSize(itemId) > 1;
}

/**
 * Get all items that can be equipped in a specific slot
 */
export function getItemsForArmorSlot(slotType: ArmorType): string[] {
  switch (slotType) {
    case 'helmet':
      return HELMET_ITEMS;
    case 'chestplate':
      return CHESTPLATE_ITEMS;
    case 'leggings':
      return LEGGINGS_ITEMS;
    case 'boots':
      return BOOTS_ITEMS;
  }
}

/**
 * Get complete metadata for an item
 */
export function getItemMetadata(itemId: string): ItemMetadata {
  const maxStackSize = getMaxStackSize(itemId);
  const armorType = getArmorType(itemId);

  return {
    maxStackSize,
    armorType,
  };
}
