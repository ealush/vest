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
      context: resolve(__dirname, 'src/context.ts')
    }
  },
});