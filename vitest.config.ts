import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/**/__tests__/*.test.ts'],
    setupFiles: ['vx/config/vitest/customMatchers.ts'],
  },
  root: __dirname,
  plugins: [
    tsconfigPaths({
      loose: true,
      projects: [
        'packages/vest-utils',
        'packages/context',
        'packages/vestjs-runtime',
        'packages/vast',
        'packages/n4s',
        'packages/vest',
        'packages/anyone',
      ],
    }),
  ],
});
