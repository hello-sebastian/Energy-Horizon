import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  console: "readonly",
  customElements: "readonly",
  HTMLElement: "readonly",
  HTMLCanvasElement: "readonly",
  CanvasRenderingContext2D: "readonly",
  HTMLInputElement: "readonly",
  HTMLTextAreaElement: "readonly",
  getComputedStyle: "readonly",
  Document: "readonly",
  ResizeObserver: "readonly",
  CustomEvent: "readonly",
  Event: "readonly",
  FocusEvent: "readonly",
  KeyboardEvent: "readonly",
  CSS: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly"
};

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest"
      },
      globals: browserGlobals
    },
    plugins: {
      "@typescript-eslint": tseslint
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "no-unused-vars": "off",
      // 911/TD-4 — strict typing enforced by tooling (Constitution III):
      // `no-explicit-any` is "error" with a temporary scoped exception in
      // src/card/echarts-renderer.ts (tracked to TD-5, removed in Wave 3);
      // `no-non-null-assertion` is "warn" until TD-6 enables
      // noUncheckedIndexedAccess and removes the assertions (cataloged in
      // specs/911-tech-debt-reduction/notes/no-non-null-warnings-catalog.md).
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/consistent-type-imports": "error"
    }
  }
];

