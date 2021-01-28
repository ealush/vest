const path = require('path');

const glob = require('glob');

const genConfig = require('../../../../config/rollup/genConfig');
const {
  packageDist,
  packageNames,
  packagePath,
  filePaths,
} = require('../../../../util');

const config = glob
  .sync('./*.js', {
    cwd: packagePath(packageNames.ANYONE, filePaths.DIR_NAME_SRC),
    absolute: true,
  })
  .reduce(
    (configs, file) =>
      configs.concat(
        genConfig({
          distPath: packageDist(packageNames.ANYONE),
          input: path.basename(file),
          libraryName: path.basename(file, '.js'),
          packageName: packageNames.ANYONE,
        })
      ),
    [
      ...genConfig({
        distPath: packageDist(packageNames.ANYONE),
        input: 'anyone',
        libraryName: 'anyone',
        packageName: packageNames.ANYONE,
      }),
    ]
  );

export default config;
