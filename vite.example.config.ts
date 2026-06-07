import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Builds the standalone example site published to GitHub Pages.
// `base` must match the repository name for project pages
// (https://igor-ganov.github.io/flying-menu/).
export default defineConfig({
  root: resolve(import.meta.dirname, 'example'),
  base: process.env.PAGES_BASE ?? '/flying-menu/',
  resolve: {
    alias: {
      // The demo consumes the package by its public name; resolve it to the local
      // built artifact (identical to what's published to npm). `build:example`
      // builds the library first so dist/ is fresh.
      '@igor-ganov/flying-menu': resolve(import.meta.dirname, 'dist/flying-menu.js'),
    },
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist-example'),
    emptyOutDir: true,
  },
})
