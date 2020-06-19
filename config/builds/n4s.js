import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

const { BABEL_CONFIG_PATH } = require('..');
const { PACKAGE_N4S } = require('../../shared/constants');
const { packagePath } = require('../../util');

const DEFAULT_FORMAT = 'umd';

const PACKAGE_PATH = path.resolve(packagePath(PACKAGE_N4S));

const LIBRARY_NAME_ENFORCE = 'enforce';
const LIBRARY_NAME_ENSURE = 'ensure';

const pluginList = ({ libraryName } = {}) => [
  resolve(),
  replace({
    LIBRARY_NAME: JSON.stringify(libraryName),
  }),
  babel({
    babelrc: false,
    ...require(BABEL_CONFIG_PATH)(),
  }),
  compiler(),
  terser(),
];

const buildConfig = ({
  format = DEFAULT_FORMAT,
  extended = false,
  name = '',
} = {}) => ({
  input: path.join(
    PACKAGE_PATH,
    'src',
    extended ? 'extended' : '',
    name || '',
    'index.js'
  ),
  output: {
    name: name || LIBRARY_NAME_ENFORCE,
    format,
    file: [
      path.join(
        PACKAGE_PATH,
        'dist',
        extended ? 'extended' : '',
        name || PACKAGE_N4S
      ),
      'js',
    ]
      .filter(Boolean)
      .join('.'),
  },
  plugins: pluginList({ libraryName: name }),
});

const genConfig = (...args) => [buildConfig(...args)];

export default [
  ...genConfig({ name: LIBRARY_NAME_ENSURE }),
  ...genConfig(),
  ...genConfig({ name: LIBRARY_NAME_ENFORCE, extended: true }),
  ...genConfig({ name: LIBRARY_NAME_ENSURE, extended: true }),
];
