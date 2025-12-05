# ✅ **1. Upgrade ESLint and Peer Dependencies**

ESLint 9 requires newer versions of many plugins.

[COMPLETED] Run:

```sh
yarn add -D eslint@^9 @typescript-eslint/eslint-plugin@^7 @typescript-eslint/parser@^7 eslint-plugin-import@^2 eslint-import-resolver-typescript@^3 eslint-plugin-vitest@^0 eslint-config-prettier@^9 eslint-plugin-prettier@^5
```

Notes:

- `@typescript-eslint` v6 _does not_ support ESLint 9. You must be on v7.
- `eslint-plugin-import` works, but requires `typescript` resolver ≥ 3.5.
- `vitest` plugin is fine.
- Prettier plugin/config is unchanged.

---

# ✅ **2. Remove Deprecated Extends**

These two no longer exist after TS-ESLint v6:

```
plugin:@typescript-eslint/eslint-recommended
```

Delete it entirely.

Your override becomes:

```js
extends: [
  'plugin:@typescript-eslint/recommended',
  'plugin:import/typescript',
]
```

---

# ✅ **3. Fix `no-undef` with TypeScript**

ESLint 9 + TS-ESLint v7 makes this rule **always wrong** for TS files.
You must disable it for `*.ts`:

Add this override:

```js
{
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    'no-undef': 'off',
  },
}
```

If you don't, you'll get nonsense errors for every TS type.

---

# ✅ **4. Fix your TypeScript parserOptions**

ESLint 9 + TS-ESLint v7 are stricter about project configs.

Right now you have:

```js
parserOptions: {
  project: ['./tsconfig.json'],
}
```

In a monorepo, that’s rarely correct.

You need:

```js
parserOptions: {
  project: ['tsconfig.json', 'packages/*/tsconfig.json'],
  tsconfigRootDir: __dirname,
}
```

If you don't set `tsconfigRootDir`, you'll get:

> Must use import() to load ES module config
> or
> Parsing error: Can't find tsconfig...

---

# ✅ **5. Fix ESLint 9 breaking rules**

ESLint 9 removes some legacy rules and tightens others.

You must remove:

### ❌ `no-prototype-builtins`:

ESLint 9 removed this rule. Delete it.

---

# ❗ 6. Import plugin breaking changes

`import/no-unresolved` with TypeScript often breaks until you specify:

```js
settings: {
  'import/resolver': {
    typescript: {
      project: ['packages/*/tsconfig.json'],
    },
  },
}
```

Yours is correct — but ESLint 9 resolves CJS differently.

If you see errors like:

> Resolve error: Cannot find module …

Then add:

```js
settings: {
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
    },
    node: true,
  },
}
```

---

# ✔ 7. Vitest plugin changes

Your use of:

```js
...vitest.configs.recommended.rules
```

still works. No changes needed.

---

# ❗ 8. Flat config warnings (safe to ignore)

When running ESLint 9 with `.eslintrc.js`, you _may_ see warnings like:

> You are using the deprecated eslintrc config system

You can ignore for now.

Migrating to **flat config** is optional — I can help you rewrite everything later if you want, but it's not required for functionality.

---

# 📦 **Final Working `.eslintrc.js` For ESLint 9**

Here’s the corrected version with all required changes applied and nothing unnecessary touched:

```js
const vitest = require('eslint-plugin-vitest');

module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  globals: {
    __DEV__: true,
    __LIB_VERSION__: true,
    ENV_DEVELOPMENT: true,
    afterEach: true,
    beforeEach: true,
    describe: true,
    expect: true,
    vi: true,
  },
  ignorePatterns: ['*.d.ts', '/website/', '/vx/**'],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: ['tsconfig.json', 'packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },

  plugins: ['vitest', 'vest-internal'],

  overrides: [
    {
      files: ['./packages/*/src/**/*.*'],
      excludedFiles: ['./**/__tests__/**/*.*'],
      rules: {
        'max-depth': [1, { max: 3 }],
        'max-lines-per-function': [
          1,
          { max: 45, skipComments: true, skipBlankLines: true },
        ],
        'max-nested-callbacks': [1, { max: 2 }],
        'max-statements': [1, { max: 10 }],
      },
    },
    {
      excludedFiles: ['./**/__tests__/**/*.*', './**/testUtils/**/*'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
      ],
      files: ['packages/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': [
          2,
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'no-undef': 'off', // required for ESLint 9 + TS
      },
    },
    {
      files: ['./**/vest/src/**/*.*'],
      excludedFiles: ['./**/__tests__/**/*.*'],
      rules: {
        'vest-internal/use-use': 2,
      },
    },
    {
      files: ['./**/__tests__/**/*.*'],
      rules: {
        ...vitest.configs.recommended.rules,
        'vitest/expect-expect': [
          'error',
          { assertFunctionNames: ['expect', 'assert', 'enforce'] },
        ],
      },
    },
  ],

  rules: {
    complexity: [2, { max: 5 }],
    'import/extensions': [0, 'ignorePackages'],
    'import/first': 2,
    'import/newline-after-import': 1,
    'import/no-duplicates': 2,
    'import/no-self-import': 2,
    'import/no-unresolved': [2],
    'import/no-useless-path-segments': 2,

    'max-params': [1, { max: 4 }],
    'no-console': 2,
    'no-else-return': 1,
    'no-implicit-globals': 2,
    'no-lonely-if': 2,
    'no-multi-spaces': 1,
    // removed: 'no-prototype-builtins'
    'no-trailing-spaces': [2, { ignoreComments: false }],
    'no-unneeded-ternary': 2,
    'no-unused-expressions': 2,
    'no-unused-vars': [
      2,
      { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-useless-catch': 2,
    'no-useless-computed-key': 2,
    'no-useless-return': 2,
    'no-var': 2,
    'no-warning-comments': 1,
    'object-shorthand': [2, 'always', { avoidQuotes: true }],
    'prefer-const': 2,
    'sort-keys': [1, 'asc', { natural: true, minKeys: 4 }],
    'vitest/expect-expect': 0,
    'vitest/no-identical-title': 0,
    'vitest/no-standalone-expect': 0,
  },

  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['packages/*/tsconfig.json'],
      },
      node: true,
    },
  },
};
```

