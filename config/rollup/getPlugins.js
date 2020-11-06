const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const alias = require('@rollup/plugin-alias');
const { default: babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const { terser } = require('rollup-plugin-terser');

const { moduleAliases, filePaths } = require('../../util');

// This is not the real path. Find a way to fix it.

const aliases = moduleAliases.reduce(
  (aliases, { name: find, absolute: replacement }) =>
    aliases.concat({ find, replacement }),
  []
);

const NAME_ES5 = 'es5';
const FORMAT_UMD = 'umd';

module.exports = function ({ dev = false, format, min, libraryName, version }) {
  const babelEnv = () => {
    if (format === FORMAT_UMD && !dev) {
      return NAME_ES5;
    }

    return 'es6';
  };

  const envName = babelEnv();

  const PLUGINS = [
    alias({ entries: aliases }),
    resolve(),
    commonjs({
      include: /node_modules\/(anyone|n4s|wait|context)/,
    }),
    babel({
      configFile: filePaths.BABEL_CONFIG_PATH,
      babelHelpers: 'bundled',
      envName,
    }),
    replace({
      __LIB_VERSION__: JSON.stringify(version),
      LIBRARY_NAME: JSON.stringify(libraryName),
      __DEV__: dev === true,
    }),
  ];

  if (min) {
    PLUGINS.push(compiler(), terser());
  }

  return PLUGINS;
};
