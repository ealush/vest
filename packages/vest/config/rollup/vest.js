const addEsmDir = require('../../../../config/rollup/addEsmDir');
const genConfig = require('../../../../config/rollup/genConfig');
const writeMainTemplate = require('../../../../config/rollup/writeMainTemplate');
const { packageDist, packageNames } = require('../../../../util');

addEsmDir(packageDist(packageNames.VEST));
writeMainTemplate(packageDist(packageNames.VEST), packageNames.VEST);

export default genConfig({
  distPath: packageDist(packageNames.VEST),
  esInput: 'vest.mjs.js',
  input: 'vest.js',
  libraryName: packageNames.VEST,
});
