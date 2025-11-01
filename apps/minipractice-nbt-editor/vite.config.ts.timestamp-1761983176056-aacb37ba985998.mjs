// vite.config.ts
import { defineConfig } from "file:///C:/Users/yuanq/OneDrive/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/mcsr-tools/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.23/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/yuanq/OneDrive/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/mcsr-tools/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
import { copyFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { nodePolyfills } from "file:///C:/Users/yuanq/OneDrive/%E3%83%87%E3%82%B9%E3%82%AF%E3%83%88%E3%83%83%E3%83%97/mcsr-tools/node_modules/.pnpm/vite-plugin-node-polyfills@0.24.0_vite@5.4.21/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\yuanq\\OneDrive\\\u30C7\u30B9\u30AF\u30C8\u30C3\u30D7\\mcsr-tools\\apps\\minipractice-nbt-editor";
function copySharedAssets() {
  return {
    name: "copy-shared-assets",
    buildStart() {
      const sourceDir = path.resolve(__vite_injected_original_dirname, "../../packages/ui/public");
      const targetDir = path.resolve(__vite_injected_original_dirname, "./public");
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }
      const sourceItemsDir = path.join(sourceDir, "items");
      const targetItemsDir = path.join(targetDir, "items");
      if (existsSync(sourceItemsDir)) {
        copyRecursive(sourceItemsDir, targetItemsDir);
      }
    }
  };
}
function copyRecursive(src, dest) {
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
var vite_config_default = defineConfig({
  plugins: [
    react(),
    copySharedAssets(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true
      },
      protocolImports: true
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    port: 3001
  },
  build: {
    chunkSizeWarningLimit: 1e3
    // Increase limit to 1000 kB
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dWFucVxcXFxPbmVEcml2ZVxcXFxcdTMwQzdcdTMwQjlcdTMwQUZcdTMwQzhcdTMwQzNcdTMwRDdcXFxcbWNzci10b29sc1xcXFxhcHBzXFxcXG1pbmlwcmFjdGljZS1uYnQtZWRpdG9yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dWFucVxcXFxPbmVEcml2ZVxcXFxcdTMwQzdcdTMwQjlcdTMwQUZcdTMwQzhcdTMwQzNcdTMwRDdcXFxcbWNzci10b29sc1xcXFxhcHBzXFxcXG1pbmlwcmFjdGljZS1uYnQtZWRpdG9yXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy95dWFucS9PbmVEcml2ZS8lRTMlODMlODclRTMlODIlQjklRTMlODIlQUYlRTMlODMlODglRTMlODMlODMlRTMlODMlOTcvbWNzci10b29scy9hcHBzL21pbmlwcmFjdGljZS1uYnQtZWRpdG9yL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIG1rZGlyU3luYywgZXhpc3RzU3luYywgcmVhZGRpclN5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XHJcblxyXG4vLyBQbHVnaW4gdG8gY29weSBzaGFyZWQgYXNzZXRzIGZyb20gcGFja2FnZXMvdWkvcHVibGljIHRvIGFwcCdzIHB1YmxpY1xyXG5mdW5jdGlvbiBjb3B5U2hhcmVkQXNzZXRzKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiAnY29weS1zaGFyZWQtYXNzZXRzJyxcclxuICAgIGJ1aWxkU3RhcnQoKSB7XHJcbiAgICAgIGNvbnN0IHNvdXJjZURpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91aS9wdWJsaWMnKTtcclxuICAgICAgY29uc3QgdGFyZ2V0RGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vcHVibGljJyk7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGFyZ2V0IGRpcmVjdG9yeSBpZiBpdCBkb2Vzbid0IGV4aXN0XHJcbiAgICAgIGlmICghZXhpc3RzU3luYyh0YXJnZXREaXIpKSB7XHJcbiAgICAgICAgbWtkaXJTeW5jKHRhcmdldERpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENvcHkgaXRlbXMgZGlyZWN0b3J5IHJlY3Vyc2l2ZWx5XHJcbiAgICAgIGNvbnN0IHNvdXJjZUl0ZW1zRGlyID0gcGF0aC5qb2luKHNvdXJjZURpciwgJ2l0ZW1zJyk7XHJcbiAgICAgIGNvbnN0IHRhcmdldEl0ZW1zRGlyID0gcGF0aC5qb2luKHRhcmdldERpciwgJ2l0ZW1zJyk7XHJcblxyXG4gICAgICBpZiAoZXhpc3RzU3luYyhzb3VyY2VJdGVtc0RpcikpIHtcclxuICAgICAgICAvLyBVc2UgcmVjdXJzaXZlIGNvcHlcclxuICAgICAgICBjb3B5UmVjdXJzaXZlKHNvdXJjZUl0ZW1zRGlyLCB0YXJnZXRJdGVtc0Rpcik7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLy8gUmVjdXJzaXZlIGNvcHkgaGVscGVyXHJcbmZ1bmN0aW9uIGNvcHlSZWN1cnNpdmUoc3JjOiBzdHJpbmcsIGRlc3Q6IHN0cmluZykge1xyXG4gIGlmICghZXhpc3RzU3luYyhkZXN0KSkge1xyXG4gICAgbWtkaXJTeW5jKGRlc3QsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZW50cmllcyA9IHJlYWRkaXJTeW5jKHNyYywgeyB3aXRoRmlsZVR5cGVzOiB0cnVlIH0pO1xyXG5cclxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcclxuICAgIGNvbnN0IHNyY1BhdGggPSBwYXRoLmpvaW4oc3JjLCBlbnRyeS5uYW1lKTtcclxuICAgIGNvbnN0IGRlc3RQYXRoID0gcGF0aC5qb2luKGRlc3QsIGVudHJ5Lm5hbWUpO1xyXG5cclxuICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XHJcbiAgICAgIGNvcHlSZWN1cnNpdmUoc3JjUGF0aCwgZGVzdFBhdGgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29weUZpbGVTeW5jKHNyY1BhdGgsIGRlc3RQYXRoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIGNvcHlTaGFyZWRBc3NldHMoKSxcclxuICAgIG5vZGVQb2x5ZmlsbHMoe1xyXG4gICAgICAvLyBFbmFibGUgcG9seWZpbGxzIGZvciBzcGVjaWZpYyBnbG9iYWxzIGFuZCBtb2R1bGVzXHJcbiAgICAgIGdsb2JhbHM6IHtcclxuICAgICAgICBCdWZmZXI6IHRydWUsXHJcbiAgICAgICAgZ2xvYmFsOiB0cnVlLFxyXG4gICAgICAgIHByb2Nlc3M6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHByb3RvY29sSW1wb3J0czogdHJ1ZSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDEsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLCAvLyBJbmNyZWFzZSBsaW1pdCB0byAxMDAwIGtCXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb2MsU0FBUyxvQkFBb0I7QUFDamUsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLGNBQWMsV0FBVyxZQUFZLG1CQUFtQjtBQUNqRSxTQUFTLHFCQUFxQjtBQUo5QixJQUFNLG1DQUFtQztBQU96QyxTQUFTLG1CQUFtQjtBQUMxQixTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixhQUFhO0FBQ1gsWUFBTSxZQUFZLEtBQUssUUFBUSxrQ0FBVywwQkFBMEI7QUFDcEUsWUFBTSxZQUFZLEtBQUssUUFBUSxrQ0FBVyxVQUFVO0FBR3BELFVBQUksQ0FBQyxXQUFXLFNBQVMsR0FBRztBQUMxQixrQkFBVSxXQUFXLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFBQSxNQUMxQztBQUdBLFlBQU0saUJBQWlCLEtBQUssS0FBSyxXQUFXLE9BQU87QUFDbkQsWUFBTSxpQkFBaUIsS0FBSyxLQUFLLFdBQVcsT0FBTztBQUVuRCxVQUFJLFdBQVcsY0FBYyxHQUFHO0FBRTlCLHNCQUFjLGdCQUFnQixjQUFjO0FBQUEsTUFDOUM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBR0EsU0FBUyxjQUFjLEtBQWEsTUFBYztBQUNoRCxNQUFJLENBQUMsV0FBVyxJQUFJLEdBQUc7QUFDckIsY0FBVSxNQUFNLEVBQUUsV0FBVyxLQUFLLENBQUM7QUFBQSxFQUNyQztBQUVBLFFBQU0sVUFBVSxZQUFZLEtBQUssRUFBRSxlQUFlLEtBQUssQ0FBQztBQUV4RCxhQUFXLFNBQVMsU0FBUztBQUMzQixVQUFNLFVBQVUsS0FBSyxLQUFLLEtBQUssTUFBTSxJQUFJO0FBQ3pDLFVBQU0sV0FBVyxLQUFLLEtBQUssTUFBTSxNQUFNLElBQUk7QUFFM0MsUUFBSSxNQUFNLFlBQVksR0FBRztBQUN2QixvQkFBYyxTQUFTLFFBQVE7QUFBQSxJQUNqQyxPQUFPO0FBQ0wsbUJBQWEsU0FBUyxRQUFRO0FBQUEsSUFDaEM7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixpQkFBaUI7QUFBQSxJQUNqQixjQUFjO0FBQUE7QUFBQSxNQUVaLFNBQVM7QUFBQSxRQUNQLFFBQVE7QUFBQSxRQUNSLFFBQVE7QUFBQSxRQUNSLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxpQkFBaUI7QUFBQSxJQUNuQixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBO0FBQUEsRUFDekI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
