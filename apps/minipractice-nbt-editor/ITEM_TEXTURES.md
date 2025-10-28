# アイテムテクスチャ（画像）の追加方法

現在、アイテムはテキストで表示されていますが、Minecraftのテクスチャ画像を追加することで、より視覚的なインベントリ表示が可能になります。

## 必要なもの

1. **Minecraftのアイテムテクスチャ**
   - Minecraft Java Editionからテクスチャを抽出
   - または、オープンソースのテクスチャパックを使用

## テクスチャの取得方法

### 方法1: Minecraftから抽出（推奨）

1. Minecraft Java Editionがインストールされている場合：
   ```
   .minecraft/versions/[バージョン]/[バージョン].jar
   ```

2. `.jar`ファイルを解凍ソフト（7-Zip等）で開く

3. アイテムテクスチャの場所：
   ```
   assets/minecraft/textures/item/
   ```

4. 必要な画像ファイル（PNG形式）を抽出

### 方法2: オープンソーステクスチャパック

著作権フリーのテクスチャパック：
- **Faithful** (https://faithfulpack.net/)
- **Pixel Perfection** (https://www.planetminecraft.com/texture-pack/pixel-perfection/)

## 実装手順

### ステップ1: テクスチャフォルダの作成

```
apps/minipractice-nbt-editor/public/textures/items/
```

### ステップ2: 画像ファイルの配置

抽出した画像を以下の命名規則で配置：
```
public/textures/items/iron_pickaxe.png
public/textures/items/diamond_sword.png
public/textures/items/cooked_beef.png
...
```

**重要**: ファイル名は`minecraft:`を除いたアイテムIDと同じにしてください。

### ステップ3: 画像表示機能の有効化

`src/components/ItemSlot.tsx`を以下のように更新：

```typescript
// 画像の読み込み
const getItemTexture = (itemId: string) => {
  const itemName = itemId.replace('minecraft:', '');
  return `/textures/items/${itemName}.png`;
};

// ItemSlotコンポーネント内
{!isEmpty && (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* アイテム画像 */}
    <img
      src={getItemTexture(item.id)}
      alt={formatItemName(item.id)}
      className="w-10 h-10 pixelated"
      onError={(e) => {
        // 画像が見つからない場合はテキスト表示にフォールバック
        e.currentTarget.style.display = 'none';
      }}
    />

    {/* フォールバックテキスト */}
    <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
      {/* 画像がない場合に表示 */}
    </div>

    {/* アイテム数 */}
    {item.Count > 1 && (
      <div className="absolute bottom-1 right-1 text-white text-xs font-bold">
        {item.Count}
      </div>
    )}
  </div>
)}
```

### ステップ4: CSSの追加

`src/index.css`に追加：

```css
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

## 必要なアイテムテクスチャリスト

よく使用されるアイテム（優先度順）：

### ツール類
- iron_pickaxe.png
- iron_axe.png
- iron_shovel.png
- iron_sword.png
- golden_pickaxe.png
- diamond_pickaxe.png
- flint_and_steel.png

### 食料
- cooked_cod.png
- cooked_salmon.png
- bread.png
- cooked_beef.png
- golden_apple.png

### ブロック
- dirt.png
- cobblestone.png
- netherrack.png
- obsidian.png
- chest.png

### 素材
- iron_ingot.png
- gold_ingot.png
- diamond.png
- ender_pearl.png
- blaze_rod.png

### 防具
- iron_helmet.png
- iron_chestplate.png
- iron_leggings.png
- iron_boots.png
- golden_helmet.png

### コンテナ
- chest.png
- white_shulker_box.png
- barrel.png

## 注意事項

- **著作権**: Minecraftのテクスチャは Mojang/Microsoft の著作物です
- **個人使用**: 抽出したテクスチャは個人使用のみに限定してください
- **再配布禁止**: このプロジェクトにテクスチャを含めて配布することはできません
- **オープンソーステクスチャ**: 商用利用可能なライセンスのテクスチャパックを使用することを推奨します

## 今後の実装予定

- [ ] テクスチャの自動ダウンロード機能
- [ ] テクスチャパックのZIPファイル読み込み
- [ ] カスタムテクスチャのアップロード機能
- [ ] アイテムのツールチップ表示
