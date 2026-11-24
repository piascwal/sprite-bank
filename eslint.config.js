import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'characters'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: globals.browser },
    rules: {
      'max-lines': ['error', { max: 450, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 90, skipBlankLines: true, skipComments: true }],
      eqeqeq: 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      'no-restricted-syntax': [
        'error',
        { selector: 'ExportDefaultDeclaration', message: 'Utilise un export nommé.' },
      ],
    },
  },
  {
    // vérification de la banque et configuration : lancées par Node
    files: ['scripts/**/*.mjs', 'vite.config.ts', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
    rules: { 'no-restricted-syntax': 'off' },
  },
  prettier,
);
