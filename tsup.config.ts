import { defineConfig } from 'tsup'

/**
 * Dual ESM + CJS build so every BotUyo consumer can import it:
 *  - Vite/ESM frontends (landing, admin, kiosk) and ESM packages (mcp) use the
 *    `import` / `./dist/index.js` entry.
 *  - The CommonJS backend (tsoa + tsc) uses the `require` / `./dist/index.cjs` entry.
 *
 * `.d.ts` is emitted once and shared by both.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: false,
  minify: false,
  treeshake: true
})
