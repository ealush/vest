import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
  plugins: [
    tsconfigPaths({
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
