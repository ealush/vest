import path from 'path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/*/**/__tests__/*.test.ts'],
    setupFiles: [
      path.resolve(__dirname, './vx/config/vitest/customMatchers.ts'),
    ],
  },
  root: __dirname,
  plugins: [
    tsconfigPaths({
      loose: true,
      projects: [
        'packages/vest',
        'packages/n4s',
        'packages/vest-utils',
        'packages/vestjs-runtime',
        'packages/context',
        'packages/vast',
        'packages/anyone',
      ],
    }),
  ],
});
