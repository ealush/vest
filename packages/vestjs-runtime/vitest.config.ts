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
      'vestjs-runtime': resolve(__dirname, 'src/vestjs-runtime.ts'),
      VestRuntime: resolve(__dirname, 'src/VestRuntime.ts'),
      RuntimeEvents: resolve(__dirname, 'src/RuntimeEvents.ts'),
      Reconciler: resolve(__dirname, 'src/Reconciler.ts'),
      IsolateWalker: resolve(__dirname, 'src/IsolateWalker.ts'),
      Bus: resolve(__dirname, 'src/Bus.ts'),
      'test-utils': resolve(__dirname, 'src/exports/test-utils.ts'),
      IsolateSerializer: resolve(__dirname, 'src/exports/IsolateSerializer.ts'),
      ErrorStrings: resolve(__dirname, 'src/errors/ErrorStrings.ts'),
      IsolateSelectors: resolve(__dirname, 'src/Isolate/IsolateSelectors.ts'),
      IsolateMutator: resolve(__dirname, 'src/Isolate/IsolateMutator.ts'),
      IsolateKeys: resolve(__dirname, 'src/Isolate/IsolateKeys.ts'),
      IsolateInspector: resolve(__dirname, 'src/Isolate/IsolateInspector.ts'),
      Isolate: resolve(__dirname, 'src/Isolate/Isolate.ts')
    }
  },
});