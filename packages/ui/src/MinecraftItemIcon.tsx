import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from './lib/utils';

export interface MinecraftItemIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  itemId: string;
  size?: number;
  fallback?: React.ReactNode;
  showFallbackOnError?: boolean;
}

/**
 * Special filename mappings for items that don't follow the standard pattern
 * Key: minecraft item ID (without minecraft: prefix)
 * Value: Wiki CDN filename (without extension)
 */
const SPECIAL_FILENAME_MAPPINGS: Record<string, string> = {
  // Beds - all use Invicon_ prefix
  'white_bed': 'Invicon_White_Bed',
  'orange_bed': 'Invicon_Orange_Bed',
  'magenta_bed': 'Invicon_Magenta_Bed',
  'light_blue_bed': 'Invicon_Light_Blue_Bed',
  'yellow_bed': 'Invicon_Yellow_Bed',
  'lime_bed': 'Invicon_Lime_Bed',
  'pink_bed': 'Invicon_Pink_Bed',
  'gray_bed': 'Invicon_Gray_Bed',
  'light_gray_bed': 'Invicon_Light_Gray_Bed',
  'cyan_bed': 'Invicon_Cyan_Bed',
  'purple_bed': 'Invicon_Purple_Bed',
  'blue_bed': 'Invicon_Blue_Bed',
  'brown_bed': 'Invicon_Brown_Bed',
  'green_bed': 'Invicon_Green_Bed',
  'red_bed': 'Invicon_Red_Bed',
  'black_bed': 'Invicon_Black_Bed',

  // Blocks
  'magma_block': 'Invicon_Magma_Block',
  'tnt': 'Invicon_TNT',

  // Tools & Items
  'fire_charge': 'Invicon_Fire_Charge',
  'flint_and_steel': 'Invicon_Flint_and_Steel',

  // Food
  'golden_apple': 'Invicon_Golden_Apple',
  'cooked_porkchop': 'Invicon_Cooked_Porkchop',

  // Nether items
  'blaze_rod': 'Invicon_Blaze_Rod',
  'blaze_powder': 'Invicon_Blaze_Powder',
  'ender_pearl': 'Invicon_Ender_Pearl',
  'ender_eye': 'Invicon_Eye_of_Ender',

  // Potions (using Fire Resistance as default visual)
  'potion': 'Invicon_Potion_of_Fire_Resistance',
  'splash_potion': 'Invicon_Splash_Potion_of_Fire_Resistance',
  'lingering_potion': 'Invicon_Lingering_Potion_of_Fire_Resistance',

  // Minecarts
  'minecart': 'Invicon_Minecart',
  'chest_minecart': 'Invicon_Minecart_with_Chest',
  'furnace_minecart': 'Invicon_Minecart_with_Furnace',
  'tnt_minecart': 'Invicon_Minecart_with_TNT',
  'hopper_minecart': 'Invicon_Minecart_with_Hopper',
};

/**
 * Items that use .gif instead of .png
 */
const GIF_ITEMS = new Set([
  'magma_block',
  'sea_lantern',
  'prismarine',
  'prismarine_bricks',
  'dark_prismarine',
]);

/**
 * Convert Minecraft item ID to Wiki CDN filename
 * minecraft:crafting_table -> Invicon_Crafting_Table
 * minecraft:oak_planks -> Invicon_Oak_Planks
 */
function itemIdToWikiFilename(itemId: string): string {
  // Remove minecraft: prefix
  const itemName = itemId.replace(/^minecraft:/, '');

  // Check for special mapping first
  if (SPECIAL_FILENAME_MAPPINGS[itemName]) {
    return SPECIAL_FILENAME_MAPPINGS[itemName];
  }

  // Split by underscore and capitalize each word
  const words = itemName.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );

  // Most items use Invicon_ prefix
  return 'Invicon_' + words.join('_');
}

/**
 * Get file extension for an item
 */
function getFileExtension(itemId: string): string {
  const itemName = itemId.replace(/^minecraft:/, '');
  return GIF_ITEMS.has(itemName) ? '.gif' : '.png';
}

/**
 * Get Minecraft Wiki CDN URL for an item
 */
function getWikiImageUrl(itemId: string): string {
  const filename = itemIdToWikiFilename(itemId);
  const extension = getFileExtension(itemId);
  return `https://minecraft.wiki/images/${filename}${extension}`;
}

/**
 * Generate a unique color for an item based on its ID
 */
