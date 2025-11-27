import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  benchmark: {
    include: ['./bench/**/*.bench.ts'],
  },
  resolve: {
    alias: {
      vest: resolve(__dirname, 'src/vest.ts'),
    },
  },
  root: __dirname,
  test: {
    globals: true,
    include: ['./**/__tests__/*.test.ts'],
    setupFiles: [
      resolve(__dirname, '../../', 'vx/config/vitest/customMatchers.ts'),
    ],
  },
} as any);
