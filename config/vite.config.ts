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
    // Production artifact ships without a source map (911/TD-13): the ~3.86 MB
    // `dist/energy-horizon-card.js.map` is not needed by HA and bloats the repo.
    // Dev/preview serve their own maps from `vite dev` regardless of this flag.
    sourcemap: false,
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

