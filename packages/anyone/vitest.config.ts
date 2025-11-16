import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['./**/__tests__/*.test.ts'],
    setupFiles: [resolve(__dirname, '../../', 'vx/config/vitest/customMatchers.ts')],
  },
  root: __dirname,
  resolve: {
    alias: {
      anyone: resolve(__dirname, 'src/anyone.ts'),
      runAnyoneMethods: resolve(__dirname, 'src/runner/runAnyoneMethods.ts'),
      one: resolve(__dirname, 'src/exports/one.ts'),
      none: resolve(__dirname, 'src/exports/none.ts'),
      any: resolve(__dirname, 'src/exports/any.ts'),
      all: resolve(__dirname, 'src/exports/all.ts')
    }
  },
});