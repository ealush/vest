const fs = require('fs');
const path = require('path');

const { envNames, packageDist } = require('../../util');

const FORMAT_UMD = 'umd';

module.exports = (name, distPath = packageDist(name)) => {
  return fs.writeFileSync(
    path.join(distPath, [name, 'js'].join('.')),
    `'use strict'

if (process.env.NODE_ENV === '${envNames.PRODUCTION}') {
  module.exports = require('./${name}.${FORMAT_UMD}.${envNames.PRODUCTION}.min.js')
} else {
  module.exports = require('./${name}.${FORMAT_UMD}.${envNames.DEVELOPMENT}.js')
}`,
    'utf8'
  );
};
