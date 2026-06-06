import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Builds the standalone example site published to GitHub Pages.
// `base` must match the repository name for project pages
// (https://pforever.github.io/flying-menu/).
export default defineConfig({
  root: resolve(import.meta.dirname, 'example'),
  base: process.env.PAGES_BASE ?? '/flying-menu/',
  build: {
    outDir: resolve(import.meta.dirname, 'dist-example'),
    emptyOutDir: true,
  },
})
