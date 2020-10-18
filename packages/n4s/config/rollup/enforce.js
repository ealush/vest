const addEsmDir = require('../../../../config/rollup/addEsmDir');
const genConfig = require('../../../../config/rollup/genConfig');
const writeMainTemplate = require('../../../../config/rollup/writeMainTemplate');
const { PACKAGE_N4S } = require('../../../../shared/constants');
const { packageDist } = require('../../../../util');

addEsmDir(packageDist(PACKAGE_N4S));
writeMainTemplate(packageDist(PACKAGE_N4S), PACKAGE_N4S);

export default genConfig({
  libraryName: PACKAGE_N4S,
  distPath: packageDist(PACKAGE_N4S),
});
