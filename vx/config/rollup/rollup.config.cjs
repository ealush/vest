const fs = require('fs');

const { format } = require('./format');
const getPlugins = require('./getPlugins');

const opts = require('vx/opts');
const concatTruthy = require('vx/util/concatTruthy');
const joinTruthy = require('vx/util/joinTruthy');
const listExportedModules = require('vx/util/listExportedModules');
const moduleAliases = require('vx/util/moduleAliases')();
const packageJson = require('vx/util/packageJson');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const buildSingle = JSON.parse(
  process.env.ROLLUP_WATCH ?? process.env.VX_BUILD_SINGLE ?? false
);

const modulesPerPackage = moduleAliases.reduce(
  (accumulator, currentPackage) =>
    Object.assign(accumulator, {
      [currentPackage.packageName]: currentPackage.modules,
    }),
  {}
);

module.exports = cleanupConfig(
  concatTruthy(!buildSingle && opts.env.PRODUCTION, opts.env.DEVELOPMENT).map(
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
    .map(({ input, output, plugins, external }) => ({
      external,
      input,
      output,
      plugins,
    }));
}

function genBaseConfig({
  env,
  packageName,
  moduleName = usePackage(),
  namespace = undefined,
}) {
  return {
    env,
    // This turns the installed "internal" dependencies into external dependencies
    external: [
      ...Object.keys(packageJson()?.dependencies ?? {}),
      moduleName === usePackage() ? null : usePackage(),
    ].filter(Boolean),

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

  // creates "globals" from the installed internal packages
  const globals = Object.keys(packageJson()?.dependencies ?? {}).reduce(
    (g, c) => Object.assign(g, { [c]: c }),
    {
      ...{ [usePackage()]: usePackage() },
    }
  );

  return {
    ...base,
    file: vxPath.packageDist(
      usePackage(),
      format,
      namespace,
      joinTruthy([moduleName, env, 'js'], '.')
    ),
    format,
    globals,
  };
}

function getInputFile(moduleName = usePackage()) {
  const currentPackage = usePackage();

  const modulePath = modulesPerPackage[currentPackage].find(
    ref => ref.name === moduleName
  );

  if (!(modulePath?.absolute && fs.existsSync(modulePath.absolute))) {
    throw new Error('unable to find module path for ' + moduleName);
  }

  return modulePath.absolute;
}
