const addEsmDir = require('../../../../config/rollup/addEsmDir');
const genConfig = require('../../../../config/rollup/genConfig');
const writeMainTemplate = require('../../../../config/rollup/writeMainTemplate');
const { packageDist, packageNames } = require('../../../../util');

addEsmDir(packageDist(packageNames.N4S));
writeMainTemplate(packageDist(packageNames.N4S), packageNames.N4S);

export default genConfig({
  libraryName: packageNames.N4S,
  distPath: packageDist(packageNames.N4S),
  input: 'enforce/enforce.js',
});
