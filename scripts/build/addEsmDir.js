const path = require('path');

const fs = require('fs-extra');

const { packageDist } = require('../../util');

const DIR_ESM = 'esm';

module.exports = packageName => {
  const fullPath = packageDist(packageName, DIR_ESM);

  fs.ensureDirSync(fullPath);

  fs.writeFileSync(
    path.join(fullPath, 'package.json'),
    JSON.stringify({ type: 'module' })
  );
};
