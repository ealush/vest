const path = require('path');

const fse = require('fs-extra');

const opts = require('vx/opts');
const once = require('vx/util/once');

module.exports = writeCJSMain;

function writeCJSMain({ isMain, rootPath }) {
  return {
    name: 'write-cjs-main',
    writeBundle: once(({ name }) => {
      let exportPath = rootPath;

      if (!isMain) {
        exportPath = path.join(exportPath, name);
        fse.ensureDirSync(exportPath);
        fse.writeJSONSync(
          path.join(exportPath, 'package.json'),
          packageJson(name)
        );
      }

      fse.writeFileSync(
        path.resolve(exportPath, opts.fileNames.MAIN_EXPORT),
        genEntry(name, isMain),
        'utf8'
      );
    }),
  };
}

function genEntry(moduleName, isMain) {
  return `'use strict'

if (process.env.NODE_ENV === '${opts.env.PRODUCTION}') {
  module.exports = require('${isMain ? '.' : '..'}/dist/${
    opts.format.CJS
  }/${moduleName}.${opts.env.PRODUCTION}.js')
} else {
  module.exports = require('${isMain ? '.' : '..'}/dist/${
    opts.format.CJS
  }/${moduleName}.${opts.env.DEVELOPMENT}.js')
}`;
}

function packageJson(name) {
  return {
    main: `./${opts.fileNames.MAIN_EXPORT}`,
    name,
    private: true,
    types: `../types/${name}.d.ts`,
  };
}