function getItemColor(itemId: string): string {
  const itemName = itemId.replace(/^minecraft:/, '');

  // Hash the item name to get a consistent color
  let hash = 0;
  for (let i = 0; i < itemName.length; i++) {
    hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hue (0-360)
  const hue = Math.abs(hash % 360);

  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Get emoji icon based on item category
 */
function getItemEmoji(itemId: string): string {
  const itemName = itemId.replace(/^minecraft:/, '');

  // Tools
  if (itemName.includes('pickaxe')) return '⛏️';
  if (itemName.includes('axe')) return '🪓';
  if (itemName.includes('shovel')) return '🏗️';
  if (itemName.includes('hoe')) return '🌾';
  if (itemName.includes('sword')) return '⚔️';

  // Armor
  if (itemName.includes('helmet')) return '🪖';
  if (itemName.includes('chestplate')) return '🦺';
  if (itemName.includes('leggings')) return '👖';
  if (itemName.includes('boots')) return '👢';

  // Food
  if (itemName.includes('apple')) return '🍎';
  if (itemName.includes('bread')) return '🍞';
  if (itemName.includes('meat') || itemName.includes('beef') || itemName.includes('porkchop')) return '🍖';
  if (itemName.includes('fish') || itemName.includes('cod') || itemName.includes('salmon')) return '🐟';
  if (itemName.includes('carrot')) return '🥕';
  if (itemName.includes('potato')) return '🥔';

  // Blocks
  if (itemName.includes('stone') || itemName.includes('cobblestone')) return '🪨';
  if (itemName.includes('wood') || itemName.includes('log') || itemName.includes('planks')) return '🪵';
  if (itemName.includes('glass')) return '🔲';
  if (itemName.includes('dirt') || itemName.includes('grass')) return '🟫';

  // Items
  if (itemName.includes('diamond')) return '💎';
  if (itemName.includes('emerald')) return '💚';
  if (itemName.includes('gold')) return '🟡';
  if (itemName.includes('iron')) return '⚙️';
  if (itemName.includes('book')) return '📖';
  if (itemName.includes('potion')) return '🧪';
  if (itemName.includes('bow')) return '🏹';
  if (itemName.includes('arrow')) return '➡️';
  if (itemName.includes('bed')) return '🛏️';
  if (itemName.includes('chest')) return '📦';
  if (itemName.includes('door')) return '🚪';
  if (itemName.includes('torch')) return '🔦';
  if (itemName.includes('bucket')) return '🪣';

  // Default
  return '📦';
}

/**
 * Alternative CDN sources to try if primary fails
 */
function getAlternativeUrls(itemId: string): string[] {
  const itemName = itemId.replace(/^minecraft:/, '');
  const baseFilename = itemIdToWikiFilename(itemId);
  const extension = getFileExtension(itemId);

  // Generate simple filename (without Invicon_ prefix)
  const words = itemName.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );
  const simpleFilename = words.join('_');

  return [
    // Try without Invicon_ prefix (for blocks and some items)
    `https://minecraft.wiki/images/${simpleFilename}${extension}`,
    // Try with Grid_ prefix (some items use this)
    `https://minecraft.wiki/images/Grid_${simpleFilename}${extension}`,
    // Try with .png if original was .gif
    extension === '.gif' ? `https://minecraft.wiki/images/${baseFilename}.png` : null,
    // Try with .gif if original was .png
    extension === '.png' ? `https://minecraft.wiki/images/${baseFilename}.gif` : null,
  ].filter(Boolean) as string[];
}

export function MinecraftItemIcon({
  itemId,
  size = 48,
  fallback,
  showFallbackOnError = true,
  className,
  ...props
}: MinecraftItemIconProps) {
  const [imageUrl, setImageUrl] = useState<string>(getWikiImageUrl(itemId));
  const [hasError, setHasError] = useState(false);
  const [alternativeIndex, setAlternativeIndex] = useState(-1);

  // Reset state when itemId changes
  useEffect(() => {
    setImageUrl(getWikiImageUrl(itemId));
    setHasError(false);
    setAlternativeIndex(-1);
  }, [itemId]);

  const handleError = () => {
    const alternatives = getAlternativeUrls(itemId);
    const nextIndex = alternativeIndex + 1;

    if (nextIndex < alternatives.length) {
      // Try next alternative URL
      setAlternativeIndex(nextIndex);
      setImageUrl(alternatives[nextIndex]);
    } else {
      // All alternatives failed
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  // Show fallback if error and fallback is enabled
  if (hasError && showFallbackOnError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default fallback: show unique colored box with emoji
    const color = getItemColor(itemId);
    const emoji = getItemEmoji(itemId);

    return (
      <div
        className={cn('flex items-center justify-center rounded border-2 border-gray-300 dark:border-gray-600', className)}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          fontSize: size * 0.5,
        }}
        title={itemId}
        {...props}
      >
        <span style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={itemId}
      className={cn('pixelated', className)}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        ...props.style,
      }}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
}
