# リソースパックのインポート形式

## 概要

SeedQueue Pack Creatorは、標準的なMinecraftリソースパック形式（ZIP）と、本ツールで生成したカスタム設定を含むリソースパックの両方をインポートできます。

## サポートされるファイル構造

### 1. 基本的なMinecraftリソースパック

```
resource_pack.zip
├── pack.mcmeta          (必須) - パックのメタデータ
├── pack.png             (任意) - パックアイコン (64x64推奨)
└── assets/
    └── minecraft/
        └── textures/
            └── ...
```

**インポート結果:**
- `pack.mcmeta`からパック名と説明を読み込み
- `pack.png`をパックアイコンとして設定
- レイアウトと背景はデフォルト値を使用

### 2. 本ツールで生成したリソースパック（推奨）

```
resource_pack.zip
├── pack.mcmeta                      (必須)
├── pack.png                         (任意)
└── assets/
    └── seedqueue/
        ├── wall.json                (カスタム設定)
        └── background.png           (背景画像)
```

**`wall.json`の形式:**

```json
{
  "layout": {
    "main": {
      "x": 420,
      "y": 180,
      "width": 1080,
      "height": 720,
      "rows": 2,
      "columns": 2
    },
    "locked": {
      "x": 0,
      "y": 0,
      "width": 400,
      "height": 1080,
      "rows": 6,
      "columns": 1,
      "show": true
    },
    "preparing": {
      "x": 1520,
      "y": 0,
      "width": 400,
      "height": 1080,
      "rows": 6,
      "columns": 1,
      "show": true
    }
  },
  "resolution": {
    "width": 1920,
    "height": 1080
  },
  "background": {
    "type": "color",
    "color": "#1a1a1a",
    "imageBrightness": 100,
    "imageBlur": 0,
    "imageOffsetX": 0,
    "imageOffsetY": 0,
    "imageScale": 1,
    "gradientStart": "#1a1a1a",
    "gradientEnd": "#4a4a4a",
    "gradientDirection": "vertical"
  }
}
```

**インポート結果:**
- 全ての設定が完全に復元されます
- レイアウト、解像度、背景設定が読み込まれます
- `background.png`がある場合、背景画像として設定されます

## pack.mcmetaの形式

```json
{
  "pack": {
    "pack_format": 15,
    "description": "SeedQueue用リソースパック"
  }
}
```

**フィールド:**
- `pack_format`: Minecraftバージョンに対応する形式番号（本ツールは15を使用 - MC 1.20.x）
- `description`: パックの説明文

## 背景タイプの詳細

### `type: "color"` - 単色背景
```json
{
  "type": "color",
  "color": "#1a1a1a"
}
```

### `type: "image"` - 画像背景
```json
{
  "type": "image",
  "imageBrightness": 100,
  "imageBlur": 0,
  "imageOffsetX": 0,
  "imageOffsetY": 0,
  "imageScale": 1
}
```
- `imageBrightness`: 0-200 (100 = 元の明るさ)
- `imageBlur`: 0-20 (ぼかしピクセル数)
- `imageOffsetX/Y`: -500～500 (位置調整)
- `imageScale`: 0.5-2.0 (拡大率)

### `type: "gradient"` - グラデーション背景
```json
{
  "type": "gradient",
  "gradientStart": "#1a1a1a",
  "gradientEnd": "#4a4a4a",
  "gradientDirection": "vertical"
}
```
- `gradientDirection`: `"vertical"`, `"horizontal"`, `"diagonal"`, `"reverse-diagonal"`

## エリア設定の詳細

各エリア（main, locked, preparing）は以下のフィールドを持ちます：

```json
{
  "x": 420,           // X座標（ピクセル）
  "y": 180,           // Y座標（ピクセル）
  "width": 1080,      // 幅（ピクセル）
  "height": 720,      // 高さ（ピクセル）
  "rows": 2,          // グリッドの行数
  "columns": 2,       // グリッドの列数
  "show": true        // locked/preparingのみ: 表示/非表示
}
```

## インポート手順

1. ヘッダーの「インポート」ボタンをクリック
2. ZIPファイルを選択
3. 自動的に設定が読み込まれます
4. エラーが発生した場合、アラートで通知されます

## 注意事項

- ZIPファイルのみサポート（フォルダのアップロードは不可）
- `wall.json`が存在しない場合、デフォルト設定が使用されます
- 不正なJSON形式の場合、インポートは失敗します
- 画像ファイルは自動的にBase64エンコードされます

## トラブルシューティング

### インポートが失敗する場合

1. **ZIPファイルが破損していないか確認**
   - 別のツールで解凍できるか試す

2. **`pack.mcmeta`が存在するか確認**
   - 最低限このファイルが必要です

3. **`wall.json`のJSON形式が正しいか確認**
   - JSONバリデータで検証

4. **ブラウザのコンソールでエラーを確認**
   - F12キーで開発者ツールを開く
   - Consoleタブでエラーメッセージを確認

## エクスポート形式

本ツールは以下の構造でリソースパックをエクスポートします：

```
[パック名].zip
├── pack.mcmeta
├── pack.png (アイコンが設定されている場合)
└── assets/
    └── seedqueue/
        ├── wall.json
        └── background.png (背景が設定されている場合)
```

このエクスポートされたZIPファイルは、再度インポートして編集を続けることができます。
