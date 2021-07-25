const path = require('path');

const fse = require('fs-extra');

const opts = require('vx/opts');
const packageName = require('vx/packageName');
const once = require('vx/util/once');
const packageJson = require('vx/util/packageJson');
const vxPath = require('vx/vxPath');

module.exports = writeCJSMain;

function writeCJSMain({ isMain, rootPath }) {
  return {
    name: 'write-cjs-main',
    writeBundle: once(({ name }) => {
      let exportPath = rootPath;

      if (!isMain) {
        exportPath = path.join(exportPath, name);
        fse.ensureDirSync(exportPath);
      }
      writePackageJson(name, isMain, exportPath);

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
  module.exports = require('${doubleDot(isMain)}/dist/${
    opts.format.CJS
  }/${moduleName}.${opts.env.PRODUCTION}.js')
} else {
  module.exports = require('${doubleDot(isMain)}/dist/${
    opts.format.CJS
  }/${moduleName}.${opts.env.DEVELOPMENT}.js')
}`;
}

function genPackageJson(name, isMain) {
  const mainExport = `./${opts.fileNames.MAIN_EXPORT}`;
  const moduleExport = [
    doubleDot(isMain),
    opts.dir.DIST,
    opts.format.ES,
    `${name}.${opts.env.PRODUCTION}.js`,
  ].join('/');
  const types = `${doubleDot(isMain)}/types/${name}.d.ts`;
  return {
    main: mainExport,
    module: moduleExport,
    name,
    types,
    ...(!isMain && { private: true }),
  };
}

function writePackageJson(name, isMain, exportPath) {
  let pkgJson = genPackageJson(name, isMain);

  if (isMain) {
    pkgJson = { ...packageJson(name), ...pkgJson };
  }

  fse.writeJSONSync(path.join(exportPath, 'package.json'), pkgJson, {
    spaces: 2,
  });
}

function doubleDot(isMain) {
  return isMain ? '.' : '..';
}
