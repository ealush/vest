const addEsmDir = require('../../../../config/rollup/addEsmDir');
const genConfig = require('../../../../config/rollup/genConfig');
const writeMainTemplate = require('../../../../config/rollup/writeMainTemplate');
const { PACKAGE_VEST } = require('../../../../shared/constants');
const { packageDist } = require('../../../../util');

addEsmDir(packageDist(PACKAGE_VEST));
writeMainTemplate(packageDist(PACKAGE_VEST), PACKAGE_VEST);

export default genConfig({
  distPath: packageDist(PACKAGE_VEST),
  libraryName: PACKAGE_VEST,
  esInput: 'index.mjs',
});
