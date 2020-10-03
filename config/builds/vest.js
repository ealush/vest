import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

const fs = require('fs-extra');

const { BABEL_CONFIG_PATH } = require('..');
const { PACKAGE_VEST } = require('../../shared/constants');
const { packagePath, packageJson } = require('../../util');

const { version } = packageJson(PACKAGE_VEST);
const PACKAGE_PATH = packagePath(PACKAGE_VEST);

const DIR_NAME_DIST = 'dist';
const ENV_DEVELOPMENT = 'development';
const NAME_ES5 = 'es5';
const FORMAT_UMD = 'umd';
const FORMAT_ES = 'es';
const FORMAT_CJS = 'cjs';
const DIR_ESM = 'esm';

const DIST_PATH = path.join(PACKAGE_PATH, DIR_NAME_DIST);

const plugins = ({ name, format }) => {
  const babelEnv = () => {
    if ([FORMAT_CJS, FORMAT_ES].includes(format)) {
      return 'es6';
    }

    if ([NAME_ES5, 'min'].includes(name)) {
      return NAME_ES5;
    }

    if (name === ENV_DEVELOPMENT) {
      return ENV_DEVELOPMENT;
    }

    return NAME_ES5;
  };

  const envName = babelEnv();

  const PLUGINS = [
    resolve(),
    commonjs({
      include: /node_modules\/(anyone|n4s)/,
    }),
    babel({
      configFile: BABEL_CONFIG_PATH,
      envName,
    }),
    replace({
      VEST_VERSION: JSON.stringify(version),
      LIBRARY_NAME: JSON.stringify(PACKAGE_VEST),
      __DEV__: name === ENV_DEVELOPMENT,
    }),
  ];

  if (envName === NAME_ES5) {
    PLUGINS.push(compiler(), terser());
  }

  return PLUGINS;
};

const addEsmDir = () => {
  const fullPath = path.join(DIST_PATH, DIR_ESM);

  fs.ensureDirSync(fullPath);

  fs.writeFileSync(
    path.join(fullPath, 'package.json'),
    JSON.stringify({ type: 'module' })
  );
};

const buildConfig = ({
  format,
  name,
  input = 'index.js',
  outputDir = '',
} = {}) => ({
  input: path.join(PACKAGE_PATH, 'src', input),
  output: {
    file: [path.join(DIST_PATH, outputDir, PACKAGE_VEST), name, 'js']
      .filter(Boolean)
      .join('.'),
    format: format || FORMAT_UMD,
    name: PACKAGE_VEST,
    ...(format === FORMAT_CJS && {
      exports: 'default',
    }),
  },
  plugins: plugins({ name, format }),
});

addEsmDir();

export default [
  buildConfig({ format: FORMAT_UMD }),
  buildConfig({ name: NAME_ES5, format: FORMAT_UMD }),
  buildConfig({
    format: FORMAT_ES,
    input: 'index.mjs',
    name: 'mjs',
    outputDir: DIR_ESM,
  }),
  buildConfig({ format: FORMAT_CJS, name: FORMAT_CJS }),
  buildConfig({ name: ENV_DEVELOPMENT }),
  /* this bundle will be deprecated in the next major */
  buildConfig({
    name: 'min',
  }),
];
