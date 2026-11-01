/**
 * Minimal ambient declaration for the `js-yaml` npm package.
 *
 * Only `tests/unit/editor-yaml-mode.test.ts` imports the npm `js-yaml`
 * package (to install a faithful stand-in for the HA `window.jsyaml`
 * global). We intentionally do NOT use `@types/js-yaml`: its
 * `export as namespace jsyaml` UMD global leaks into `globalThis`, which
 * turns `window.jsyaml` (declared in `src/ha-types.ts`) into a
 * non-optional intersection type and breaks the test's stand-in
 * assignments and `delete window.jsyaml`.
 *
 * This declaration mirrors the `window.jsyaml` shape in `src/ha-types.ts`.
 */
declare module "js-yaml" {
  export function dump(obj: unknown, options?: Record<string, unknown>): string;
  export function load(str: string): unknown;
}
