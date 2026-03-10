import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      name: "EnergyBurndownCard",
      fileName: "energy-burndown-card",
      formats: ["es"]
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});

