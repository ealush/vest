const path = require('path');

const fs = require('fs-extra');

const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

const DIR_ESM = 'esm';

module.exports = (name = packageName()) => {
  const fullPath = vxPath.packageDist(name, DIR_ESM);

  fs.ensureDirSync(fullPath);

  fs.writeFileSync(
    path.join(fullPath, 'package.json'),
    JSON.stringify({ type: 'module' })
  );
};
