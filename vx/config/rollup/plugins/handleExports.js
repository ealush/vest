const path = require('path');

const fse = require('fs-extra');

const opts = require('vx/opts');
const listExportedModules = require('vx/util/listExportedModules');
const once = require('vx/util/once');
const packageJson = require('vx/util/packageJson');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

module.exports = handleExports;

const rootPackageJson = require(path.join(vxPath.ROOT_PATH, 'package.json'));

function isMain(name) {
  return usePackage() === name;
}

function handleExports({ namespace } = {}) {
  return {
    name: 'write-cjs-main',
    writeBundle: once(({ name }) => {
      const rootPath = vxPath.package();

      let exportPath = rootPath;

      if (!isMain(name)) {
        exportPath = joinPath(rootPath, namespace, name);
        fse.ensureDirSync(exportPath);
      }

      writePackageJson(name, exportPath, namespace);

      fse.writeFileSync(
        vxPath.package(usePackage(), mainExport(name)),
        genEntry(name),
        'utf8'
      );
    }),
  };
}

function genEntry(moduleName) {
  const pkgName = usePackage();
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

function genPackageJson(name, namespace) {
  const isTopLevel = isMain(name);
  const esPath = genDistPath(
    isTopLevel,
    namespace,
    name,
    opts.format.ES,
    opts.env.PRODUCTION
  );
  const cjsPath = genDistPath(isTopLevel, namespace, name, opts.format.CJS);
  return {
    main: cjsPath,
    module: esPath,
    name,
    types: typesPath([name, namespace]),
    ...(isTopLevel
      ? {
          exports: {
            ...genExportedFiles(),
            /* eslint-disable sort-keys */
            '.': {
              [opts.env.DEVELOPMENT]: {
                ...exportsOrder([name], opts.env.DEVELOPMENT),
              },
              ...exportsOrder([name]),
            },
            './package.json': './package.json',
            './': './',
            /* eslint-enable sort-keys */
          },
          ...(rootPackageJson?.repository && {
            repository: {
              ...rootPackageJson?.repository,
              directory: path.join(opts.dir.PACKAGES, name),
            },
            bugs: {
              url: `${rootPackageJson?.repository.url}/issues`,
            },
          }),
        }
      : { private: true }),
  };
}

function writePackageJson(name, exportPath, namespace) {
  let pkgJson = genPackageJson(name, namespace);

  if (isMain(name)) {
    pkgJson = { ...packageJson(name), ...pkgJson };
  }

  fse.writeJSONSync(joinPath(exportPath, 'package.json'), pkgJson, {
    spaces: 2,
  });
}

function joinPath(...paths) {
  return paths.filter(Boolean).join(path.sep); // this combats the trimming of the first dot in the path
}

function mainExport(name) {
  return joinPath(opts.dir.DIST, opts.format.CJS, fileName(name));
}

function singleDot(isMain) {
  return isMain ? '.' : '..';
}

function fileName(name, ext = 'js') {
  return [name, ext].join('.');
}

function exportName(name, env) {
  return fileName([name, env].filter(Boolean).join('.'));
}

function genExportedFiles() {
  return listExportedModules().reduce((modules, [moduleName, namespace]) => {
    const currentModule = {};
    modules[`./${moduleName}`] = currentModule;

    [opts.env.PRODUCTION, opts.env.DEVELOPMENT].reduce((currentModule, env) => {
      currentModule[env] = exportsOrder([moduleName, namespace], env);

      return currentModule;
    }, currentModule);

    Object.assign(currentModule, exportsOrder([moduleName, namespace]));

    return modules;
  }, {});
}

function exportsOrder([moduleName, namespace], env = undefined) {
  const isTopLevel = true;
  const esPath = genDistPath(
    isTopLevel,
    namespace,
    moduleName,
    opts.format.ES,
    env ?? opts.env.PRODUCTION
  );
  const cjsPath = genDistPath(
    isTopLevel,
    namespace,
    moduleName,
    opts.format.CJS,
    env
  );

  const umdPath = genDistPath(
    isTopLevel,
    namespace,
    moduleName,
    opts.format.UMD,
    env ?? opts.env.PRODUCTION
  );

  const types = typesPath([moduleName, namespace], /* isMain */ true);

  /* eslint-disable sort-keys */
  return {
    types,
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

// eslint-disable-next-line max-params
function genDistPath(isTopLevel, namespace, moduleName, moduleType, env) {
  return joinPath(
    singleDot(isTopLevel),
    levelUp(namespace),
    opts.dir.DIST,
    moduleType,
    namespace,
    exportName(moduleName, env)
  );
}

const typesPath = ([moduleName, namespace], isTopLevel) =>
  joinPath(
    singleDot(isTopLevel ?? isMain(moduleName)),
    levelUp(namespace),
    opts.dir.TYPES,
    namespace,
    fileName(moduleName, 'd.ts')
  );

function levelUp(value) {
  return value ? '..' : undefined;
}
