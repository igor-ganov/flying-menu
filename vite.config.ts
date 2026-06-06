import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/flying-menu.ts'),
      formats: ['es'],
      fileName: 'flying-menu',
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
})
