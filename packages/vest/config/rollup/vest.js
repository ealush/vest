const genConfig = require('../../../../config/rollup/genConfig');
const { packageDist, packageNames } = require('../../../../util');

export default genConfig({
  distPath: packageDist(packageNames.VEST),
  esInput: 'vest.mjs.js',
  input: 'vest.js',
  libraryName: packageNames.VEST,
});
