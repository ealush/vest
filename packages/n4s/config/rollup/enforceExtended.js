const genConfig = require('../../../../config/rollup/genConfig');
const { PACKAGE_N4S } = require('../../../../shared/constants');
const { packageDist } = require('../../../../util');

export default genConfig({
  distPath: packageDist(PACKAGE_N4S),
  input: 'extended/enforce/index.js',
  libraryName: 'enforceExtended',
  packageName: PACKAGE_N4S,
});
