const fs = require('fs');
const path = require('path');

const opts = require('vx/opts');
const packageName = require('vx/packageName');
const vxPath = require('vx/vxPath');

module.exports = (
  pkgName = packageName(),
  distPath = vxPath.packageDist(pkgName)
) => {
  return fs.writeFileSync(
    path.join(distPath, 'index.js'),
    `'use strict'

if (process.env.NODE_ENV === '${opts.env.PRODUCTION}') {
  module.exports = require('./${opts.format.CJS}/${pkgName}.${opts.env.PRODUCTION}.js')
} else {
  module.exports = require('./${opts.format.CJS}/${pkgName}.${opts.env.DEVELOPMENT}.js')
}`,
    'utf8'
  );
};
