import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const { BABEL_CONFIG_PATH } = require('..');
const { PACKAGE_VEST } = require('../../shared/constants');
const { packagePath, packageJson } = require('../../util');

const DEFAULT_FORMAT = 'umd';

const babelConfig = require(BABEL_CONFIG_PATH)();

const { version } = packageJson(PACKAGE_VEST);
const PACKAGE_PATH = packagePath(PACKAGE_VEST);

const PLUGINS = [
  resolve(),
  commonjs({
    include: /node_modules\/(anyone|n4s)/,
  }),
  replace({
    VEST_VERSION: JSON.stringify(version),
    LIBRARY_NAME: JSON.stringify(PACKAGE_VEST),
  }),
  typescript({
    include: ['*.ts', '**/*.ts'],
  }),
  babel({
    babelrc: false,
    ...babelConfig,
  }),
  compiler(),
];

const buildConfig = ({ format = DEFAULT_FORMAT, min = false } = {}) => ({
  input: path.join(PACKAGE_PATH, 'src/index.ts'),
  output: {
    file: [
      path.join(PACKAGE_PATH, 'dist', PACKAGE_VEST),
      min && 'min',
      format !== DEFAULT_FORMAT && format,
      'js',
    ]
      .filter(Boolean)
      .join('.'),
    format,
    name: PACKAGE_VEST,
  },
  plugins: min ? [...PLUGINS, terser()] : PLUGINS,
});

export default [buildConfig(), buildConfig({ min: true })];
