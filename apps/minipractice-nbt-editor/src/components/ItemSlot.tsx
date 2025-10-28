import { formatItemName, getItemsByCategory, isStackable } from '@mcsr-tools/utils';
import { MinecraftItemIcon } from '@mcsr-tools/ui';

interface ItemSlotProps {
  item?: {
    id: string;
    Count: number;
    Slot?: number;
  } | null;
  selected?: boolean;
  onClick?: () => void;
  slotType?: 'normal' | 'armor' | 'offhand';
  armorType?: 'helmet' | 'chestplate' | 'leggings' | 'boots';
}

export function ItemSlot({ item, selected, onClick, slotType = 'normal', armorType }: ItemSlotProps) {
  const isEmpty = !item || item.id === 'minecraft:air';

  // Check if item is a block
  const isBlockItem = item && getItemsByCategory('blocks').includes(item.id);

  // Check if item is stackable
  const itemIsStackable = item && isStackable(item.id);

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

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        relative w-20 h-20 rounded-lg border-2 transition-all
        ${selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
        }
        ${onClick ? 'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer' : 'cursor-default'}
        ${!onClick ? 'opacity-50' : ''}
      `}
      title={item ? `${formatItemName(item.id)} x${item.Count}` : slotType === 'armor' ? `${armorType}` : 'Empty'}
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
          {/* Item icon - smaller for blocks */}
          <MinecraftItemIcon
            itemId={item.id}
            size={isBlockItem ? 48 : 64}
            fallback={
              <div className="text-[10px] font-medium text-primary text-center leading-tight p-1 overflow-hidden">
                <div className="line-clamp-2">
                  {formatItemName(item.id)}
                </div>
              </div>
            }
          />

          {/* Item count - larger with text outline, show for stackable items even if count is 1 */}
          {itemIsStackable && (
            <div
              className="absolute bottom-0.5 right-0.5 text-lg font-bold text-white"
              style={{
                textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000'
              }}
            >
              {item.Count}
            </div>
          )}
        </div>
      )}
    </button>
  );
}
