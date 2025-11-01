import { read, write, NBTData } from 'nbtify';
import { downloadFile } from '@mcsr-tools/utils';
import type { NBTItem, Enchantment } from '@mcsr-tools/types';

export type MinecraftItem = NBTItem;

export interface Container {
  id: string;
  name?: string;
  items: MinecraftItem[];
}

export interface Preset {
  name: string;
  slot: number;
  containers: Container[];
}

export interface HotbarData {
  presets: Preset[];
}

export interface ParsedNBTResult {
  data: HotbarData;
  raw: NBTData;
}

/**
 * Parse NBT file and extract hotbar preset data
 */
export async function parseNBTFile(file: File): Promise<ParsedNBTResult> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { data: parsed } = await read(uint8Array);

  const presets: Preset[] = [];

  // Root structure: keys "0" to "8" for hotbar slots
  if (parsed && typeof parsed === 'object') {
    for (let slotNum = 0; slotNum < 9; slotNum++) {
      const slotKey = String(slotNum);
      const slotData = (parsed as any)[slotKey];

      if (!Array.isArray(slotData) || slotData.length === 0) continue;

      // Process ALL barrels in this slot (multiple presets are stored as array in slot 0)
      slotData.forEach((barrel: any) => {
        const barrelId = barrel?.id;

        // Skip empty slots (minecraft:air)
        if (barrelId === 'minecraft:air') return;

        // Only process barrels (skip shulker boxes, command blocks, etc.)
        if (barrelId !== 'minecraft:barrel') return;

        if (!barrel || !barrel.tag?.BlockEntityTag) return;

        const barrelTag = barrel.tag;
        const barrelName = barrelTag.display?.Name || `Preset ${slotNum + 1}`;
        const barrelItems = barrelTag.BlockEntityTag.Items || [];

        // Extract containers (chests, shulker boxes) from barrel
        const containers: Container[] = [];

        barrelItems.forEach((containerItem: any) => {
          const containerId = containerItem.id;
          if (!containerId) return;

          const containerTag = containerItem.tag;
          if (!containerTag?.BlockEntityTag?.Items) {
            // Simple item, not a container
            return;
          }

          const containerItems = containerTag.BlockEntityTag.Items;

          const items: MinecraftItem[] = containerItems.map((item: any) => {
            const baseItem: MinecraftItem = {
              id: item.id || '',
              Count: item.Count || 1,
              Slot: item.Slot,
            };

            // Parse tag if present
            if (item.tag) {
              const tag: any = {};

              // Parse Enchantments
              if (item.tag.Enchantments && Array.isArray(item.tag.Enchantments)) {
                tag.Enchantments = item.tag.Enchantments.map((ench: any) => ({
                  id: ench.id || '',
                  lvl: ench.lvl || 1,
                }));
              }

              // Parse Damage
              if (item.tag.Damage !== undefined) {
                tag.Damage = item.tag.Damage;
              }

              // Parse display
              if (item.tag.display) {
                tag.display = {};
                if (item.tag.display.Name !== undefined) {
                  tag.display.Name = item.tag.display.Name;
                }
              }

              // Copy any other tag properties
              for (const key in item.tag) {
                if (!['Enchantments', 'Damage', 'display'].includes(key)) {
                  tag[key] = item.tag[key];
                }
              }

              if (Object.keys(tag).length > 0) {
                baseItem.tag = tag;
              }
            }

            return baseItem;
          });

          containers.push({
            id: containerId,
            name: containerTag.display?.Name,
            items,
          });
        });

        if (containers.length > 0) {
          presets.push({
            name: parseJSONText(barrelName),
            slot: slotNum,
            containers,
          });
        }
      });
    }
  }

  return {
    data: { presets },
    raw: parsed as NBTData
  };
}

/**
 * Parse Minecraft JSON text format
 */
function parseJSONText(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return parsed.text || text;
  } catch {
    return text;
  }
}

/**
 * Convert hotbar data back to NBT format and export as file
 */
