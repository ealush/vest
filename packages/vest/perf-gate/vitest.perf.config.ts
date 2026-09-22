import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Dedicated config for gate:schema-performance measurement runs. The
 * perf-pairs file must NOT live under __tests__ (ordinary test and
 * coverage discovery would absorb its timings), so it carries its own
 * include plus the same workspace source aliases as the package config.
 */
export default defineConfig({
  resolve: {
    alias: {
      vest: resolve(__dirname, '../src/vest.ts'),
      'n4s/exports/internal': resolve(
        __dirname,
        '../../n4s/src/exports/internal.ts',
      ),
      n4s: resolve(__dirname, '../../n4s/src/n4s.ts'),
    },
  },
  root: __dirname,
  test: {
    globals: true,
    include: ['./perf-pairs.test.ts'],
    setupFiles: [
      resolve(__dirname, '../../../', 'vx/config/vitest/customMatchers.ts'),
    ],
  },
});
