import { parse, writeUncompressed } from 'prismarine-nbt';
import { Buffer } from 'buffer';
import { downloadFile } from '@mcsr-tools/utils';

export interface MinecraftItem {
  id: string;
  Count: number;
  tag?: any;
  Slot?: number;
}

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

/**
 * Parse NBT file and extract hotbar preset data
 */
export async function parseNBTFile(file: File): Promise<HotbarData> {
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

          const items: MinecraftItem[] = containerItems.map((item: any) => ({
            id: item.id?.value || '',
            Count: item.Count?.value || 1,
            Slot: item.Slot?.value,
            tag: item.tag?.value,
          }));

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

  return { presets };
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
  filename: string = 'hotbar.nbt'
): Promise<void> {
  // Group presets by slot number
  const slotMap = new Map<number, Preset[]>();

  hotbarData.presets.forEach((preset) => {
    const slot = preset.slot;
    if (!slotMap.has(slot)) {
      slotMap.set(slot, []);
    }
    slotMap.get(slot)!.push(preset);
  });

  // Build NBT structure
  const nbtValue: Record<string, any> = {};

  // Create all 9 slots
  for (let slotNum = 0; slotNum < 9; slotNum++) {
    const presetsInSlot = slotMap.get(slotNum) || [];

    if (presetsInSlot.length === 0) {
      // Empty slot - fill with air
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
    } else {
      // Slot with barrels (presets)
      const barrels = presetsInSlot.map((preset) => {
        // Build barrel items (containers)
        const barrelItems = preset.containers.map((container, containerIdx) => {
          // Build container items
          const containerItems = container.items.map((item) => ({
            Slot: { type: 'byte', value: item.Slot ?? 0 },
            id: { type: 'string', value: item.id },
            Count: { type: 'byte', value: item.Count },
            ...(item.tag ? { tag: { type: 'compound', value: item.tag } } : {})
          }));

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

      nbtValue[String(slotNum)] = {
        type: 'list',
        value: {
          type: 'compound',
          value: barrels
        }
      };
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
