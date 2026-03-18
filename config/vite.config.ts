import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  // Home Assistant runs Lovelace cards in the browser where `process` doesn't exist.
  // Some deps (notably ECharts) reference `process.env.NODE_ENV`, so we replace it at build time.
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      name: "EnergyHorizonCard",
      fileName: "energy-horizon-card",
      formats: ["es"]
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});

