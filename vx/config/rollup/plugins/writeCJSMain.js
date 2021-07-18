const path = require('path');

const fse = require('fs-extra');

const opts = require('vx/opts');
const once = require('vx/util/once');

module.exports = writeCJSMain;

function writeCJSMain({ isMain, rootPath }) {
  return {
    name: 'write-cjs-main',
    writeBundle: once(({ name, ...opts }) => {
      let mainPath = rootPath;

      if (!isMain) {
        mainPath = path.join(mainPath, name);
        fse.ensureDirSync(mainPath);

        fse.writeJSONSync(
          path.join(mainPath, 'package.json'),
          packageJson(name)
        );
      }

      fse.writeFileSync(
        path.resolve(mainPath, opts.fileNames.MAIN_EXPORT),
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
    main: `./index.js`,
    name,
    private: true,
    types: `../types/${name}.d.ts`,
  };
}
