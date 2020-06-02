import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

const { BABEL_CONFIG_PATH } = require('..');
const { PACKAGE_NAME_N4S } = require('../../scripts/constants');
const { packagePath } = require('../../util');

const DEFAULT_FORMAT = 'umd';

const PACKAGE_PATH = path.resolve(packagePath(PACKAGE_NAME_N4S));

const LIBRARY_NAME_ENFORCE = 'enforce';
const LIBRARY_NAME_ENSURE = 'ensure';

const pluginList = ({ libraryName, min } = {}) =>
  [
    resolve(),
    replace({
      LIBRARY_NAME: JSON.stringify(libraryName || PACKAGE_NAME_N4S),
    }),
    babel({
      babelrc: false,
      ...require(BABEL_CONFIG_PATH)(),
    }),
    compiler(),
    min ? terser() : undefined,
  ].filter(Boolean);

const buildConfig = ({
  format = DEFAULT_FORMAT,
  min = false,
  name = '',
} = {}) => ({
  input: path.join(PACKAGE_PATH, 'src', name || '', 'index.js'),
  output: {
    name: name || LIBRARY_NAME_ENFORCE,
    format,
    file: [
      path.join(PACKAGE_PATH, 'dist', name || PACKAGE_NAME_N4S),
      min && 'min',
      format !== DEFAULT_FORMAT && format,
      'js',
    ]
      .filter(Boolean)
      .join('.'),
  },
  plugins: pluginList({ libraryName: name, min }),
});

const genConfig = ({ name } = {}) => [
  buildConfig({ name }),
  buildConfig({ name, min: true }),
];

export default [
  ...genConfig({ name: LIBRARY_NAME_ENFORCE }),
  ...genConfig({ name: LIBRARY_NAME_ENSURE }),
  ...genConfig(),
];