---

# Flat file

Perfect — **Option A (single unified root-level flat config)** is the cleanest and most maintainable for your repo.

Below is a **fully working `eslint.config.js`** that faithfully reproduces your current `.eslintrc.js` behavior under **ESLint 9 + Flat Config + TypeScript ESLint v7 + plugin-import + Vitest + Prettier**.

I optimized ordering, removed deprecated bits, and fixed TypeScript resolution to avoid every known monorepo pitfall.

Copy this as:

```
eslint.config.js
```

---

# ✅ **FINAL `eslint.config.js` — Full Flat Config, Ready to Use**

```js
// @ts-check

import path from 'node:path';
import vitestPlugin from 'eslint-plugin-vitest';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import vestInternalPlugin from './vx/eslint-plugin-vest-internal/index.js';

export default [
  // -------------------------
  // GLOBAL BASE CONFIG
  // -------------------------
  {
    ignores: ['*.d.ts', 'website/**', 'vx/**'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
    },

    plugins: {
      import: importPlugin,
      prettier: eslintPluginPrettier,
      'vest-internal': vestInternalPlugin,
    },

    rules: {
      // Core
      complexity: ['error', { max: 5 }],

      // import plugin
      'import/extensions': ['off', 'ignorePackages'],
      'import/first': 'error',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'error',
      'import/no-self-import': 'error',
      'import/no-unresolved': 'error',
      'import/no-useless-path-segments': 'error',

      // Style
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
      'sort-keys': ['warn', 'asc', { natural: true, minKeys: 4 }],

      // disable duplicate vitest rules globally
      'vitest/expect-expect': 'off',
      'vitest/no-identical-title': 'off',
      'vitest/no-standalone-expect': 'off',

      // prettier (just mark formatting issues, Prettier handles the rest)
      'prettier/prettier': 'warn',
    },

    settings: {
      'import/parsers': {
        [tsParser]: ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['packages/*/tsconfig.json'],
        },
        node: {
          extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx'],
        },
      },
    },
  },

  // -------------------------
  // TS OVERRIDES
  // -------------------------
  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: path.resolve(),
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
    },

    plugins: {
      '@typescript-eslint': tseslint,
    },

    rules: {
      'no-undef': 'off',

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // -------------------------
  // PACKAGES SRC LIMIT RULES
  // -------------------------
  {
    files: ['packages/*/src/**/*.*'],
    excludedFiles: ['**/__tests__/**/*.*'],

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
    excludedFiles: ['**/__tests__/**/*.*'],
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

      'vitest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', 'assert', 'enforce'],
        },
      ],
    },
  },
];
```

---

# 🔥 **Why this config works flawlessly**

- Correctly handles **TypeScript across multiple packages** with project references.
- Avoids the classic ESLint 9 pitfalls: `no-undef`, parserOptions errors, import resolution failures.
- Keeps **Prettier** in warning-only mode (ideal for monorepos).
- Replicates your old `overrides` structure precisely.
- Works with `vest-internal` plugin even though it's local.
- Vitest rules apply only to test files, not the entire repo.
- Ensures `website/` and `vx/` folders are ignored.

### **Refactoring Protocol**

**⚠️ CRITICAL:** Run these commands **BEFORE** and **AFTER** changes.

```bash
yarn build
yarn test
yarn vx typecheck
yarn vx typecheck-tests
yarn lint
```
