import { dts } from 'rollup-plugin-dts'

// Bundle the per-module .d.ts emitted to .types/ into a single, self-contained
// dist/flying-menu.d.ts (no internal imports) — node16/nodenext-resolvable.
export default {
  input: '.types/flying-menu.d.ts',
  output: { file: 'dist/flying-menu.d.ts', format: 'es' },
  external: [/^lit/],
  plugins: [dts()],
}
