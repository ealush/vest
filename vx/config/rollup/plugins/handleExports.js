const path = require('path');

const fse = require('fs-extra');

const opts = require('vx/opts');
const packageName = require('vx/packageName');
const listExportedModules = require('vx/util/listExportedModules');
const once = require('vx/util/once');
const packageJson = require('vx/util/packageJson');
const vxPath = require('vx/vxPath');

module.exports = handleExports;

function handleExports() {
  return {
    name: 'write-cjs-main',
    writeBundle: once(({ name }) => {
      const rootPath = vxPath.package();
      const isMain = name === packageName();

      let exportPath = rootPath;

      if (!isMain) {
        exportPath = joinPath(rootPath, name);
        fse.ensureDirSync(exportPath);
      }

      writePackageJson(name, isMain, exportPath);

      fse.writeFileSync(
        vxPath.package(packageName(), mainExport(name, true)),
        genEntry(name),
        'utf8'
      );
    }),
  };
}

function genEntry(moduleName) {
  const pkgName = packageName();
  const dist = (...args) =>
    vxPath.packageDist(pkgName, opts.format.CJS, ...args);
  return `'use strict'

if (process.env.NODE_ENV === '${opts.env.PRODUCTION}') {
  module.exports = require('./${path.relative(
    dist(),
    dist(exportName(moduleName, opts.env.PRODUCTION))
  )}');
} else {
  module.exports = require('./${path.relative(
    dist(),
    dist(exportName(moduleName, opts.env.DEVELOPMENT))
  )}');
}`;
}

function genPackageJson(name, isMain) {
  const moduleExport = joinPath(
    doubleDot(isMain),
    opts.dir.DIST,
    opts.format.ES,
    exportName(name, opts.env.PRODUCTION)
  );
  const main = mainExport(name, isMain);
  const types = joinPath(
    doubleDot(isMain),
    opts.dir.TYPES,
    fileName(name, 'd.ts')
  );
  return {
    main,
    module: moduleExport,
    name,
    types,
    ...(isMain
      ? {
          exports: {
            ...genExportedFiles(),
            /* eslint-disable sort-keys */
            '.': {
              browser: moduleExport,
              import: moduleExport,
              require: main,
              node: main,
              module: moduleExport,
              default: main,
            },
            /* eslint-enable sort-keys */
          },
        }
      : { private: true }),
  };
}

function writePackageJson(name, isMain, exportPath) {
  let pkgJson = genPackageJson(name, isMain);

  if (isMain) {
    pkgJson = { ...packageJson(name), ...pkgJson };
  }

  fse.writeJSONSync(joinPath(exportPath, 'package.json'), pkgJson, {
    spaces: 2,
  });
}

function joinPath(...paths) {
  return paths.join('/'); // this combats the trimming of the first dot in the path
}

function mainExport(name, isMain) {
  return joinPath(
    doubleDot(isMain),
    opts.dir.DIST,
    opts.format.CJS,
    fileName(name)
  );
}

function doubleDot(isMain) {
  return isMain ? '.' : '..';
}

function fileName(name, ext = 'js') {
  return [name, ext].join('.');
}

function exportName(name, env) {
  return fileName(`${name}.${env}`);
}

function genExportedFiles() {
  return [packageName()]
    .concat(listExportedModules())
    .reduce((files, moduleName) => {
      Object.values(opts.format).forEach(format => {
        [opts.env.PRODUCTION, opts.env.DEVELOPMENT].forEach(env => {
          files.push([
            joinPath('.', opts.dir.DIST, format, exportName(moduleName, env)),
          ]);
        });
      });
      return files.concat([
        [joinPath('.', fileName(moduleName)), mainExport(moduleName, true)],
      ]);
    }, [])
    .reduce((files, [moduleName, file = moduleName]) => {
      return Object.assign(files, {
        // Not a big fan of what's happening here
        // but I've seen issues with different bundlers
        // in which some required the file extension
        // while others did not.
        // This satisfies all bundlers.
        [moduleName]: file,
        [noExt(moduleName)]: file,
      });
    }, {});
}

function noExt(path) {
  return path.substring(0, path.lastIndexOf('.'));
}
