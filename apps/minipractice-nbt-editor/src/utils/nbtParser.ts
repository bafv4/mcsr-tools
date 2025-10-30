import { parse, writeUncompressed } from 'prismarine-nbt';
import { Buffer } from 'buffer';
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
 * Parse NBT file and extract hotbar preset data
 */
export async function parseNBTFile(file: File): Promise<ParsedNBTResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { parsed } = await parse(buffer);

  const presets: Preset[] = [];

  // Root structure: keys "0" to "8" for hotbar slots
  if (parsed.value && typeof parsed.value === 'object') {
    for (let slotNum = 0; slotNum < 9; slotNum++) {
      const slotKey = String(slotNum);
      const slotData = (parsed.value as any)[slotKey];

      if (!slotData || slotData.type !== 'list') continue;

      const barrelList = slotData.value?.value;
      if (!Array.isArray(barrelList) || barrelList.length === 0) continue;

      // Process ALL barrels in this slot (multiple presets are stored as array in slot 0)
      barrelList.forEach((barrel: any) => {
        const barrelId = barrel?.id?.value;

        // Skip empty slots (minecraft:air)
        if (barrelId === 'minecraft:air') return;

        // Only process barrels (skip shulker boxes, command blocks, etc.)
        if (barrelId !== 'minecraft:barrel') return;

        if (!barrel || !barrel.tag?.value?.BlockEntityTag?.value) return;

        const barrelTag = barrel.tag.value;
        const barrelName = barrelTag.display?.value?.Name?.value || `Preset ${slotNum + 1}`;
        const barrelItems = barrelTag.BlockEntityTag.value.Items?.value?.value || [];

        // Extract containers (chests, shulker boxes) from barrel
        const containers: Container[] = [];

        barrelItems.forEach((containerItem: any) => {
          const containerId = containerItem.id?.value;
          if (!containerId) return;

          const containerTag = containerItem.tag?.value;
          if (!containerTag?.BlockEntityTag?.value?.Items?.value?.value) {
            // Simple item, not a container
            return;
          }

          const containerItems = containerTag.BlockEntityTag.value.Items.value.value;

          const items: MinecraftItem[] = containerItems.map((item: any) => {
            const baseItem: MinecraftItem = {
              id: item.id?.value || '',
              Count: item.Count?.value || 1,
              Slot: item.Slot?.value,
            };

            // Parse tag if present
            if (item.tag?.value) {
              const tag: any = {};

              // Parse Enchantments
              if (item.tag.value.Enchantments?.value?.value) {
                tag.Enchantments = item.tag.value.Enchantments.value.value.map((ench: any) => ({
                  id: ench.id?.value || '',
                  lvl: ench.lvl?.value || 1,
                }));
              }

              // Parse Damage
              if (item.tag.value.Damage !== undefined) {
                tag.Damage = item.tag.value.Damage.value;
              }

              // Parse display
              if (item.tag.value.display?.value) {
                tag.display = {};
                if (item.tag.value.display.value.Name !== undefined) {
                  tag.display.Name = item.tag.value.display.value.Name.value;
                }
              }

              // Copy any other tag properties
              for (const key in item.tag.value) {
                if (!['Enchantments', 'Damage', 'display'].includes(key)) {
                  tag[key] = item.tag.value[key];
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
            name: containerTag.display?.value?.Name?.value,
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
    raw: parsed
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
  rawNBTData: any | null = null,
  filename: string = 'hotbar.nbt'
): Promise<void> {
  // If we have raw NBT data, use it as base and only update slot 0
  let nbtValue: Record<string, any>;

  if (rawNBTData && rawNBTData.value && typeof rawNBTData.value === 'object') {
    // Clone the raw NBT structure
    nbtValue = JSON.parse(JSON.stringify(rawNBTData.value));
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
        nbtValue[String(slotNum)] = {
          type: 'list',
          value: {
            type: 'compound',
            value: Array(9).fill(null).map(() => ({
              id: { type: 'string', value: 'minecraft:air' },
              Count: { type: 'byte', value: 1 },
              tag: {
                type: 'compound',
                value: {
                  Charged: { type: 'byte', value: 0 }
                }
              }
            }))
          }
        };
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
              Slot: { type: 'byte', value: item.Slot ?? 0 },
              id: { type: 'string', value: item.id },
              Count: { type: 'byte', value: item.Count },
            };

            // Build tag if present
            if (item.tag) {
              const tagValue: any = {};

              // Convert Enchantments to NBT format
              if (item.tag.Enchantments && item.tag.Enchantments.length > 0) {
                tagValue.Enchantments = {
                  type: 'list',
                  value: {
                    type: 'compound',
                    value: item.tag.Enchantments.map((ench: Enchantment) => ({
                      id: { type: 'string', value: ench.id },
                      lvl: { type: 'short', value: ench.lvl },
                    })),
                  },
                };
              }

              // Convert Damage to NBT format
              if (item.tag.Damage !== undefined) {
                tagValue.Damage = { type: 'int', value: item.tag.Damage };
              }

              // Convert display to NBT format
              if (item.tag.display) {
                tagValue.display = {
                  type: 'compound',
                  value: {},
                };
                if (item.tag.display.Name) {
                  tagValue.display.value.Name = { type: 'string', value: item.tag.display.Name };
                }
              }

              // Copy any other tag properties
              for (const key in item.tag) {
                if (!['Enchantments', 'Damage', 'display'].includes(key)) {
                  tagValue[key] = (item.tag as any)[key];
                }
              }

              if (Object.keys(tagValue).length > 0) {
                nbtItem.tag = { type: 'compound', value: tagValue };
              }
            }

            return nbtItem;
          });

          return {
            Slot: { type: 'byte', value: containerIdx },
            id: { type: 'string', value: container.id },
            Count: { type: 'byte', value: 1 },
            tag: {
              type: 'compound',
              value: {
                BlockEntityTag: {
                  type: 'compound',
                  value: {
                    Items: {
                      type: 'list',
                      value: {
                        type: 'compound',
                        value: containerItems
                      }
                    },
                    id: {
                      type: 'string',
                      value: container.id.includes('shulker') ? 'minecraft:shulker_box' : 'minecraft:chest'
                    }
                  }
                },
                ...(container.name ? {
                  display: {
                    type: 'compound',
                    value: {
                      Lore: {
                        type: 'list',
                        value: {
                          type: 'string',
                          value: ['"(+NBT)"']
                        }
                      }
                    }
                  }
                } : {
                  display: {
                    type: 'compound',
                    value: {
                      Lore: {
                        type: 'list',
                        value: {
                          type: 'string',
                          value: ['"(+NBT)"']
                        }
                      }
                    }
                  }
                })
              }
            }
          };
        });

        // Build barrel NBT
        return {
          id: { type: 'string', value: 'minecraft:barrel' },
          Count: { type: 'byte', value: 1 },
          tag: {
            type: 'compound',
            value: {
              RepairCost: { type: 'int', value: 0 },
              BlockEntityTag: {
                type: 'compound',
                value: {
                  Items: {
                    type: 'list',
                    value: {
                      type: 'compound',
                      value: barrelItems
                    }
                  },
                  id: { type: 'string', value: 'minecraft:barrel' },
                  CustomName: { type: 'string', value: preset.name }
                }
              },
              display: {
                type: 'compound',
                value: {
                  Lore: {
                    type: 'list',
                    value: {
                      type: 'string',
                      value: ['"(+NBT)"']
                    }
                  },
                  Name: { type: 'string', value: preset.name }
                }
              }
            }
          }
        };
      });

      // If we have raw NBT data, preserve non-barrel items (shulker boxes, command blocks)
      if (rawNBTData && slotNum === 0) {
        const originalSlot0 = rawNBTData.value?.['0'];
        if (originalSlot0?.value?.value && Array.isArray(originalSlot0.value.value)) {
          const originalItems = originalSlot0.value.value;

          // Keep non-barrel items (shulker boxes, command blocks, etc.)
          const preservedItems = originalItems.filter((item: any) => {
            const itemId = item?.id?.value;
            return itemId !== 'minecraft:barrel' && itemId !== 'minecraft:air';
          });

          // Combine edited barrels with preserved items
          nbtValue[String(slotNum)] = {
            type: 'list',
            value: {
              type: 'compound',
              value: [...editedBarrels, ...preservedItems]
            }
          };
        } else {
          // Fallback: just use edited barrels
          nbtValue[String(slotNum)] = {
            type: 'list',
            value: {
              type: 'compound',
              value: editedBarrels
            }
          };
        }
      } else {
        // Not preserving raw data, just use edited barrels
        nbtValue[String(slotNum)] = {
          type: 'list',
          value: {
            type: 'compound',
            value: editedBarrels
          }
        };
      }
    }
  }

  const nbtData = {
    type: 'compound' as const,
    name: '',
    value: nbtValue
  };

  // Write NBT to buffer
  const buffer = writeUncompressed(nbtData as any, 'big');

  // Download file
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/octet-stream' });
  downloadFile(blob, filename);
}
