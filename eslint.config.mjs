// @ts-check

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vitestPlugin from 'eslint-plugin-vitest';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import vestInternalPlugin from './vx/eslint-plugin-vest-internal/lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // -------------------------
  // GLOBAL IGNORES
  // -------------------------
  {
    ignores: [
      '*.d.ts',
      '**/*.d.ts',
      'website/**',
      '**/dist/**',
      '**/types/**',
      'coverage/**',
    ],
  },

  // -------------------------
  // BASE JS CONFIG (non-TS files only)
  // -------------------------
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        __DEV__: 'readonly',
        __LIB_VERSION__: 'readonly',
        ENV_DEVELOPMENT: 'readonly',
        afterEach: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
      },
      sourceType: 'module',
    },
    plugins: {
      import: importPlugin,
      prettier: eslintPluginPrettier,
      'vest-internal': vestInternalPlugin,
    },
    rules: {
      // Core
      complexity: ['error', { max: 5 }],
      'import/extensions': ['off', 'ignorePackages'],
      'import/first': 'error',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
      'max-params': ['warn', { max: 4 }],
      'no-console': 'error',
      'no-else-return': 'warn',
      'no-implicit-globals': 'error',
      'no-lonely-if': 'error',
      'no-multi-spaces': 'warn',
      'no-trailing-spaces': ['error', { ignoreComments: false }],
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-useless-catch': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-warning-comments': 'warn',
      'object-shorthand': ['error', 'always', { avoidQuotes: true }],
      'prefer-const': 'error',
      'prettier/prettier': 'warn',
      'sort-keys': ['warn', 'asc', { natural: true, minKeys: 4 }],
    },
  },

  // -------------------------
  // TS FILES CONFIG
  // -------------------------
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        __DEV__: 'readonly',
        __LIB_VERSION__: 'readonly',
        ENV_DEVELOPMENT: 'readonly',
        afterEach: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      prettier: eslintPluginPrettier,
      'vest-internal': vestInternalPlugin,
    },
    rules: {
      // TypeScript-specific (must come first for sort-keys)
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Core
      complexity: ['error', { max: 5 }],

      // import plugin
      'import/extensions': ['off', 'ignorePackages'],
      'import/first': 'error',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',

      // Style
      'max-params': ['warn', { max: 4 }],
      'no-console': 'error',
      'no-else-return': 'error',
      'no-implicit-globals': 'error',
      'no-lonely-if': 'error',
      'no-multi-spaces': 'warn',
      'no-trailing-spaces': ['error', { ignoreComments: false }],
      'no-undef': 'off', // TypeScript handles this
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-unused-vars': 'off', // Use TypeScript-specific rule
      'no-useless-catch': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-warning-comments': 'warn',
      'object-shorthand': ['error', 'always', { avoidQuotes: true }],
      'prefer-const': 'error',
      'prettier/prettier': 'warn',
      'sort-keys': ['warn', 'asc', { natural: true, minKeys: 4 }],
    },
  },

  // -------------------------
  // PACKAGES SRC LIMIT RULES
  // -------------------------
  {
    files: ['packages/*/src/**/*.*'],
    ignores: ['**/__tests__/**/*.*'],
    rules: {
      'max-depth': ['warn', { max: 3 }],
      'max-lines-per-function': [
        'warn',
        {
          max: 45,
          skipComments: true,
          skipBlankLines: true,
        },
      ],
      'max-nested-callbacks': ['warn', { max: 2 }],
      'max-statements': ['warn', { max: 10 }],
    },
  },

  // -------------------------
  // VEST INTERNAL RULES
  // -------------------------
  {
    files: ['**/vest/src/**/*.*'],
    ignores: ['**/__tests__/**/*.*'],
    plugins: {
      'vest-internal': vestInternalPlugin,
    },
    rules: {
      'vest-internal/use-use': 'error',
    },
  },

  // -------------------------
  // TESTS (VITEST)
  // -------------------------
  {
    files: ['**/__tests__/**/*.*'],
    plugins: {
      vitest: vitestPlugin,
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      complexity: 'off', // Disable complexity for test files
      'sort-keys': 'off', // Disable sort-keys for test files - order is often intentional
      'vitest/expect-expect': [
        'warn',
        {
          assertFunctionNames: ['expect', 'assert', 'enforce'],
        },
      ],
      'vitest/no-identical-title': 'off', // Disabled to match baseline
    },
  },
];
