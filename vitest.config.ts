;
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/**/__tests__/*.test.ts'],
    setupFiles: ['vx/config/vitest/customMatchers.ts'],
  },
  root: __dirname,
  plugins: [],
});
