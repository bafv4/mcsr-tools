import { create } from 'zustand';
import { HotbarData, Preset, MinecraftItem } from '../utils/nbtParser';

interface HotbarStore extends HotbarData {
  selectedPreset: number | null;
  selectedContainer: number | null;
  selectedItem: { containerIndex: number; itemIndex: number } | null;

  // Actions
  setPresets: (presets: Preset[]) => void;
  selectPreset: (presetIndex: number) => void;
  selectContainer: (containerIndex: number) => void;
  selectItem: (containerIndex: number, itemIndex: number) => void;
  clearSelection: () => void;
  loadHotbar: (data: HotbarData) => void;
  updateItemBySlot: (presetIndex: number, containerIndex: number, slotIndex: number, item: MinecraftItem) => void;
  deleteItemBySlot: (presetIndex: number, containerIndex: number, slotIndex: number) => void;
  addItem: (presetIndex: number, containerIndex: number, item: MinecraftItem) => void;
  reset: () => void;
  // Legacy methods (kept for backward compatibility with InventoryView.tsx)
  updateItem: (presetIndex: number, containerIndex: number, itemIndex: number, item: MinecraftItem) => void;
  deleteItem: (presetIndex: number, containerIndex: number, itemIndex: number) => void;
}

const initialState: HotbarData = {
  presets: [],
};

export const useInventoryStore = create<HotbarStore>((set) => ({
  ...initialState,
  selectedPreset: null,
  selectedContainer: null,
  selectedItem: null,

  setPresets: (presets) =>
    set({ presets }),

  selectPreset: (presetIndex) =>
    set({ selectedPreset: presetIndex, selectedContainer: null, selectedItem: null }),

  selectContainer: (containerIndex) =>
    set({ selectedContainer: containerIndex, selectedItem: null }),

  selectItem: (containerIndex, itemIndex) =>
    set({ selectedItem: { containerIndex, itemIndex } }),

  clearSelection: () =>
    set({ selectedPreset: null, selectedContainer: null, selectedItem: null }),

  loadHotbar: (data) =>
    set({
      presets: data.presets,
      selectedPreset: data.presets.length > 0 ? 0 : null,
      selectedContainer: null,
      selectedItem: null,
    }),

  updateItemBySlot: (presetIndex, containerIndex, slotIndex, item) =>
    set((state) => {
      const newPresets = [...state.presets];
      const preset = newPresets[presetIndex];

      // Ensure container exists, create if it doesn't
      while (containerIndex >= preset.containers.length) {
        preset.containers.push({
          id: 'minecraft:chest',
          items: []
        });
      }

      const container = preset.containers[containerIndex];
      const itemIndex = container.items.findIndex(i => i.Slot === slotIndex);

      if (itemIndex !== -1) {
        // Update existing item
        container.items[itemIndex] = item;
      } else {
        // Add new item if not found
        container.items.push(item);
      }

      return { presets: newPresets };
    }),

  deleteItemBySlot: (presetIndex, containerIndex, slotIndex) =>
    set((state) => {
      const newPresets = [...state.presets];
      const container = newPresets[presetIndex].containers[containerIndex];
      const itemIndex = container.items.findIndex(i => i.Slot === slotIndex);

      if (itemIndex !== -1) {
        container.items.splice(itemIndex, 1);
      }

      return { presets: newPresets };
    }),

  addItem: (presetIndex, containerIndex, item) =>
    set((state) => {
      const newPresets = [...state.presets];
      newPresets[presetIndex].containers[containerIndex].items.push(item);
      return { presets: newPresets };
    }),

  // Legacy methods (kept for backward compatibility)
  updateItem: (presetIndex, containerIndex, itemIndex, item) =>
    set((state) => {
      const newPresets = [...state.presets];
      newPresets[presetIndex].containers[containerIndex].items[itemIndex] = item;
      return { presets: newPresets };
    }),

  deleteItem: (presetIndex, containerIndex, itemIndex) =>
    set((state) => {
      const newPresets = [...state.presets];
      newPresets[presetIndex].containers[containerIndex].items.splice(itemIndex, 1);
      return { presets: newPresets };
    }),

  reset: () =>
    set({
      ...initialState,
      selectedPreset: null,
      selectedContainer: null,
      selectedItem: null,
    }),
}));
