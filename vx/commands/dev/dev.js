const exec = require('vx/exec');
const vxPath = require('vx/vxPath');

/**
 * Starts the file watcher to prepare packages on changes.
 */
module.exports = () => {
  exec(
    `${vxPath.vxRoot()}/node_modules/.bin/onchange -d 5000 -i -k ${vxPath.packageSrc(
      '*',
      '**/*.ts',
    )} ${vxPath.packageSrc('*', '**/*.ts')} -- vx prepare`,
  );
};
