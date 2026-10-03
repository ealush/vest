import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: [
      { find: /^vest$/, replacement: resolve(__dirname, 'src/vest.ts') },
      {
        find: /^n4s\/(?:exports\/)?relationships$/,
        replacement: resolve(__dirname, '../n4s/src/exports/relationships.ts'),
      },
      { find: /^n4s$/, replacement: resolve(__dirname, '../n4s/src/n4s.ts') },
    ],
  },
  root: __dirname,
  test: {
    benchmark: {
      include: ['./bench/**/*.bench.ts'],
    },
    globals: true,
    include: ['./**/__tests__/*.test.ts'],
    setupFiles: [
      resolve(__dirname, '../../', 'vx/config/vitest/customMatchers.ts'),
    ],
  },
});
