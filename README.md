# MCSR Tools

MCSRの環境構築を補助するWebアプリケーション集

## プロジェクト構成

このリポジトリは、MCSR（Minecraft Speedrunning）のプレイヤー向けの複数のツールと共有パッケージを含んでいます。

### アプリケーション

- **[SeedQueue Pack Creator](./apps/seedqueue-pack-creator/)** - SeedQueue Mod用のリソースパック作成ツール
  - [SeedQueue](https://github.com/contariaa/seedqueue)

- **[MiniPracticeKit NBT Editor](./apps/minipractice-nbt-editor/)** - MiniPracticeKitのNBTファイルをUI上で編集できるツール（**WIP**）
  - [MiniPracticeKit](https://github.com/Knawk/mc-MiniPracticeKit)

- **[Key & Settings Editor](./apps/key-settings-editor/)** - AutoHotKeyのリマップサポート & StandardSettingsのMinecraftキー設定編集ツール（**WIP**）
  - [StandardSettings](https://github.com/contariaa/StandardSettings)

### 共有パッケージ

- **@mcsr-tools/ui** - 共通UIコンポーネント
- **@mcsr-tools/utils** - 共通ユーティリティ関数
- **@mcsr-tools/types** - 共通型定義
