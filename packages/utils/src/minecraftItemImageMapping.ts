/**
 * Maps Minecraft item IDs to their texture file paths
 * Handles special cases like beds, blocks, and items with complex textures
 */

// Special mapping for items that have different texture paths
const ITEM_TEXTURE_MAP: Record<string, string> = {
  // Beds - stored in bed/ subdirectory
  'minecraft:white_bed': 'bed/white.png',
  'minecraft:orange_bed': 'bed/orange.png',
  'minecraft:magenta_bed': 'bed/magenta.png',
  'minecraft:light_blue_bed': 'bed/light_blue.png',
  'minecraft:yellow_bed': 'bed/yellow.png',
  'minecraft:lime_bed': 'bed/lime.png',
  'minecraft:pink_bed': 'bed/pink.png',
  'minecraft:gray_bed': 'bed/gray.png',
  'minecraft:light_gray_bed': 'bed/light_gray.png',
  'minecraft:cyan_bed': 'bed/cyan.png',
  'minecraft:purple_bed': 'bed/purple.png',
  'minecraft:blue_bed': 'bed/blue.png',
  'minecraft:brown_bed': 'bed/brown.png',
  'minecraft:green_bed': 'bed/green.png',
  'minecraft:red_bed': 'bed/red.png',
  'minecraft:black_bed': 'bed/black.png',

  // Generic bed (defaults to white)
  'minecraft:bed': 'bed/white.png',

  // Blocks - stored in blocks/ subdirectory
  'minecraft:cobblestone': 'blocks/cobblestone.png',
  'minecraft:stone': 'blocks/stone.png',
  'minecraft:oak_planks': 'blocks/oak_planks.png',
  'minecraft:spruce_planks': 'blocks/spruce_planks.png',
  'minecraft:birch_planks': 'blocks/birch_planks.png',
  'minecraft:jungle_planks': 'blocks/jungle_planks.png',
  'minecraft:acacia_planks': 'blocks/acacia_planks.png',
  'minecraft:dark_oak_planks': 'blocks/dark_oak_planks.png',
  'minecraft:oak_log': 'blocks/oak_log.png',
  'minecraft:spruce_log': 'blocks/spruce_log.png',
  'minecraft:birch_log': 'blocks/birch_log.png',
  'minecraft:jungle_log': 'blocks/jungle_log.png',
  'minecraft:acacia_log': 'blocks/acacia_log.png',
  'minecraft:dark_oak_log': 'blocks/dark_oak_log.png',
  'minecraft:gravel': 'blocks/dirt.png', // Using dirt as placeholder
  'minecraft:sand': 'blocks/sand.png',
  'minecraft:dirt': 'blocks/dirt.png',
  'minecraft:netherrack': 'blocks/netherrack.png',
  'minecraft:soul_sand': 'blocks/soul_sand.png',
  'minecraft:soul_soil': 'blocks/soul_soil.png',
  'minecraft:basalt': 'blocks/basalt_side.png',
  'minecraft:blackstone': 'blocks/blackstone.png',
  'minecraft:gilded_blackstone': 'blocks/gilded_blackstone.png',
  'minecraft:magma_block': 'blocks/magma_cream.png', // Using magma_cream as placeholder
  'minecraft:obsidian': 'blocks/obsidian.png',
  'minecraft:crying_obsidian': 'blocks/crying_obsidian.png',
  'minecraft:end_stone': 'blocks/end_stone.png',
  'minecraft:glowstone': 'blocks/glowstone.png',
  'minecraft:nether_bricks': 'blocks/nether_bricks.png',
  'minecraft:nether_brick': 'nether_brick.png', // Item version
  'minecraft:crafting_table': 'blocks/crafting_table_front.png',
  'minecraft:oak_leaves': 'blocks/oak_leaves.png',
  'minecraft:spruce_leaves': 'blocks/spruce_leaves.png',
  'minecraft:birch_leaves': 'blocks/birch_leaves.png',
  'minecraft:jungle_leaves': 'blocks/jungle_leaves.png',
  'minecraft:acacia_leaves': 'blocks/acacia_leaves.png',
  'minecraft:dark_oak_leaves': 'blocks/dark_oak_leaves.png',
  'minecraft:white_wool': 'blocks/white_wool.png',
  'minecraft:barrel': 'blocks/barrel_side.png',
  'minecraft:coal_ore': 'blocks/coal_ore.png',
  'minecraft:iron_ore': 'blocks/iron_block.png', // Placeholder
  'minecraft:gold_ore': 'blocks/gold_block.png', // Placeholder
  'minecraft:diamond_ore': 'blocks/diamond_ore.png',
  'minecraft:diamond_block': 'blocks/diamond_block.png',
  'minecraft:iron_block': 'blocks/iron_block.png',
  'minecraft:gold_block': 'blocks/gold_block.png',
  'minecraft:warped_planks': 'blocks/warped_planks.png',
  'minecraft:crimson_planks': 'blocks/crimson_planks.png',
  'minecraft:nether_wart_block': 'blocks/nether_wart_block.png',
  'minecraft:warped_wart_block': 'blocks/warped_wart_block.png',

  // Shulker boxes - all use same base texture
  'minecraft:white_shulker_box': 'blocks/white_wool.png', // Placeholder
  'minecraft:orange_shulker_box': 'blocks/white_wool.png',
  'minecraft:magenta_shulker_box': 'blocks/white_wool.png',
  'minecraft:light_blue_shulker_box': 'blocks/white_wool.png',
  'minecraft:yellow_shulker_box': 'blocks/white_wool.png',
  'minecraft:lime_shulker_box': 'blocks/white_wool.png',
  'minecraft:pink_shulker_box': 'blocks/white_wool.png',
  'minecraft:gray_shulker_box': 'blocks/white_wool.png',
  'minecraft:light_gray_shulker_box': 'blocks/white_wool.png',
  'minecraft:cyan_shulker_box': 'blocks/white_wool.png',
  'minecraft:purple_shulker_box': 'blocks/white_wool.png',
  'minecraft:blue_shulker_box': 'blocks/white_wool.png',
  'minecraft:brown_shulker_box': 'blocks/white_wool.png',
  'minecraft:green_shulker_box': 'blocks/white_wool.png',
  'minecraft:red_shulker_box': 'blocks/white_wool.png',
  'minecraft:black_shulker_box': 'blocks/white_wool.png',

  // Chest variations
  'minecraft:chest': 'blocks/oak_planks.png', // Placeholder
  'minecraft:trapped_chest': 'blocks/oak_planks.png',

  // Compass has animated frames, use first frame
  'minecraft:compass': 'compass_00.png',

  // Crossbow states
  'minecraft:crossbow': 'crossbow_standby.png',

  // Potion (use base texture)
  'minecraft:potion': 'potion.png',
  'minecraft:splash_potion': 'splash_potion.png',
  'minecraft:lingering_potion': 'potion.png',
};

/**
 * Get the texture path for a Minecraft item
 * @param itemId - The Minecraft item ID (e.g., "minecraft:wooden_pickaxe")
 * @param basePath - The base path for textures (default: "/items/mc1.16_item_textures")
 * @returns The full path to the item texture
 */
export function getMinecraftItemTexturePath(itemId: string, basePath: string = '/items/mc1.16_item_textures'): string {
  // Check if there's a special mapping
  if (ITEM_TEXTURE_MAP[itemId]) {
    return `${basePath}/${ITEM_TEXTURE_MAP[itemId]}`;
  }

  // Default: extract item name and look for direct PNG file
  const itemName = itemId.replace('minecraft:', '');
  return `${basePath}/${itemName}.png`;
}
