const genConfig = require('../../../../config/rollup/genConfig');
const writeMainTemplate = require('../../../../scripts/build/writeMainTemplate');
const { packageDist, packageNames } = require('../../../../util');

const moduleName = 'enforceExtended';

writeMainTemplate(moduleName, packageDist(packageNames.N4S));

export default genConfig({
  distPath: packageDist(packageNames.N4S),
  input: ['extended', moduleName].join('/') + '.js',
  libraryName: 'enforceExtended',
  packageName: packageNames.N4S,
});
