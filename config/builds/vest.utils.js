import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import glob from 'glob';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

const { BABEL_CONFIG_PATH } = require('..');
const { PACKAGE_VEST } = require('../../shared/constants');
const { logger } = require('../../util');
const { packagePath } = require('../../util');

const DIR_NAME_UTILITIES = 'utilities';
const JS_EXTENSION = '.js';

const renames = {
  enforceExtended: 'enforce',
};

const getFileName = filePath => path.basename(filePath, JS_EXTENSION);

const entries = glob
  .sync(packagePath(PACKAGE_VEST, 'src', DIR_NAME_UTILITIES, '*.js'))
  .map(input => {
    const fileName = getFileName(input);
    return {
      fileName,
      input,
      name: renames[fileName] || fileName,
      outputPath: packagePath(
        PACKAGE_VEST,
        'dist',
        [fileName, JS_EXTENSION].join('')
      ),
    };
  });

const plugins = ({ fileName }) => [
  resolve(),
  commonjs({
    include: /node_modules\/(anyone|n4s)/,
  }),
  babel({
    babelrc: false,
    ...require(BABEL_CONFIG_PATH)(),
  }),
  replace({
    LIBRARY_NAME: JSON.stringify(renames[fileName] || fileName),
  }),
  compiler(),
  terser(),
];

const buildConfig = ({ input, name, outputPath, fileName }) => {
  logger.info(`⚙️ Building utility: ${name}`);
  return {
    input,
    output: {
      format: 'umd',
      file: outputPath,
      name,
    },
    plugins: plugins({ fileName }),
  };
};

export default entries.map(buildConfig);
