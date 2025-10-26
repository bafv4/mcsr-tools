# MCSR Tools

MCSRの環境構築を補助するWebアプリケーション集（モノレポ構成）

## プロジェクト構成

このリポジトリは、MCSR（Minecraft Speedrunning）のプレイヤー向けに複数のツールを提供するモノレポです。

### アプリケーション

- **[SeedQueue Pack Creator](./apps/seedqueue-pack-creator/)** - SeedQueue Mod用のリソースパック作成ツール
  - [SeedQueue](https://github.com/contariaa/seedqueue)
  - ポート: 3000

- **[MiniPracticeKit NBT Editor](./apps/minipractice-nbt-editor/)** - MiniPracticeKitのNBTファイルをUI上で編集できるツール
  - [MiniPracticeKit](https://github.com/Knawk/mc-MiniPracticeKit)
  - ポート: 3001

- **[Key & Settings Editor](./apps/key-settings-editor/)** - AutoHotKeyのリマップサポート & StandardSettingsのMinecraftキー設定編集ツール
  - [StandardSettings](https://github.com/contariaa/StandardSettings)
  - ポート: 3002

### 共有パッケージ

- **@mcsr-tools/ui** - 共通UIコンポーネント
- **@mcsr-tools/utils** - 共通ユーティリティ関数
- **@mcsr-tools/types** - 共通型定義

## 技術スタック

- **モノレポツール**: pnpm workspaces + Turbo
- **フレームワーク**: React + Vite
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Zustand

## セットアップ

### 前提条件

- Node.js 18以上
- pnpm 8以上

### インストール

```bash
# 依存関係のインストール
pnpm install
```

## 開発

```bash
# すべてのアプリケーションを開発モードで起動
pnpm dev

# 特定のアプリケーションのみ起動
pnpm --filter @mcsr-tools/seedqueue-pack-creator dev
pnpm --filter @mcsr-tools/minipractice-nbt-editor dev
pnpm --filter @mcsr-tools/key-settings-editor dev
```

## ビルド

```bash
# すべてのアプリケーションをビルド
pnpm build

# 特定のアプリケーションのみビルド
pnpm --filter @mcsr-tools/seedqueue-pack-creator build
```

## その他のコマンド

```bash
# リント
pnpm lint

# 型チェック
pnpm type-check

# クリーンアップ
pnpm clean
```

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更を加える場合は、まずissueを開いて変更内容を議論してください。
