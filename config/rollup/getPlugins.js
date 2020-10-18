const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const { default: babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const { default: resolve } = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const { terser } = require('rollup-plugin-terser');

// This is not the real path. Find a way to fix it.
const { BABEL_CONFIG_PATH } = require('../../config');

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
