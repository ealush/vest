import path from 'path';

import { defineConfig } from 'tsdown';

import createPackageConfig from './vx/config/tsdown/packageConfig';

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
    createPackageConfig({ packageDir: path.resolve(__dirname, 'packages', pkg) }),
  ),
);
