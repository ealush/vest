import { defineConfig } from 'tsdown';

export default defineConfig({
  workspace: {
    packages: [
      'packages/anyone',
      'packages/context',
      'packages/n4s',
      'packages/vast',
      'packages/vest',
      'packages/vest-utils',
      'packages/vestjs-runtime',
    ],
  },
});
