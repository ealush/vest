import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import glob from 'glob';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const { BABEL_CONFIG_PATH } = require('..');
const { PACKAGE_NAME_VEST } = require('../../scripts/constants');
const { logger } = require('../../util');
const { packagePath } = require('../../util');

const DIR_NAME_UTILITIES = 'utilities';
const JS_EXTENSION = '.js';

const entries = glob
  .sync(packagePath(PACKAGE_NAME_VEST, 'src', DIR_NAME_UTILITIES, '*.js'))
  .map(input => {
    const fileName = path.basename(input, JS_EXTENSION);
    return {
      input,
      outputPath: packagePath(
        PACKAGE_NAME_VEST,
        'dist',
        DIR_NAME_UTILITIES,
        [fileName, JS_EXTENSION].join('')
      ),
      name: fileName,
    };
  });

const PLUGINS = [
  resolve(),
  commonjs({
    include: /node_modules\/(anyone|n4s)/,
  }),
  babel({
    babelrc: false,
    ...require(BABEL_CONFIG_PATH)(),
  }),
  compiler(),
  terser(),
];

const buildConfig = ({ input, name, outputPath }) => {
  logger.info(`⚙️ Building utility: ${name}`);

  return {
    input,
    output: {
      format: 'umd',
      file: outputPath,
      name,
    },
    plugins: PLUGINS,
  };
};

export default entries.map(buildConfig);
