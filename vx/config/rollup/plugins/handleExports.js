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
  const esPath = genDistPath(name, opts.format.ES, opts.env.PRODUCTION);
  const cjsPath = genDistPath(name, opts.format.CJS);
  return {
    main: cjsPath,
    module: esPath,
    name,
    types: typesPath(name),
    ...(isMain
      ? {
          exports: {
            ...genExportedFiles(),
            /* eslint-disable sort-keys */
            '.': {
              ...exportsOrder(name),
            },
            './package.json': './package.json',
            './': './',
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
  return fileName([name, env].filter(Boolean).join('.'));
}

function genExportedFiles() {
  // const exportedModules = [packageName(), ...listExportedModules()];

  return listExportedModules().reduce((modules, moduleName) => {
    const currentModule = {};
    modules[`./${moduleName}`] = currentModule;

    [opts.env.PRODUCTION, opts.env.DEVELOPMENT].reduce((currentModule, env) => {
      currentModule[env] = exportsOrder(moduleName, env);

      return currentModule;
    }, currentModule);

    Object.assign(currentModule, exportsOrder(moduleName));

    return modules;
  }, {});
}

function exportsOrder(moduleName, env = undefined) {
  const esPath = genDistPath(
    moduleName,
    opts.format.ES,
    env ?? opts.env.PRODUCTION
  );
  const cjsPath = genDistPath(moduleName, opts.format.CJS, env);
  const umdPath = genDistPath(
    moduleName,
    opts.format.UMD,
    env ?? opts.env.PRODUCTION
  );

  /* eslint-disable sort-keys */
  return {
    browser: esPath,
    umd: umdPath,
    import: esPath,
    require: cjsPath,
    node: cjsPath,
    module: esPath,
    default: cjsPath,
  };
  /* eslint-enable sort-keys */
}

function genDistPath(moduleName, moduleType, env) {
  return joinPath('.', opts.dir.DIST, moduleType, exportName(moduleName, env));
}

const typesPath = moduleName =>
  joinPath('.', opts.dir.TYPES, fileName(moduleName, 'd.ts'));
