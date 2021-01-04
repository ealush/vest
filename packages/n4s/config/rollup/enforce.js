const genConfig = require('../../../../config/rollup/genConfig');
const { packageDist, packageNames } = require('../../../../util');

export default genConfig({
  libraryName: packageNames.N4S,
  distPath: packageDist(packageNames.N4S),
  input: 'enforce.js',
});