export async function exportNBTFile(
  hotbarData: HotbarData,
  rawNBTData: NBTData | null = null,
  filename: string = 'hotbar.nbt'
): Promise<void> {
  // If we have raw NBT data, use it as base and only update slot 0
  let nbtValue: Record<string, any>;

  if (rawNBTData && typeof rawNBTData === 'object') {
    // Clone the raw NBT structure
    nbtValue = JSON.parse(JSON.stringify(rawNBTData));
  } else {
    // Create new structure from scratch
    nbtValue = {};
  }

  // Group presets by slot number (we only edit slot 0)
  const slotMap = new Map<number, Preset[]>();

  hotbarData.presets.forEach((preset) => {
    const slot = preset.slot;
    if (!slotMap.has(slot)) {
      slotMap.set(slot, []);
    }
    slotMap.get(slot)!.push(preset);
  });

  // Only update slot 0 (edited preset), keep others unchanged
  for (let slotNum = 0; slotNum < 9; slotNum++) {
    // Skip if we're preserving raw data and this isn't slot 0
    if (rawNBTData && slotNum !== 0) {
      continue;
    }

    const presetsInSlot = slotMap.get(slotNum) || [];

    if (presetsInSlot.length === 0) {
      // Empty slot - only create if not using raw data
      if (!rawNBTData) {
        nbtValue[String(slotNum)] = Array(9).fill(null).map(() => ({
          id: 'minecraft:air',
          Count: 1,
          tag: {
            Charged: 0
          }
        }));
      }
    } else {
      // Slot with barrels (presets)
      // Build edited barrels
      const editedBarrels = presetsInSlot.map((preset) => {
        // Build barrel items (containers)
        const barrelItems = preset.containers.map((container, containerIdx) => {
          // Build container items
          const containerItems = container.items.map((item) => {
            const nbtItem: any = {
              Slot: item.Slot ?? 0,
              id: item.id,
              Count: item.Count,
            };

            // Build tag if present
            if (item.tag) {
              const tagValue: any = {};

              // Convert Enchantments
              if (item.tag.Enchantments && item.tag.Enchantments.length > 0) {
                tagValue.Enchantments = item.tag.Enchantments.map((ench: Enchantment) => ({
                  id: ench.id,
                  lvl: ench.lvl,
                }));
              }

              // Convert Damage
              if (item.tag.Damage !== undefined) {
                tagValue.Damage = item.tag.Damage;
              }

              // Convert display
              if (item.tag.display) {
                tagValue.display = {};
                if (item.tag.display.Name) {
                  tagValue.display.Name = item.tag.display.Name;
                }
              }

              // Copy any other tag properties
              for (const key in item.tag) {
                if (!['Enchantments', 'Damage', 'display'].includes(key)) {
                  tagValue[key] = (item.tag as any)[key];
                }
              }

              if (Object.keys(tagValue).length > 0) {
                nbtItem.tag = tagValue;
              }
            }

            return nbtItem;
          });

          return {
            Slot: containerIdx,
            id: container.id,
            Count: 1,
            tag: {
              BlockEntityTag: {
                Items: containerItems,
                id: container.id.includes('shulker') ? 'minecraft:shulker_box' : 'minecraft:chest'
              },
              display: {
                Lore: ['"(+NBT)"']
              }
            }
          };
        });

        // Build barrel NBT
        return {
          id: 'minecraft:barrel',
          Count: 1,
          tag: {
            RepairCost: 0,
            BlockEntityTag: {
              Items: barrelItems,
              id: 'minecraft:barrel',
              CustomName: preset.name
            },
            display: {
              Lore: ['"(+NBT)"'],
              Name: preset.name
            }
          }
        };
      });

      // If we have raw NBT data, preserve non-barrel items (shulker boxes, command blocks)
      if (rawNBTData && slotNum === 0) {
        const originalSlot0 = (rawNBTData as any)['0'];
        if (Array.isArray(originalSlot0)) {
          const originalItems = originalSlot0;

          // Keep non-barrel items (shulker boxes, command blocks, etc.)
          const preservedItems = originalItems.filter((item: any) => {
            const itemId = item?.id;
            return itemId !== 'minecraft:barrel' && itemId !== 'minecraft:air';
          });

          // Combine edited barrels with preserved items
          nbtValue[String(slotNum)] = [...editedBarrels, ...preservedItems];
        } else {
          // Fallback: just use edited barrels
          nbtValue[String(slotNum)] = editedBarrels;
        }
      } else {
        // Not preserving raw data, just use edited barrels
        nbtValue[String(slotNum)] = editedBarrels;
      }
    }
  }

  // Write NBT to buffer
  const buffer = await write(nbtValue, { rootName: '', compressed: false, bedrockLevel: null });

  // Download file
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  downloadFile(blob, filename);
}
