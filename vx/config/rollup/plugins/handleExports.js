const path = require('path');

const fse = require('fs-extra');

const opts = require('vx/opts');
const { listExportedModules } = require('vx/util/exportedModules');
const once = require('vx/util/once');
const packageJson = require('vx/util/packageJson');
const rootPackageJson = require('vx/util/rootPackageJson');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

module.exports = function handleExports({ namespace } = {}) {
  return {
    name: 'write-cjs-main',
    writeBundle: once(({ name }) => {
      const rootPath = vxPath.package();

      let exportPath = rootPath;

      const shouldNest = !isMainExport(name);

      if (shouldNest) {
        exportPath = joinPath(rootPath, namespace, name);
        fse.ensureDirSync(exportPath);
      }
      writePackageJson(name, exportPath, { namespace });

      writeEntry(name);
    }),
  };
};

function writeEntry(name) {
  const pkgName = usePackage();
  const dist = (...args) =>
    vxPath.packageDist(pkgName, opts.format.CJS, ...args);
  const content = `'use strict'

if (process.env.NODE_ENV === '${opts.env.PRODUCTION}') {
  module.exports = require('./${path.relative(
    dist(),
    dist(exportName(name, opts.env.PRODUCTION))
  )}');
} else {
  module.exports = require('./${path.relative(
    dist(),
    dist(exportName(name, opts.env.DEVELOPMENT))
  )}');
}`;

  const mainExportPath = genDistPath(name, {
    format: opts.format.CJS,
    env: null,
  });

  fse.writeFileSync(vxPath.package(pkgName, mainExportPath), content, 'utf8');
}

function writePackageJson(name, exportPath, { namespace } = {}) {
  let pkgJson = generatePackageJson(name, namespace);

  if (isMainExport(name)) {
    pkgJson = { ...packageJson(name), ...pkgJson };
  }

  fse.writeJSONSync(
    joinPath(exportPath, opts.fileNames.PACKAGE_JSON),
    pkgJson,
    {
      spaces: 2,
    }
  );
}

function generatePackageJson(moduleName, namespace) {
  if (!isMainExport(moduleName)) {
    return {
      ...genPackgeJsonBase(moduleName, {
        namespace,
        isNested: true,
      }),
      private: true,
    };
  }

  return {
    ...genPackgeJsonBase(moduleName, { namespace }),
    ...genRepoDetails(moduleName),
    exports: {
      ...genExportedFilesInMainPackageJson(),
      ...genExports(moduleName, namespace),
    },
  };
}

function genPackgeJsonBase(moduleName, { namespace, isNested = false }) {
  let prefix = '.';
  if (isNested) {
    prefix = namespace ? '../..' : '..';
  }

  /* eslint-disable sort-keys */
  const cjsPath = genDistPath(moduleName, {
    prefix,
    namespace,
    format: opts.format.CJS,
    env: null,
  });

  const esPath = genDistPath(moduleName, {
    prefix,
    namespace,
    format: opts.format.ES,
    env: opts.env.PRODUCTION,
  });

  const umdPath = genDistPath(moduleName, {
    prefix,
    namespace,
    format: opts.format.UMD,
    env: opts.env.PRODUCTION,
  });

  const umdExports = {
    unpkg: umdPath,
    jsdelivr: umdPath,
  };

  const typesPath = genTypesPath(moduleName, { prefix, namespace });

  return {
    main: cjsPath,
    module: esPath,
    ...umdExports,
    name: moduleName,
    types: typesPath,
  };
}

function genExports(moduleName, namespace) {
  /* eslint-disable sort-keys */
  return {
    '.': {
      [opts.env.DEVELOPMENT]: genMainPackageJSONFileExports(moduleName, {
        env: opts.env.DEVELOPMENT,
        namespace,
      }),
      ...genMainPackageJSONFileExports(moduleName, {
        env: opts.env.PRODUCTION,
        namespace,
      }),
    },
    './package.json': './package.json',
    './': './',
  };
}

function genExportedFilesInMainPackageJson() {
  return listExportedModules().reduce((modules, [moduleName, namespace]) => {
    const currentModule = {};
    modules['./' + path.join(...filterFalsy([namespace, moduleName]))] =
      currentModule;

    [opts.env.PRODUCTION, opts.env.DEVELOPMENT].reduce((currentModule, env) => {
      currentModule[env] = genMainPackageJSONFileExports(moduleName, {
        namespace,
        env,
      });

      return currentModule;
    }, currentModule);

    Object.assign(
      currentModule,
      genMainPackageJSONFileExports(moduleName, {
        namespace,
      })
    );

    return modules;
  }, {});
}

function genMainPackageJSONFileExports(
  moduleName,
  { env = opts.env.PRODUCTION, namespace = undefined }
) {
  const prefix = '.';
  const cjsPath = genDistPath(moduleName, {
    prefix,
    namespace,
    format: opts.format.CJS,
    env,
  });
  const esPath = genDistPath(moduleName, {
    prefix,
    namespace,
    format: opts.format.ES,
    env,
  });
  const umdPath = genDistPath(moduleName, {
    prefix,
    namespace,
    format: opts.format.UMD,
    env,
  });

  const types = genTypesPath(moduleName, { prefix, namespace });

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

function genRepoDetails(name) {
  const rootPkgJson = rootPackageJson();

  return {
    ...(rootPkgJson?.repository && {
      repository: {
        ...rootPkgJson?.repository,
        directory: path.join(opts.dir.PACKAGES, name),
      },
      bugs: {
        url: `${rootPkgJson?.repository.url}/issues`,
      },
    }),
  };
}

function isMainExport(name) {
  return usePackage() === name;
}

function joinPath(...paths) {
  return paths.filter(Boolean).join(path.sep); // this combats the trimming of the first dot in the path
}

function genDistPath(
  moduleName,
  {
    namespace = undefined,
    env = opts.env.PRODUCTION,
    format = opts.format.CJS,
    prefix,
  }
) {
  return joinPath(
    // add nesting level
    ...filterFalsy([
      prefix,
      opts.dir.DIST,
      format,
      namespace,
      exportName(moduleName, env),
    ])
  );
}

function genTypesPath(moduleName, { namespace = undefined, prefix }) {
  return joinPath(
    // add nesting level
    ...filterFalsy([
      prefix,
      opts.dir.TYPES,
      namespace,
      fileName(moduleName, 'd.ts'),
    ])
  );
}

function exportName(name, env) {
  return fileName(filterFalsy([name, env]).join('.'));
}

function filterFalsy(arr) {
  return arr.filter(Boolean);
}

function fileName(name, ext = 'js') {
  return [name, ext].join('.');
}
