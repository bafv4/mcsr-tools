import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';

// Plugin to copy shared assets from packages/ui/public to app's public
function copySharedAssets() {
  return {
    name: 'copy-shared-assets',
    buildStart() {
      const sourceDir = path.resolve(__dirname, '../../packages/ui/public');
      const targetDir = path.resolve(__dirname, './public');

      // Create target directory if it doesn't exist
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      // Copy items directory recursively
      const sourceItemsDir = path.join(sourceDir, 'items');
      const targetItemsDir = path.join(targetDir, 'items');

      if (existsSync(sourceItemsDir)) {
        // Use recursive copy
        copyRecursive(sourceItemsDir, targetItemsDir);
      }
    },
  };
}

// Recursive copy helper
function copyRecursive(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  plugins: [react(), copySharedAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
  },
});
