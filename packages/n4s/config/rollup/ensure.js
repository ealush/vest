const genConfig = require('../../../../config/rollup/genConfig');
const writeMainTemplate = require('../../../../config/rollup/writeMainTemplate');
const { packageDist, packageNames } = require('../../../../util');

writeMainTemplate(packageDist(packageNames.N4S), 'ensure');

export default genConfig({
  distPath: packageDist(packageNames.N4S),
  input: 'ensure/ensure.js',
  libraryName: 'ensure',
  packageName: packageNames.N4S,
});
