const path = require('path');
const fs = require('fs-extra');

const DIR_ESM = 'esm';

module.exports = DIST_PATH => {
  const fullPath = path.join(DIST_PATH, DIR_ESM);

  fs.ensureDirSync(fullPath);

  fs.writeFileSync(
    path.join(fullPath, 'package.json'),
    JSON.stringify({ type: 'module' })
  );
};
