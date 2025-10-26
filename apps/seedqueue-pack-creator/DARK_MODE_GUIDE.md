# ダークモード スタイルガイド

このプロジェクトでは、Tailwind CSSの `@apply` ディレクティブを使用して、ダークモードのスタイルを一元管理しています。

## 実装アーキテクチャ

### 1. CSSルールファイル (`src/index.css`)

すべてのダークモード対応スタイルは `src/index.css` の `@layer components` セクションで定義されています。

```css
@layer components {
  /* カスタムクラスの定義 */
  .bg-app {
    @apply bg-gray-50 dark:bg-gray-900;
  }

  .text-primary {
    @apply text-gray-900 dark:text-white;
  }
  /* ... その他のクラス */
}
```

### 2. システム設定への追従

`index.html` の `<head>` セクションに、システムのダークモード設定を自動検出するスクリプトが含まれています：

```javascript
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}
```

### 3. Tailwind設定 (`tailwind.config.js`)

```javascript
export default {
  darkMode: 'class',  // クラスベースのダークモード
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', 'sans-serif'],
      },
    },
  },
};
```

## 利用可能なカスタムクラス

### 背景色

| クラス名 | 用途 | ライトモード | ダークモード |
|---------|------|------------|------------|
| `.bg-app` | アプリ全体の背景 | `bg-gray-50` | `bg-gray-900` |
| `.bg-card` | カード・パネルの背景 | `bg-white` | `bg-gray-800` |
| `.bg-card-nested` | ネストされたカードの背景 | `bg-white` | `bg-gray-750` |

### テキスト色

| クラス名 | 用途 | ライトモード | ダークモード |
|---------|------|------------|------------|
| `.text-primary` | 主要なテキスト | `text-gray-900` | `text-white` |
| `.text-secondary` | 補助的なテキスト | `text-gray-600` | `text-gray-400` |
| `.text-tertiary` | さらに低い優先度のテキスト | `text-gray-500` | `text-gray-400` |
| `.text-muted` | ミュートされたテキスト | `text-gray-700` | `text-gray-300` |

### ボーダー

| クラス名 | 用途 | ライトモード | ダークモード |
|---------|------|------------|------------|
| `.border-default` | 標準のボーダー | `border-gray-300` | `border-gray-600` |
| `.border-light` | 軽いボーダー | `border-gray-200` | `border-gray-700` |

### フォーム要素

| クラス名 | 用途 |
|---------|------|
| `.input-base` | 入力フィールドの基本スタイル |
| `.label-base` | ラベルの基本スタイル |
| `.select-base` | セレクトボックスの基本スタイル |
| `.error-text` | エラーメッセージのテキスト |

### ボタン

| クラス名 | 用途 |
|---------|------|
| `.btn-primary` | プライマリボタン |
| `.btn-secondary` | セカンダリボタン |
| `.btn-outline` | アウトラインボタン |
| `.btn-ghost` | ゴーストボタン |

### タブ

| クラス名 | 用途 |
|---------|------|
| `.tabs-list` | タブリスト全体 |
| `.tab-trigger` | タブトリガーの基本スタイル |
| `.tab-trigger-active` | アクティブなタブ |
| `.tab-trigger-inactive` | 非アクティブなタブ |

### スイッチ

| クラス名 | 用途 |
|---------|------|
| `.switch-bg` | スイッチの背景 |
| `.switch-bg-checked` | チェック状態の背景 |
| `.switch-bg-unchecked` | 非チェック状態の背景 |
| `.switch-thumb` | スイッチのつまみ |

### その他

| クラス名 | 用途 |
|---------|------|
| `.card` | カードコンポーネント |
| `.card-border` | ボーダー付きカード |
| `.info-box` | 情報ボックス |
| `.info-title` | 情報ボックスのタイトル |
| `.info-text` | 情報ボックスのテキスト |
| `.color-preview` | カラーピッカーのプレビュー |
| `.status-success` | 成功ステータステキスト |
| `.image-preview` | 画像プレビュー（フルサイズ） |
| `.image-preview-small` | 画像プレビュー（小サイズ） |

## 使用例

### Before（個別にクラスを指定）

```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
  <h1 className="text-gray-900 dark:text-white font-bold">Title</h1>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### After（カスタムクラスを使用）

```tsx
<div className="card">
  <h1 className="text-primary font-bold">Title</h1>
  <p className="text-secondary">Description</p>
</div>
```

## 新しいコンポーネントを追加する場合

1. **既存のカスタムクラスを確認**: `src/index.css` に適切なクラスが既に存在するか確認

2. **既存のクラスを使用**: 可能な限り、既存のカスタムクラスを使用してください

3. **新しいパターンの場合**: 新しいパターンが必要な場合は、`src/index.css` の `@layer components` セクションに追加してください

```css
@layer components {
  .your-new-class {
    @apply bg-white dark:bg-gray-800 text-gray-900 dark:text-white;
  }
}
```

## メリット

1. **一元管理**: すべてのダークモードスタイルが1ファイルで管理される
2. **保守性向上**: スタイルを変更する際は、1箇所を修正するだけでOK
3. **コードの簡潔性**: コンポーネントのクラス名が短くなり、可読性が向上
4. **一貫性**: プロジェクト全体で統一されたスタイルが保証される
5. **再利用性**: 同じパターンを複数の場所で簡単に再利用できる

## フォント

プロジェクト全体で **Zen Kaku Gothic New**（Google Fonts）を使用しています。フォールバックとして、システムフォントが設定されています：

```css
font-family: 'Zen Kaku Gothic New', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

## トラブルシューティング

### ダークモードが適用されない

1. ブラウザの開発者ツールで `<html>` タグに `dark` クラスが追加されているか確認
2. システムの外観設定を確認（Windowsの場合：設定 > 個人用設定 > 色）
3. Tailwind設定ファイルで `darkMode: 'class'` が設定されているか確認

### カスタムクラスが動作しない

1. Viteの開発サーバーを再起動してみてください
2. `src/index.css` ファイルの構文エラーをチェック
3. ブラウザのキャッシュをクリア
