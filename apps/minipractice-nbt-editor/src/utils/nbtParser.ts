import { read, write } from 'nbtify';
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
  raw: any;
}

/**
 * Convert NBT typed values to plain JavaScript values recursively
 */
function nbtToPlain(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle primitive types
  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  // Handle NBT typed numbers (Int8, Int16, Int32, Float, Double, etc.)
  if (typeof value === 'number') {
    return value;
  }

  // Check if it's a typed number object
  if (typeof value === 'object' && value.constructor) {
    const constructorName = value.constructor.name;
    if (constructorName.includes('Int') || constructorName.includes('Float') || constructorName.includes('Double')) {
      return Number(value);
    }
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(nbtToPlain);
  }

  // Handle objects
  if (typeof value === 'object') {
    const result: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = nbtToPlain(value[key]);
      }
    }
    return result;
  }

  return value;
}

/**
 * Parse Minecraft JSON text format
 */
function parseJSONText(text: string): string {
  if (!text) return '';

  try {
    const parsed = JSON.parse(text);
    return parsed.text || text;
  } catch {
    return text;
  }
}

/**
 * Parse NBT file and extract hotbar preset data
 */
export async function parseNBTFile(file: File): Promise<ParsedNBTResult> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { data: parsed } = await read(uint8Array);

  // Convert NBT types to plain JavaScript values
  const plainData = nbtToPlain(parsed);

  console.log('Plain NBT data:', plainData);

  const presets: Preset[] = [];

  // Root structure: keys "0" to "8" for hotbar slots
  if (plainData && typeof plainData === 'object') {
    for (let slotNum = 0; slotNum < 9; slotNum++) {
      const slotKey = String(slotNum);
      const slotData = plainData[slotKey];

      if (!Array.isArray(slotData) || slotData.length === 0) continue;

      // Process ALL barrels in this slot (multiple presets are stored as array in slot 0)
      slotData.forEach((barrel: any) => {
        if (!barrel || typeof barrel !== 'object') return;

        const barrelId = barrel.id;

        // Skip empty slots (minecraft:air)
        if (barrelId === 'minecraft:air') return;

        // Only process barrels (skip shulker boxes, command blocks, etc.)
        if (barrelId !== 'minecraft:barrel') return;

        const barrelTag = barrel.tag;
        if (!barrelTag || !barrelTag.BlockEntityTag) return;

        const barrelName = barrelTag.display?.Name || `Preset ${slotNum + 1}`;
        const barrelItems = barrelTag.BlockEntityTag.Items || [];

        // Extract containers (chests, shulker boxes) from barrel
        const containers: Container[] = [];

        barrelItems.forEach((containerItem: any) => {
          if (!containerItem || typeof containerItem !== 'object') return;

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
              Count: Number(item.Count) || 1,
              Slot: item.Slot !== undefined ? Number(item.Slot) : undefined,
            };

            // Parse tag if present
            if (item.tag) {
              const tag: any = {};

              // Parse Enchantments
              if (item.tag.Enchantments && Array.isArray(item.tag.Enchantments)) {
                tag.Enchantments = item.tag.Enchantments.map((ench: any) => ({
                  id: ench.id || '',
                  lvl: Number(ench.lvl) || 1,
                }));
              }

              // Parse Damage
              if (item.tag.Damage !== undefined) {
                tag.Damage = Number(item.tag.Damage);
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

  console.log('Parsed presets:', presets);

  return {
    data: { presets },
    raw: plainData
  };
}

/**
 * Convert hotbar data back to NBT format and export as file
 */
export async function exportNBTFile(
  hotbarData: HotbarData,
  rawNBTData: any | null = null,
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

    // Initialize all 9 slots with empty arrays
    for (let i = 0; i < 9; i++) {
      nbtValue[String(i)] = Array(9).fill({
        id: 'minecraft:air',
        Count: 1,
        tag: { Charged: 0 }
      });
    }
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
  const presetsInSlot0 = slotMap.get(0) || [];

  if (presetsInSlot0.length > 0) {
    // Build edited barrels for slot 0
    const editedBarrels = presetsInSlot0.map((preset) => {
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
    if (rawNBTData) {
      const originalSlot0 = rawNBTData['0'];
      if (Array.isArray(originalSlot0)) {
        // Keep non-barrel items (shulker boxes, command blocks, etc.)
        const preservedItems = originalSlot0.filter((item: any) => {
          const itemId = item?.id;
          return itemId !== 'minecraft:barrel' && itemId !== 'minecraft:air';
        });

        // Combine edited barrels with preserved items
        nbtValue['0'] = [...editedBarrels, ...preservedItems];
      } else {
        // Fallback: just use edited barrels
        nbtValue['0'] = editedBarrels;
      }
    } else {
      // Not preserving raw data, just use edited barrels
      nbtValue['0'] = editedBarrels;
    }
  }

  console.log('Exporting NBT data:', nbtValue);

  // Write NBT to buffer
  const buffer = await write(nbtValue, { rootName: '' });

  // Download file
  const blob = new Blob([buffer as BlobPart], { type: 'application/octet-stream' });
  downloadFile(blob, filename);
}
