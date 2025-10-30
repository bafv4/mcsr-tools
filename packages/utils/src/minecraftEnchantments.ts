/**
 * Minecraft Enchantments (1.16.x)
 */

export interface EnchantmentInfo {
  name: string;          // Japanese name
  maxLevel: number;      // Maximum level
  applicableTo: ('sword' | 'tool' | 'armor' | 'bow' | 'crossbow' | 'trident' | 'helmet' | 'chestplate' | 'leggings' | 'boots')[];
}

export const ENCHANTMENTS: Record<string, EnchantmentInfo> = {
  // Weapon enchantments
  'minecraft:sharpness': { name: '鋭さ', maxLevel: 5, applicableTo: ['sword'] },
  'minecraft:smite': { name: 'アンデッド特効', maxLevel: 5, applicableTo: ['sword'] },
  'minecraft:bane_of_arthropods': { name: '虫特効', maxLevel: 5, applicableTo: ['sword'] },
  'minecraft:knockback': { name: 'ノックバック', maxLevel: 2, applicableTo: ['sword'] },
  'minecraft:fire_aspect': { name: '火属性', maxLevel: 2, applicableTo: ['sword'] },
  'minecraft:looting': { name: 'ドロップ増加', maxLevel: 3, applicableTo: ['sword'] },
  'minecraft:sweeping': { name: '範囲ダメージ増加', maxLevel: 3, applicableTo: ['sword'] },

  // Tool enchantments
  'minecraft:efficiency': { name: '効率強化', maxLevel: 5, applicableTo: ['tool'] },
  'minecraft:silk_touch': { name: 'シルクタッチ', maxLevel: 1, applicableTo: ['tool'] },
  'minecraft:fortune': { name: '幸運', maxLevel: 3, applicableTo: ['tool'] },

  // Armor enchantments
  'minecraft:protection': { name: 'ダメージ軽減', maxLevel: 4, applicableTo: ['armor'] },
  'minecraft:fire_protection': { name: '火炎耐性', maxLevel: 4, applicableTo: ['armor'] },
  'minecraft:blast_protection': { name: '爆発耐性', maxLevel: 4, applicableTo: ['armor'] },
  'minecraft:projectile_protection': { name: '飛び道具耐性', maxLevel: 4, applicableTo: ['armor'] },
  'minecraft:feather_falling': { name: '落下耐性', maxLevel: 4, applicableTo: ['boots'] },
  'minecraft:respiration': { name: '水中呼吸', maxLevel: 3, applicableTo: ['helmet'] },
  'minecraft:aqua_affinity': { name: '水中採掘', maxLevel: 1, applicableTo: ['helmet'] },
  'minecraft:thorns': { name: '棘の鎧', maxLevel: 3, applicableTo: ['armor'] },
  'minecraft:depth_strider': { name: '水中歩行', maxLevel: 3, applicableTo: ['boots'] },
  'minecraft:frost_walker': { name: '氷渡り', maxLevel: 2, applicableTo: ['boots'] },
  'minecraft:soul_speed': { name: 'ソウルスピード', maxLevel: 3, applicableTo: ['boots'] },

  // Bow enchantments
  'minecraft:power': { name: 'パワー', maxLevel: 5, applicableTo: ['bow'] },
  'minecraft:punch': { name: 'パンチ', maxLevel: 2, applicableTo: ['bow'] },
  'minecraft:flame': { name: 'フレイム', maxLevel: 1, applicableTo: ['bow'] },
  'minecraft:infinity': { name: '無限', maxLevel: 1, applicableTo: ['bow'] },

  // Crossbow enchantments
  'minecraft:quick_charge': { name: '高速装填', maxLevel: 3, applicableTo: ['crossbow'] },
  'minecraft:multishot': { name: '拡散', maxLevel: 1, applicableTo: ['crossbow'] },
  'minecraft:piercing': { name: '貫通', maxLevel: 4, applicableTo: ['crossbow'] },

  // Trident enchantments
  'minecraft:loyalty': { name: '忠誠', maxLevel: 3, applicableTo: ['trident'] },
  'minecraft:impaling': { name: '串刺し', maxLevel: 5, applicableTo: ['trident'] },
  'minecraft:riptide': { name: '激流', maxLevel: 3, applicableTo: ['trident'] },
  'minecraft:channeling': { name: '召雷', maxLevel: 1, applicableTo: ['trident'] },

  // Universal enchantments
  'minecraft:unbreaking': { name: '耐久力', maxLevel: 3, applicableTo: ['sword', 'tool', 'armor', 'bow', 'crossbow', 'trident'] },
  'minecraft:mending': { name: '修繕', maxLevel: 1, applicableTo: ['sword', 'tool', 'armor', 'bow', 'crossbow', 'trident'] },
  'minecraft:vanishing_curse': { name: '消滅の呪い', maxLevel: 1, applicableTo: ['sword', 'tool', 'armor', 'bow', 'crossbow', 'trident'] },

  // Armor curse
  'minecraft:binding_curse': { name: '束縛の呪い', maxLevel: 1, applicableTo: ['armor'] },
};

/**
 * Get enchantment info
 */
export function getEnchantmentInfo(enchantmentId: string): EnchantmentInfo | undefined {
  return ENCHANTMENTS[enchantmentId];
}

/**
 * Format enchantment display name (e.g., "鋭さ V")
 */
export function formatEnchantmentName(enchantmentId: string, level: number): string {
  const info = getEnchantmentInfo(enchantmentId);
  const name = info?.name || enchantmentId.replace('minecraft:', '');

  // Roman numerals for level
  const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const romanLevel = level <= 10 ? romanNumerals[level] : level.toString();

  return level > 1 ? `${name} ${romanLevel}` : name;
}

/**
 * Get all enchantments applicable to an item
 */
export function getApplicableEnchantments(itemId: string): string[] {
  const itemName = itemId.replace(/^minecraft:/, '');

  const results: string[] = [];

  for (const [enchId, info] of Object.entries(ENCHANTMENTS)) {
    // Check if enchantment applies to this item
    if (itemName.includes('sword') && info.applicableTo.includes('sword')) {
      results.push(enchId);
    } else if (
      (itemName.includes('pickaxe') || itemName.includes('axe') || itemName.includes('shovel') || itemName.includes('hoe')) &&
      info.applicableTo.includes('tool')
    ) {
      results.push(enchId);
    } else if (itemName.includes('bow') && info.applicableTo.includes('bow')) {
      results.push(enchId);
    } else if (itemName.includes('crossbow') && info.applicableTo.includes('crossbow')) {
      results.push(enchId);
    } else if (itemName.includes('trident') && info.applicableTo.includes('trident')) {
      results.push(enchId);
    } else if (itemName.includes('helmet') && (info.applicableTo.includes('armor') || info.applicableTo.includes('helmet'))) {
      results.push(enchId);
    } else if (itemName.includes('chestplate') && (info.applicableTo.includes('armor') || info.applicableTo.includes('chestplate'))) {
      results.push(enchId);
    } else if (itemName.includes('leggings') && (info.applicableTo.includes('armor') || info.applicableTo.includes('leggings'))) {
      results.push(enchId);
    } else if (itemName.includes('boots') && (info.applicableTo.includes('armor') || info.applicableTo.includes('boots'))) {
      results.push(enchId);
    }
  }

  return results;
}
