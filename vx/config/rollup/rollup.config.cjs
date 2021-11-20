const fs = require('fs');

const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const replace = require('@rollup/plugin-replace');
const _ = require('lodash');
const { terser } = require('rollup-plugin-terser');
const ts = require('rollup-plugin-ts');

const concatTruthy = require('../../util/concatTruthy');
const joinTruthy = require('../../util/joinTruthy');
const listExportedModules = require('../../util/listExportedModules');
const packageJson = require('../../util/packageJson');

const addCJSPackageJson = require('./plugins/addCJSPackageJson');
const addModulePackageJson = require('./plugins/addModulePackageJson');
const handleExports = require('./plugins/handleExports');

const opts = require('vx/opts');
const packageNames = require('vx/packageNames');
const moduleAliases = require('vx/util/moduleAliases')();
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const isWatchModeOn = JSON.parse(process.env.ROLLUP_WATCH ?? false);

module.exports = cleanupConfig(
  concatTruthy(!isWatchModeOn && opts.env.PRODUCTION, opts.env.DEVELOPMENT).map(
    env => {
      const packageName = usePackage();

      const customConfigPath = vxPath.packageConfigPath(
        packageName,
        opts.fileNames.VX_BUILD
      );

      let customConfig;

      if (fs.existsSync(customConfigPath)) {
        customConfig = require(customConfigPath);
      }

      return [].concat(
        genBaseConfig({ env, packageName }),
        genExportsConfig(usePackage(), env),
        customConfig?.({
          getInputFile,
          getPlugins: (options = {}) =>
            getPlugins({ env, packageName, ...options }),
          genOutput: (options = {}) => genOutput({ env, ...options }),
        }) ?? []
      );
    }
  )
);

function cleanupConfig(configs) {
  return []
    .concat(...configs)
    .filter(Boolean)
    .map(({ input, output, plugins }) => ({ input, output, plugins }));
}

function genBaseConfig({
  env,
  packageName,
  moduleName = usePackage(),
  namespace = undefined,
}) {
  return {
    env,
    input: getInputFile(moduleName),
    output: genOutput({ env, moduleName, namespace }),
    plugins: getPlugins({ env, moduleName, namespace, packageName }),
  };
}

function genExportsConfig(pkgName, env) {
  return listExportedModules(pkgName).map(([moduleName, namespace]) =>
    genBaseConfig({ env, moduleName, namespace })
  );
}

function genOutput({
  moduleName = usePackage(),
  env,
  namespace = undefined,
} = {}) {
  const base = {
    exports: 'auto',
    name: moduleName,
  };

  return [
    outputByFormat(opts.format.ES),
    outputByFormat(opts.format.UMD),
    outputByFormat(opts.format.CJS),
  ];

  function outputByFormat(format) {
    return {
      ...base,
      format,
      file: vxPath.packageDist(
        usePackage(),
        format,
        namespace,
        joinTruthy([moduleName, env, 'js'], '.')
      ),
    };
  }
}

function getInputFile(moduleName = usePackage()) {
  const modulePath = moduleAliases.find(ref => ref.name === moduleName);

  if (!(modulePath?.absolute && fs.existsSync(modulePath.absolute))) {
    throw new Error('unable to find module path for ' + moduleName);
  }

  return modulePath.absolute;
}

function getPlugins({
  env = opts.env.PRODUCTION,
  packageName = usePackage(),
  moduleName = packageName,
  namespace = undefined,
} = {}) {
  const plugins = [
    replace({
      preventAssignment: true,
      values: {
        __LIB_VERSION__: JSON.stringify(packageJson().version),
        LIBRARY_NAME: moduleName,
        __DEV__: env === opts.env.DEVELOPMENT,
      },
    }),
    ts({
      tsconfig: resolvedConfig => {
        const clonedConfig = _.cloneDeep(resolvedConfig);

        // The changes made in this function allow using the already installed
        // module instead of embedding of the code.

        // Remove installed local packages paths list
        for (const dep in packageJson().dependencies) {
          if (packageNames.names[dep]) {
            delete clonedConfig.paths[dep];
          }
        }

        if (packageName === moduleName) {
          return clonedConfig;
        }

        // Removes current package from the paths list if in an "exported" module
        delete clonedConfig.paths[packageName];

        return clonedConfig;
      },
      browserList: ['IE10'],
      hook: {
        outputPath: (path, kind) => {
          const basePath = vxPath.package(
            usePackage(),
            opts.dir.TYPES,
            namespace,
            moduleName + '.d.ts'
          );

          if (kind === 'declaration') return basePath;
          if (kind === 'declarationMap') return basePath + '.map';
        },
      },
    }),
  ];

  if (env === opts.env.PRODUCTION) {
    plugins.push(
      compiler(),
      terser(),
      handleExports({ namespace }),
      addModulePackageJson(),
      addCJSPackageJson()
    );
  }

  return plugins;
}
