import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      // lcov feeds Codecov; text prints a summary locally.
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      // The imperative shell (Lit element + DOM glue) is covered by E2E, not
      // unit tests; styles/types carry no branching logic. Coverage here tracks
      // the pure functional core.
      exclude: [
        'src/**/*.d.ts',
        'src/flying-menu.ts',
        'src/element/**',
        'src/styles/**',
        'src/**/types.ts',
        'src/**/constants.ts',
        'src/test-ids.ts',
      ],
    },
  },
})
