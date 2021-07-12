const exec = require('vx/exec');
const vxPath = require('vx/vxPath');

module.exports = () => {
  exec(
    // TODO: Improve this. Probably by moving onchange into vx
    `${vxPath.vxRoot()}/node_modules/.bin/onchange -d 5000 -i -k ${vxPath.packageSrc(
      '*',
      '**/*.ts'
    )} ${vxPath.packageSrc('*', '**/*.ts')} -- vx tsconfig`
  );
};
