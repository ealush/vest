const path = require('path');

const glob = require('glob');

const getPlugins = require('../../../../config/rollup/getPlugins');
const {
  packagePath,
  logger,
  packageNames,
  packageDist,
} = require('../../../../util');

const DIR_NAME_UTILITIES = 'utilities';
const JS_EXTENSION = '.js';

const renames = {
  enforceExtended: 'enforce',
};

const getFileName = filePath => path.basename(filePath, JS_EXTENSION);

const entries = glob
  .sync(packagePath(packageNames.VEST, 'src', DIR_NAME_UTILITIES, '*.js'))
  .map(input => {
    const fileName = getFileName(input);
    return {
      fileName,
      input,
      name: renames[fileName] || fileName,
      outputPath: path.join(
        packageDist(packageNames.VEST),
        [fileName, JS_EXTENSION].join('')
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
