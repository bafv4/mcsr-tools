import { MinecraftItemIcon, formatItemName } from '@mcsr-tools/mcitems';
import { isStackable, formatEnchantmentName } from '@mcsr-tools/utils';
import type { NBTItem } from '@mcsr-tools/types';
import { Tooltip } from './Tooltip';

interface ItemSlotProps {
  item?: NBTItem | null;
  selected?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  slotType?: 'normal' | 'armor' | 'offhand';
  armorType?: 'helmet' | 'chestplate' | 'leggings' | 'boots';
}

export function ItemSlot({ item, selected, onClick, onContextMenu, slotType = 'normal', armorType }: ItemSlotProps) {
  const isEmpty = !item || item.id === 'minecraft:air';

  // Check if item is stackable
  const itemIsStackable = item && isStackable(item.id);

  // Check if item has enchantments
  const hasEnchantments = item?.tag?.Enchantments && item.tag.Enchantments.length > 0;

  // Build tooltip content with enchantments
  const getTooltipContent = () => {
    if (!item || isEmpty) return null;

    return (
      <div className="text-left">
        <div className="font-semibold text-white text-base">{formatItemName(item.id)}</div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.id}</div>
        {hasEnchantments && (
          <div className="mt-2 text-xs text-purple-400 dark:text-purple-300">
            {item.tag!.Enchantments!.map((ench, i) => (
              <div key={i}>{formatEnchantmentName(ench.id, ench.lvl)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Get placeholder item ID for empty armor/offhand slots (from mc-assets)
  const getPlaceholderItemId = () => {
    if (slotType === 'armor' && armorType) {
      return `minecraft:empty_armor_slot_${armorType}`;
    }
    if (slotType === 'offhand') {
      return 'minecraft:empty_armor_slot_shield';
    }
    return null;
  };

  const placeholderItemId = getPlaceholderItemId();
  const tooltipContent = getTooltipContent();

  const slotButton = (
    <button
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(e);
      }}
      disabled={!onClick}
      className={`
        relative w-20 h-20 rounded-lg border-2 transition-all
        ${selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : hasEnchantments
            ? 'border-purple-400 dark:border-purple-500 bg-white dark:bg-gray-700'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
        }
        ${onClick ? 'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer' : 'cursor-default'}
        ${!onClick ? 'opacity-50' : ''}
      `}
    >
      {/* Empty slot placeholder with icon from mc-assets */}
      {isEmpty && placeholderItemId && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <MinecraftItemIcon
            itemId={placeholderItemId}
            size={48}
            showFallbackOnError={false}
          />
        </div>
      )}

      {/* Empty slot placeholder for normal slots */}
      {isEmpty && !placeholderItemId && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 text-secondary">
          <span className="text-3xl">+</span>
        </div>
      )}

      {/* Item content */}
      {!isEmpty && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Item icon */}
          <MinecraftItemIcon
            itemId={item.id}
            size={64}
            nbtData={item.tag}
          />

          {/* Item count - larger with text outline, show for stackable items even if count is 1 */}
          {itemIsStackable && (
            <div
              className="absolute bottom-0.5 right-0.5 text-xl font-bold text-white"
              style={{
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000'
              }}
            >
              {item.Count}
            </div>
          )}

          {/* Enchantment indicator - purple sparkle icon */}
          {hasEnchantments && (
            <div className="absolute top-0.5 right-0.5 text-purple-500">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="drop-shadow-md"
              >
                <path d="M8 0l1.5 5.5L15 8l-5.5 1.5L8 15l-1.5-5.5L1 8l5.5-1.5z" />
              </svg>
            </div>
          )}
        </div>
      )}
    </button>
  );

  return tooltipContent ? (
    <Tooltip content={tooltipContent}>{slotButton}</Tooltip>
  ) : (
    slotButton
  );
}
