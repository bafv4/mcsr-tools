export interface MinecraftKey {
  key: string;
  name: string;
  category: 'movement' | 'gameplay' | 'inventory' | 'multiplayer' | 'misc';
}

export interface KeyBinding {
  [key: string]: string;
}

// Minecraft Item Types
export type ItemCategory =
  | 'blocks'      // ブロック：設置可能なブロック型アイテム
  | 'tools'       // ツール：ツール+防具+実用品+戦闘+エンダーパール等
  | 'materials'   // 素材：素材系アイテム
  | 'food'        // 食料：食料+小麦+ポーション+鉄塊金塊
  | 'misc';       // その他：上記以外のアイテム

export interface MinecraftItem {
  id: string;              // "minecraft:wooden_pickaxe"
  name: string;            // Display name
  category: ItemCategory;
  stackSize?: number;      // Stack size (default: 64)
}
