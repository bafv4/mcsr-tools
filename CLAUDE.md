# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCSR Tools is a monorepo containing web applications for Minecraft Speedrunning environment setup. The project uses pnpm workspaces with Turborepo for build orchestration.

**Applications:**
- **SeedQueue Pack Creator** - Creates Minecraft resource packs for the SeedQueue mod
- **MCSR Config Tool** - Generates StandardSettings configuration files and AutoHotkey scripts for MCSR (WIP)

**Shared Packages:**
- `@mcsr-tools/ui` - React components with Tailwind CSS and class-variance-authority
- `@mcsr-tools/utils` - Common utilities (file operations)
- `@mcsr-tools/types` - Shared TypeScript types (Minecraft, NBT)

## Development Commands

**Root level:**
```bash
pnpm install          # Install dependencies
pnpm dev              # Run all apps in dev mode
pnpm build            # Build all apps and packages
pnpm lint             # Lint all projects
pnpm type-check       # Type check all projects
pnpm clean            # Clean build artifacts
```

**Individual apps** (navigate to `apps/[app-name]/`):
```bash
pnpm dev              # Dev mode for single app
pnpm build            # Build single app
pnpm preview          # Preview production build
pnpm lint             # Lint single app
pnpm type-check       # Type check single app
```

## Architecture

### Monorepo Structure

- **Package Manager:** pnpm with `workspace:*` protocol for internal dependencies
- **Build System:** Turborepo handles dependency-based build ordering via `dependsOn: ["^build"]`
- **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Zustand

### SeedQueue Pack Creator (Primary App)

**State Management:** Single Zustand store (`src/store/useWallStore.ts`) manages:
- Resolution and wall layout (main/locked/preparing areas with optional grid)
- Background settings (color/image/gradient with transforms)
- Pack metadata and sound settings

**Resource Pack Export System (`src/utils/packExport.ts`):**
1. Generates pack.mcmeta (format 5 for MC 1.16.x)
2. Creates background via Canvas API (color/image/gradient)
3. Exports custom_layout.json for SeedQueue mod
4. Packages sound files (.ogg format)
5. Creates ZIP using JSZip

**Critical Export Details:**
- Strip internal-only flags (`useGrid`, `show`) before export
- Optional areas (locked/preparing) only included if `show: true`
- Built-in sounds (lock_instance, reset_instance) can be replaced with .ogg files
- Custom sounds require both .ogg files AND sounds.json entries: `{"sound_name": {"sounds": ["seedqueue:sound_name"]}}`
- Folder structure: `assets/seedqueue/wall/` for layout, `assets/seedqueue/textures/gui/wall/` for images

**Audio Processing:** FFmpeg.wasm converts audio to .ogg for Minecraft

**Component Pattern:**
- `App.tsx` provides tabbed interface
- Editor components (`AreaEditor`, `BackgroundSettings`, `SoundSettings`) directly modify Zustand store
- `WallPreview.tsx` renders real-time preview from store state

### Shared Packages Pattern

**UI Package:** Exports components (Button, Input, Modal, Select, Switch, Tabs) using:
- Tailwind CSS for styling
- `class-variance-authority` for variant management
- `cn()` utility (from `lib/utils.ts`) for className merging with `tailwind-merge`

**Types Package:** Centralizes domain types exported from `index.ts`

**Utils Package:** File utilities like `downloadFile` for cross-app use

## Common Tasks

**Adding features to SeedQueue Pack Creator:**
1. Update `useWallStore.ts` for new state
2. Create/modify components in `src/components/`
3. Update `packExport.ts` to include new data in pack (remember to strip internal flags)

**Adding shared components:**
1. Create in `packages/ui/src/[Component].tsx`
2. Export from `packages/ui/src/index.ts`
3. Import as `@mcsr-tools/ui` in apps

**Adding shared types:**
1. Add to appropriate file in `packages/types/src/`
2. Export from `packages/types/src/index.ts`
3. Import as `@mcsr-tools/types` in apps
