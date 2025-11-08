const exec = require('vx/exec');
const vxPath = require('vx/vxPath');

module.exports = () => {
  exec(
    `${vxPath.vxRoot()}/node_modules/.bin/onchange -d 5000 -i -k ${vxPath.packageSrc(
      '*',
      '**/*.ts',
    )} ${vxPath.packageSrc('*', '**/*.ts')} -- vx prepare`,
  );
};
