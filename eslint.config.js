import functional from 'eslint-plugin-functional'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

// Bans control-flow branching: only `switch` / strategy maps / Match are allowed.
const noBranching = {
  'no-restricted-syntax': [
    'error',
    { selector: 'IfStatement', message: 'No `if`. Use switch / Match / strategy maps (functional-frontend rule 5).' },
    { selector: 'ConditionalExpression', message: 'No ternary `?:`. Use switch / Match / Option.match (rule 5).' },
  ],
}

export default tseslint.config(
  {
    ignores: ['dist/', 'dist-example/', 'node_modules/', 'coverage/'],
  },
  // — all source: no branching, small files, exhaustive switches, kebab filenames —
  {
    files: ['src/**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { unicorn },
    rules: {
      ...noBranching,
      'max-lines': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    },
  },
  // — pure layers: functional discipline. `switch` is allowed (rule 5), so
  //   functional/no-conditional-statements stays OFF; if/ternary are banned above. —
  {
    files: ['src/core/**/*.ts', 'src/a11y/**/*.ts', 'src/fp/**/*.ts'],
    plugins: { functional },
    rules: {
      'functional/no-let': 'error',
      'functional/immutable-data': 'error',
      'functional/no-loop-statements': 'error',
      'functional/no-classes': 'error',
      'functional/no-this-expressions': 'error',
    },
  },
)
