import functional from 'eslint-plugin-functional'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

// Custom rule: at most N non-import, non-comment, non-blank lines (rule 1 — "50
// excluding imports", which the built-in max-lines cannot express since it counts imports).
const local = {
  rules: {
    'max-lines-no-imports': {
      meta: { type: 'suggestion', schema: [{ type: 'integer' }] },
      create(context) {
        const max = context.options[0] ?? 50
        const sc = context.sourceCode
        return {
          'Program:exit'(program) {
            const importLines = new Set()
            for (const stmt of program.body) {
              if (stmt.type !== 'ImportDeclaration') continue
              for (let l = stmt.loc.start.line; l <= stmt.loc.end.line; l++) importLines.add(l)
            }
            const count = sc.lines.filter((text, i) => {
              const t = text.trim()
              return (
                t !== '' &&
                !importLines.has(i + 1) &&
                !t.startsWith('//') &&
                !t.startsWith('*') &&
                !t.startsWith('/*')
              )
            }).length
            if (count > max) {
              context.report({
                loc: { line: 1, column: 0 },
                message: `File has ${count} code lines (excluding imports); max ${max}.`,
              })
            }
          },
        }
      },
    },
  },
}

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
    plugins: { unicorn, local },
    rules: {
      ...noBranching,
      'local/max-lines-no-imports': ['error', 50],
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
