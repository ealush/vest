import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

const { BABEL_CONFIG_PATH } = require('..');
const { PACKAGE_VEST } = require('../../shared/constants');
const { packagePath, packageJson } = require('../../util');

const { version } = packageJson(PACKAGE_VEST);
const PACKAGE_PATH = packagePath(PACKAGE_VEST);

const plugins = ({ development }) => {
  const PLUGINS = [
    resolve(),
    commonjs({
      include: /node_modules\/(anyone|n4s)/,
    }),
    babel({
      configFile: BABEL_CONFIG_PATH,
      envName: development ? 'development' : 'production',
    }),
    replace({
      VEST_VERSION: JSON.stringify(version),
      LIBRARY_NAME: JSON.stringify(PACKAGE_VEST),
    }),
  ];

  if (!development) {
    PLUGINS.push(compiler(), terser());
  }

  return PLUGINS;
};

const buildConfig = ({ min = false, development = false } = {}) => ({
  input: path.join(PACKAGE_PATH, 'src/index.js'),
  output: {
    file: [
      path.join(PACKAGE_PATH, 'dist', PACKAGE_VEST),
      min && 'min',
      development && 'development',
      'js',
    ]
      .filter(Boolean)
      .join('.'),
    format: 'umd',
    name: PACKAGE_VEST,
  },
  plugins: plugins({ development }),
});

export default [
  buildConfig(),
  /* minified bundle will be deprecated in the next major */
  buildConfig({
    min: true,
  }),
  buildConfig({ development: true }),
];
