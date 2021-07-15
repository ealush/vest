const path = require('path');

const fse = require('fs-extra');

const opts = require('vx/opts');

module.exports = writeCJSMain;

function writeCJSMain({ moduleName, isMain, rootPath }) {
  return {
    name: 'write-cjs-main',
    buildEnd: async () => {
      let mainPath = rootPath;

      if (!isMain) {
        mainPath = path.join(mainPath, moduleName);
        fse.ensureDirSync(mainPath);

        fse.writeJSONSync(
          path.join(mainPath, 'package.json'),
          packageJson(moduleName)
        );
      }

      fse.writeFileSync(
        path.resolve(mainPath, 'index.js'),
        genEntry(moduleName, isMain),
        'utf8'
      );
    },
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
    main: `./index.js`,
    name,
    private: true,
    types: `../types/${name}.d.ts`,
  };
}
