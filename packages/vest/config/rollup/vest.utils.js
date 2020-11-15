const path = require('path');

const glob = require('glob');

const getPlugins = require('../../../../config/rollup/getPlugins');
const {
  logger,
  packageNames,
  packageDist,
  packageSrc,
} = require('../../../../util');

const DIR_NAME_UTILITIES = 'utilities';
const JS_EXTENSION = '.js';

const renames = {
  enforceExtended: 'enforce',
};

const getFileName = filePath => path.basename(filePath, JS_EXTENSION);

const entries = glob
  .sync(packageSrc(packageNames.VEST, DIR_NAME_UTILITIES, '*' + JS_EXTENSION))
  .map(input => {
    const fileName = getFileName(input);
    return {
      fileName,
      input,
      name: renames[fileName] || fileName,
      outputPath: path.join(
        packageDist(packageNames.VEST),
        [fileName.split('@')[0], JS_EXTENSION].join('')
      ),
    };
  });

const buildConfig = ({ input, name, outputPath, fileName }) => {
  logger.info(`⚙️ Building utility: ${name}`);
  return {
    input,
    output: {
      format: 'umd',
      file: outputPath,
      name,
    },
    plugins: getPlugins({
      min: true,
      libraryName: JSON.stringify(renames[fileName] || fileName),
      format: 'umd',
    }),
  };
};

export default entries.map(buildConfig);
