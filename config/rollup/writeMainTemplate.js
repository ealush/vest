const fs = require('fs');
const path = require('path');

const FORMAT_UMD = 'umd';

module.exports = (distPath, name) =>
  fs.writeFileSync(
    path.join(distPath, [name, 'js'].join('.')),
    `'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${name}.${FORMAT_UMD}.production.min.js')
} else {
  module.exports = require('./${name}.${FORMAT_UMD}.development.js')
}`,
    'utf8'
  );
