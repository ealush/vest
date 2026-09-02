import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      vest: resolve(__dirname, 'packages/vest/src/vest.ts'),
      n4s: resolve(__dirname, 'packages/n4s/src/n4s.ts'),
    },
  },
  test: {
    globals: true,
    include: ['/tmp/feature.test.ts'],
  },
});
