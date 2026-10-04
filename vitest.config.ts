import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: [
      {
        find: new RegExp('^n4s/(?:exports/)?relationships$'),
        replacement: path.join(
          __dirname,
          'packages/n4s/src/exports/relationships.ts',
        ),
      },
      {
        find: /^n4s$/,
        replacement: path.join(__dirname, 'packages/n4s/src/n4s.ts'),
      },
    ],
  },
  test: {
    globals: true,
    include: ['packages/**/__tests__/*.test.ts'],
    setupFiles: ['vx/config/vitest/customMatchers.ts'],
  },
  root: __dirname,
  plugins: [],
});
