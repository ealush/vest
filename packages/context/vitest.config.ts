import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    include: ['./**/__tests__/*.test.ts'],
    setupFiles: [resolve(__dirname, '../../', 'vx/config/vitest')],
  },
  root: __dirname,
  resolve: {
    alias: {
      context: resolve(__dirname, 'src/context.ts'),
    },
  },
});
