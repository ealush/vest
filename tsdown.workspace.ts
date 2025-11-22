import path from 'path';

import { defineConfig } from 'tsdown';

import { createPackageConfig } from './vx/config/tsdown/packageConfig.ts';

const workspaceRoot = process.cwd();

const packages = [
  'anyone',
  'context',
  'n4s',
  'vast',
  'vest',
  'vest-utils',
  'vestjs-runtime',
];

export default defineConfig(
  packages.map(pkg =>
    createPackageConfig({
      packageDir: path.resolve(workspaceRoot, 'packages', pkg),
    }),
  ),
);
