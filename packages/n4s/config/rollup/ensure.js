const genConfig = require('../../../../config/rollup/genConfig');
const writeMainTemplate = require('../../../../config/rollup/writeMainTemplate');
const { PACKAGE_N4S } = require('../../../../shared/constants');
const { packageDist } = require('../../../../util');

writeMainTemplate(packageDist(PACKAGE_N4S), 'ensure');

export default genConfig({
  distPath: packageDist(PACKAGE_N4S),
  input: 'ensure/index.js',
  libraryName: 'ensure',
  packageName: PACKAGE_N4S,
});
