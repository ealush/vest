const genConfig = require('../../../../config/rollup/genConfig');
const { packageDist, packageNames } = require('../../../../util');

export default genConfig({
  distPath: packageDist(packageNames.N4S),
  input: 'extended/enforceExtended.js',
  libraryName: 'enforceExtended',
  packageName: packageNames.N4S,
});
