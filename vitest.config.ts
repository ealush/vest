import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/**/__tests__/*.test.ts'],
    setupFiles: ['vx/config/vitest/customMatchers.ts/customMatchers.ts'],
  },
  root: __dirname,
  plugins: [
    tsconfigPaths({
      loose: true,
      projects: ["packages/vest-utils","packages/context","packages/vestjs-runtime","packages/vast","packages/n4s","packages/vest","packages/anyone"],
    }),
  ],
});
