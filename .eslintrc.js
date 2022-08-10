module.exports = {
  env: {
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:import/errors',
    'plugin:import/warnings',
    'prettier',
  ],
  globals: {
    __DEV__: true,
    __LIB_VERSION__: true,
    ENV_DEVELOPMENT: true,
  },
  ignorePatterns: ['*.d.ts', '/website/'],
  overrides: [
    {
      files: ['./packages/*/src/**/*.*'],
      excludedFiles: ['./**/__tests__/**/*.*'],
      rules: {
        'max-depth': [1, { max: 3 }],
        'max-lines-per-function': [1, { max: 45, skipComments: true }],
        'max-nested-callbacks': [1, { max: 2 }],
        'max-statements': [1, { max: 10 }],
      },
    },
    {
      excludedFiles: ['./**/__tests__/**/*.*', './**/testUtils/**/*'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
      ],
      files: ['packages/**/*.ts'],
      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    {
      excludedFiles: ['./**/__tests__/**/*.*'],
      files: ['*.ts'],
      rules: {
        'jest/no-export': 0,
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['jest'],
  rules: {
    complexity: [2, { max: 5 }],
    'import/extensions': [2, 'never'],
    'import/first': 2,
    'import/newline-after-import': 1,
    'import/no-duplicates': 2,
    'import/no-self-import': 2,
    'import/no-unresolved': [2],
    'import/no-useless-path-segments': 2,
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
        },
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '^vx',
            group: 'external',
          },
          {
            pattern: './vx',
            group: 'external',
          },
        ],
      },
    ],
    'jest/expect-expect': 0,
    'jest/no-identical-title': 0,
    'jest/no-standalone-expect': 0,
    'max-params': [1, { max: 4 }],
    'no-console': 2,
    'no-implicit-globals': 2,
    'no-lonely-if': 2,
    'no-multi-spaces': 1,
    'no-prototype-builtins': 0,
    'no-trailing-spaces': [2, { ignoreComments: false }],
    'no-undef': 2,
    'no-unneeded-ternary': 2,
    'no-unused-expressions': 2,
    'no-useless-catch': 2,
    'no-useless-computed-key': 2,
    'no-useless-return': 2,
    'no-var': 2,
    'no-warning-comments': 1,
    'object-shorthand': [2, 'always', { avoidQuotes: true }],
    'prefer-const': 2,
    'sort-keys': [
      1,
      'asc',
      {
        natural: true,
        minKeys: 4,
      },
    ],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
