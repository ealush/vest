const genConfig = require('../../../../config/rollup/genConfig');
const writeMainTemplate = require('../../../../scripts/build/writeMainTemplate');
const { packageDist, packageNames } = require('../../../../util');

const distPath = packageDist(packageNames.N4S);

writeMainTemplate('ensure', distPath);

export default genConfig({
  distPath,
  input: 'ensure/ensure.js',
  libraryName: 'ensure',
  packageName: packageNames.N4S,
});
