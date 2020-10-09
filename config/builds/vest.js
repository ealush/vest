import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import phrase from 'paraphrase/dollar';
import { terser } from 'rollup-plugin-terser';

const fs = require('fs-extra');

const { BABEL_CONFIG_PATH } = require('..');
const { PACKAGE_VEST } = require('../../shared/constants');
const { packagePath, packageJson } = require('../../util');

const { version } = packageJson(PACKAGE_VEST);
const PACKAGE_PATH = packagePath(PACKAGE_VEST);

const DIR_NAME_DIST = 'dist';
const ENV_DEVELOPMENT = 'development';
const ENV_PRODUCTION = 'production';
const NAME_ES5 = 'es5';
const FORMAT_UMD = 'umd';
const FORMAT_ES = 'es';
const FORMAT_CJS = 'cjs';
const DIR_ESM = 'esm';
const SRC_PATH = path.join(PACKAGE_PATH, 'src');
const DIST_PATH = path.join(PACKAGE_PATH, DIR_NAME_DIST);

addEsmDir();
copyMainTemplate(FORMAT_UMD);

export default [
  { format: FORMAT_ES, input: 'index.mjs', outputDir: DIR_ESM },
  { format: FORMAT_UMD },
  { format: FORMAT_CJS },
]
  .reduce(
    (configs, current) =>
      configs.concat(
        current,
        { ...current, dev: true },
        { ...current, min: true }
      ),
    []
  )
  .map(buildConfig);

function buildConfig({
  format,
  dev = false,
  min = false,
  input = 'index.js',
  outputDir = '',
} = {}) {
  return {
    input: path.join(SRC_PATH, input),
    output: {
      file: [
        path.join(DIST_PATH, outputDir, PACKAGE_VEST),
        nameByFormat(format),
        dev ? ENV_DEVELOPMENT : ENV_PRODUCTION,
        min ? 'min' : null,
        'js',
      ]
        .filter(Boolean)
        .join('.'),
      format: format || FORMAT_UMD,
      name: PACKAGE_VEST,
      ...(format === FORMAT_CJS && {
        exports: 'default',
      }),
    },
    plugins: plugins({ dev, format, min }),
  };
}

function plugins({ dev, format, min }) {
  const babelEnv = () => {
    if (format === FORMAT_UMD && !dev) {
      return NAME_ES5;
    }

    return 'es6';
  };

  const envName = babelEnv();

  const PLUGINS = [
    resolve(),
    commonjs({
      include: /node_modules\/(anyone|n4s)/,
    }),
    babel({
      configFile: BABEL_CONFIG_PATH,
      babelHelpers: 'bundled',
      envName,
    }),
    replace({
      VEST_VERSION: JSON.stringify(version),
      LIBRARY_NAME: JSON.stringify(PACKAGE_VEST),
      __DEV__: dev === true,
    }),
  ];

  if (min) {
    PLUGINS.push(compiler(), terser());
  }

  return PLUGINS;
}

function addEsmDir() {
  const fullPath = path.join(DIST_PATH, DIR_ESM);

  fs.ensureDirSync(fullPath);

  fs.writeFileSync(
    path.join(fullPath, 'package.json'),
    JSON.stringify({ type: 'module' })
  );
}

function copyMainTemplate(format) {
  const template = fs.readFileSync(
    path.join(__dirname, 'main.js.tmpl'),
    'utf-8'
  );
  const phrased = phrase(template, { name: PACKAGE_VEST, format });
  fs.writeFileSync(
    path.join(DIST_PATH, [PACKAGE_VEST, format, 'index', 'js'].join('.')),
    phrased
  );
}

function nameByFormat(format) {
  if (format === FORMAT_ES) {
    return 'mjs';
  }

  return format;
}
