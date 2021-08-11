const fs = require('fs');

module.exports = writeFileSync;

function writeFileSync(filePath, data, options) {
  return fs.writeFileSync(filePath, data, options);
}
